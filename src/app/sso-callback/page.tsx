"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { GET_ACTIVE_ORDER } from "@/graphql/queries";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

const CLERK_AUTHENTICATE = gql`
  mutation Authenticate($input: ClerkAuthInput!) {
    authenticate(input: { clerk: $input }) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

type AuthenticateResult = {
  authenticate:
    | { __typename: "CurrentUser"; id: string; identifier: string }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthenticateVars = {
  input: {
    token: string;
    referralCode?: string;
  };
};

export default function SSOCallback() {
  const { getToken, isSignedIn } = useAuth();
  const { refetchUser } = useUser();
  const apollo = useApolloClient();
  const router = useRouter();
  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(
    CLERK_AUTHENTICATE
  );

  useEffect(() => {
    if (!isSignedIn) return;

    const handleAfterSignInOrUp = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No Clerk token available after OAuth redirect");

        const referralCode = sessionStorage.getItem("pendingReferralCode") ?? undefined;
        sessionStorage.removeItem("pendingReferralCode");

        const { data } = await authenticate({
          variables: {
            input: {
              token,
              ...(referralCode ? { referralCode } : {}),
            },
          },
        });

        const result = data?.authenticate;
        if (result?.__typename === "ErrorResult") {
          throw new Error(result.message ?? "Vendure authentication failed");
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

    handleAfterSignInOrUp();
  }, [isSignedIn]);

  return (
  <AuthenticateWithRedirectCallback
    signInFallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/"
  />
);
}