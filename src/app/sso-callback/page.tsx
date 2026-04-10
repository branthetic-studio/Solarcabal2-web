"use client";

import { useEffect, useRef } from "react";
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

export default function SSOCallback() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { refetchUser } = useUser();
  const apollo = useApolloClient();
  const router = useRouter();

  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(CLERK_AUTHENTICATE);

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No Clerk token available");

        const urlParams = new URLSearchParams(window.location.search);
        const referralCode =
          urlParams.get("ref")?.trim() ||
          sessionStorage.getItem("pendingReferralCode")?.trim() ||
          undefined;

        sessionStorage.removeItem("pendingReferralCode");

        const { data } = await authenticate({
          variables: {
            token,
            ...(referralCode ? { referralCode } : {}),
          },
        });

        const result = data?.authenticate;
        if (result?.__typename === "ErrorResult") {
          throw new Error(result.message ?? "Authentication failed");
        }

        await refetchUser();
        await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
        toast.success("Signed in successfully!");
      } catch (err: any) {
        console.error("SSO callback error:", err);
        toast.error(err?.message ?? "Sign-in failed. Please try again.");
      } finally {
        router.replace("/");
      }
    };

    run();
  }, [isLoaded, isSignedIn, getToken, authenticate, apollo, refetchUser, router]);

  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    />
  );
}