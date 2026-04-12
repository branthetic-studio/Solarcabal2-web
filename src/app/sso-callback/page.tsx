"use client";

import { useEffect, useRef } from "react";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { GET_ACTIVE_ORDER, CLERK_AUTHENTICATE } from "@/graphql/queries";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

type AuthenticateResult = {
  authenticate:
    | { __typename: "CurrentUser"; id: string }
    | { __typename: "ErrorResult"; message: string };
};

type AuthenticateVars = {
  token: string;
  referralCode?: string;
};

function PostAuthHandler() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { setCustomerFromSSO } = useUser(); // ✅ correct — no "user" in this context
  const apollo = useApolloClient();
  const hasRun = useRef(false);

  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(
    CLERK_AUTHENTICATE
  );

  const getTokenSafe = async (): Promise<string> => {
    for (let i = 0; i < 15; i++) {
      const token = await getToken({ skipCache: true });
      if (token) return token;
      await new Promise((r) => setTimeout(r, 400));
    }
    throw new Error("Unable to get Clerk token after retries");
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        const token = await getTokenSafe();

        const urlParams = new URLSearchParams(window.location.search);
        const referralCode =
          urlParams.get("ref")?.trim() ||
          sessionStorage.getItem("pendingReferralCode")?.trim() ||
          undefined;
        sessionStorage.removeItem("pendingReferralCode");

        const { data } = await authenticate({
          variables: { token, ...(referralCode ? { referralCode } : {}) },
        });

        const result = data?.authenticate;
        if (result?.__typename === "ErrorResult") {
          throw new Error(result.message ?? "Authentication failed");
        }

        await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
        await setCustomerFromSSO(); // ✅ this retries up to 5x until customer is set

        window.location.href = "/";
      } catch (err: any) {
        toast.error(err?.message ?? "Sign-in failed. Please try again.");
        window.location.href = "/";
      }
    };

    run();
  }, [isLoaded, isSignedIn]);

  return null;
}

export default function SSOCallback() {
  return (
    <>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/sso-callback"
        signUpFallbackRedirectUrl="/sso-callback"
      />
      <PostAuthHandler />
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm text-gray-500">Signing you in...</p>
        </div>
      </div>
    </>
  );
}