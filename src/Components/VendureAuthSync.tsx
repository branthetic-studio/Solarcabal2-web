"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useUser } from "@/context/UserContext";
import { CLERK_AUTHENTICATE, GET_ACTIVE_ORDER } from "@/graphql/queries";
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

export function VendureAuthSync() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const apollo = useApolloClient();
  const { customer, refetchUser } = useUser();
  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(
    CLERK_AUTHENTICATE
  );

  // Prevent double-firing on strict mode / re-renders
  const hasSynced = useRef(false);

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isLoaded) return;

    // User is signed into Clerk but NOT into Vendure yet
    // This is exactly the state after a Google OAuth redirect
    const isClerkSignedIn = isSignedIn;
    const isVendureSignedIn = !!customer?.id; // adjust to your UserContext shape

    if (!isClerkSignedIn || isVendureSignedIn || hasSynced.current) return;

    hasSynced.current = true;

    const sync = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Pull referral code saved before the Google redirect
        const referralCode =
          sessionStorage.getItem("pendingReferralCode") ?? undefined;

        const response = await authenticate({
          variables: {
            token,
            ...(referralCode && referralCode.trim().length >= 3
              ? { referralCode: referralCode.trim() }
              : {}),
          },
        });

        const result = response.data?.authenticate;
        if (!result) return;

        if (result.__typename === "ErrorResult") {
          console.error("[VendureAuthSync] Auth error:", result.message);
          hasSynced.current = false; // allow retry
          return;
        }

        // Clean up referral code
        sessionStorage.removeItem("pendingReferralCode");

        await refetchUser();
        await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });

        toast.success("Welcome! You're signed in");
      } catch (err: any) {
        console.error("[VendureAuthSync] Failed to sync:", err);
        hasSynced.current = false; // allow retry on next render
      }
    };

    sync();
  }, [isLoaded, isSignedIn, customer?.id]); // re-evaluates when auth state changes

  return null;
}