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

  const hasSynced = useRef(false);

  // ✅ Reset sync flag when user signs out so next login triggers a fresh sync
  const prevSignedIn = useRef(isSignedIn);
  useEffect(() => {
    if (prevSignedIn.current && !isSignedIn) {
      hasSynced.current = false;
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;

    const isClerkSignedIn = isSignedIn;
    const isVendureSignedIn = !!customer?.id;

    // ✅ All three must be true before we attempt sync:
    // 1. Clerk has a session
    // 2. Vendure does NOT yet have a matching session (avoid re-syncing)
    // 3. We haven't already synced this session
    if (!isClerkSignedIn || isVendureSignedIn || hasSynced.current) return;

    hasSynced.current = true;

    const sync = async () => {
      try {
        const token = await getToken();
        if (!token) {
          hasSynced.current = false;
          return;
        }

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
        if (!result) {
          hasSynced.current = false;
          return;
        }

        if (result.__typename === "ErrorResult") {
          console.error("[VendureAuthSync] Auth error:", result.message);
          hasSynced.current = false;
          return;
        }

        sessionStorage.removeItem("pendingReferralCode");

        // ✅ refetchUser first — this updates UserContext so customer becomes
        // non-null, which unblocks CartContext's skip gate and triggers
        // GET_ACTIVE_ORDER with the now-authenticated session
        await refetchUser();

        // ✅ Then explicitly refetch the cart with the authenticated session
        await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });

        toast.success("Welcome! You're signed in");
      } catch (err: any) {
        console.error("[VendureAuthSync] Failed to sync:", err);
        hasSynced.current = false;
      }
    };

    sync();
  }, [isLoaded, isSignedIn, customer?.id]);

  return null;
}