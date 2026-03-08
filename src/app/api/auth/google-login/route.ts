import { NextRequest } from "next/server";
import { createClerkClient, verifyToken } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const VENDURE_URL = process.env.NEXT_PUBLIC_API_URL!;

async function vendureGQL(query: string, variables: Record<string, any>) {
  const res = await fetch(VENDURE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 400 });
    }

    console.log("📥 Clerk token received:", token.substring(0, 30) + "...");

    // ------------------------------------------------------------------
    // 1. Verify Clerk JWT and get user details
    // ------------------------------------------------------------------
    let clerkUserId: string;
    try {
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      clerkUserId = verified.sub;
    } catch (err) {
      console.error("Clerk token verification failed:", err);
      return Response.json({ error: "Invalid Clerk token" }, { status: 401 });
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";

    if (!email) {
      return Response.json({ error: "No email on Clerk account" }, { status: 400 });
    }

    console.log("✅ Clerk user verified:", email);

    const vendureSecret = process.env.CLERK_VENDURE_SECRET!;
    const derivedPassword = `clerk_${clerkUserId}_${vendureSecret}`;

    // ------------------------------------------------------------------
    // 2. Try login first (returning user)
    // ------------------------------------------------------------------
    let vendureRes = await vendureGQL(
      `mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
        login(username: $username, password: $password, rememberMe: $rememberMe) {
          ... on CurrentUser { id identifier }
          ... on ErrorResult { errorCode message }
        }
      }`,
      { username: email, password: derivedPassword, rememberMe: true }
    );

    let vendureData = await vendureRes.json();
    let loginResult = vendureData?.data?.login;

    // ------------------------------------------------------------------
    // 3. New user — register then verify then login
    // ------------------------------------------------------------------
    if (loginResult?.errorCode === "INVALID_CREDENTIALS_ERROR") {
      console.log("👤 New Google user — registering in Vendure:", email);

      const registerRes = await vendureGQL(
        `mutation Register($input: RegisterCustomerInput!) {
          registerCustomerAccount(input: $input) {
            ... on Success { success }
            ... on MissingPasswordError { errorCode message }
            ... on PasswordValidationError { errorCode message }
            ... on ErrorResult { errorCode message }
          }
        }`,
        {
          input: {
            emailAddress: email,
            firstName,
            lastName,
            password: derivedPassword,
          },
        }
      );

      const registerData = await registerRes.json();
      const registerResult = registerData?.data?.registerCustomerAccount;
      console.log("📋 Register result:", JSON.stringify(registerResult));

      if (registerResult?.errorCode) {
        // EMAIL_ADDRESS_CONFLICT means account exists but with wrong password
        // (e.g. user registered manually before using Google)
        if (registerResult.errorCode === "EMAIL_ADDRESS_CONFLICT_ERROR") {
          return Response.json(
            { error: "An account with this email already exists. Please log in with your password." },
            { status: 409 }
          );
        }
        console.error("Vendure registration failed:", registerResult.message);
        return Response.json({ error: registerResult.message }, { status: 400 });
      }

      // ------------------------------------------------------------------
      // 4. Vendure requires email verification by default.
      //    We bypass it by verifying the customer directly via admin API,
      //    OR by using verifyCustomerEmailAddress with a workaround.
      //
      //    Simplest fix: disable email verification in Vendure config:
      //      authOptions: { requireVerification: false }
      //
      //    If you can't change Vendure config, use the admin API to verify.
      //    Set VENDURE_ADMIN_URL + VENDURE_ADMIN_TOKEN in your .env
      // ------------------------------------------------------------------
      const adminUrl = process.env.VENDURE_ADMIN_URL;
      const adminToken = process.env.VENDURE_ADMIN_TOKEN;

      if (adminUrl && adminToken) {
        // Verify via admin API
        console.log("🔑 Verifying customer via admin API...");
        try {
          await fetch(adminUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              query: `
                mutation VerifyCustomer($emailAddress: String!) {
                  updateCustomer(input: { emailAddress: $emailAddress }) {
                    id
                    verified
                  }
                }
              `,
              variables: { emailAddress: email },
            }),
          });
        } catch (adminErr) {
          console.warn("Admin verification failed (non-fatal):", adminErr);
        }
      }

      // Try login after registration
      vendureRes = await vendureGQL(
        `mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
          login(username: $username, password: $password, rememberMe: $rememberMe) {
            ... on CurrentUser { id identifier }
            ... on ErrorResult { errorCode message }
          }
        }`,
        { username: email, password: derivedPassword, rememberMe: true }
      );

      vendureData = await vendureRes.json();
      loginResult = vendureData?.data?.login;

      // ------------------------------------------------------------------
      // 5. If still failing, it's the email verification requirement.
      //    Return a helpful error so the client can show a message.
      // ------------------------------------------------------------------
      if (loginResult?.errorCode === "NOT_VERIFIED_ERROR" ||
          loginResult?.errorCode === "INVALID_CREDENTIALS_ERROR") {
        console.error(
          "⚠️ Vendure requires email verification. " +
          "Set requireVerification: false in your Vendure authOptions, " +
          "or provide VENDURE_ADMIN_URL + VENDURE_ADMIN_TOKEN to auto-verify."
        );
        return Response.json(
          {
            error: "VERIFICATION_REQUIRED",
            message: "Account created. Please check your email to verify before logging in, or disable requireVerification in Vendure config.",
          },
          { status: 403 }
        );
      }
    }

    console.log("📤 Vendure login result:", JSON.stringify(loginResult, null, 2));

    if (!loginResult || loginResult.errorCode) {
      return Response.json(
        { error: loginResult?.message ?? "Vendure login failed" },
        { status: 401 }
      );
    }

    // Forward Vendure's session cookie to the browser
    const setCookie = vendureRes.headers.get("set-cookie");
    const headers = new Headers({ "Content-Type": "application/json" });
    if (setCookie) headers.set("set-cookie", setCookie);

    return new Response(JSON.stringify({ user: loginResult }), { status: 200, headers });

  } catch (err) {
    console.error("google-login route error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}