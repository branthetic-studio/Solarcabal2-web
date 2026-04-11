"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { GET_ACTIVE_ORDER, CLERK_AUTHENTICATE, GET_CURRENT_USER } from "@/graphql/queries";
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

// ← Separate inner component so it only runs AFTER
// AuthenticateWithRedirectCallback has finished
function PostAuthHandler() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { refetchUser } = useUser();
  const apollo = useApolloClient();
  const router = useRouter();
  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(CLERK_AUTHENTICATE);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Run as soon as Clerk is loaded, don't wait for isSignedIn to change
    if (!isLoaded || hasRunRef.current) return;
    if (!isSignedIn) {
      // Not signed in at all — just redirect
      router.replace("/");
      return;
    }

    hasRunRef.current = true;

    const run = async () => {
      try {
        await new Promise((r) => setTimeout(r, 500));

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
  }, [isLoaded]); // ← only depend on isLoaded, not isSignedIn

  return null;
}

export default function SSOCallback() {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
      <PostAuthHandler />
    </>
  );
}