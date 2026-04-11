"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { GET_ACTIVE_ORDER, CLERK_AUTHENTICATE } from "@/graphql/queries";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

type AuthenticateResult = {
  authenticate:
    | { __typename: "CurrentUser"; id: string; identifier: string }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthenticateVars = {
  token: string;
  referralCode?: string;
};

function PostAuthHandler() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { refetchUser } = useUser();
  const apollo = useApolloClient();
  const router = useRouter();
  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(CLERK_AUTHENTICATE);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Wait until Clerk is fully loaded AND user is signed in
    if (!isLoaded || !isSignedIn || hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      try {
        // Give Clerk a moment to fully commit the session
        await new Promise((r) => setTimeout(r, 800));

        const token = await getToken();
        console.log("🔵 [1] token:", token ? "✅" : "❌ null");
        if (!token) throw new Error("No Clerk token available");

        const urlParams = new URLSearchParams(window.location.search);
        const referralCode =
          urlParams.get("ref")?.trim() ||
          sessionStorage.getItem("pendingReferralCode")?.trim() ||
          undefined;
        sessionStorage.removeItem("pendingReferralCode");

        const { data } = await authenticate({
          variables: { token, ...(referralCode ? { referralCode } : {}) },
        });

        console.log("🔵 [2] authenticate result:", JSON.stringify(data, null, 2));

        const result = data?.authenticate;
        if (result?.__typename === "ErrorResult") {
          throw new Error(result.message ?? "Authentication failed");
        }

        await refetchUser();
        await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
        toast.success("Signed in successfully!");
      } catch (err: any) {
        console.error("🔵 ❌ SSO error:", err);
        toast.error(err?.message ?? "Sign-in failed. Please try again.");
      } finally {
        router.replace("/");
      }
    };

    run();
  }, [isLoaded, isSignedIn]); // ← watch both, run when BOTH are true

  return null;
}

// Separate wrapper that only mounts PostAuthHandler
// after AuthenticateWithRedirectCallback signals completion
export default function SSOCallback() {
  const [clerkDone, setClerkDone] = useState(false);

  return (
    <>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        // Called when Clerk finishes processing the OAuth callback
        afterSignInUrl="/sso-callback?clerk_done=1"
        afterSignUpUrl="/sso-callback?clerk_done=1"
      />
      {/* Only mount PostAuthHandler after clerk signals done */}
      <PostAuthHandler />
    </>
  );
}