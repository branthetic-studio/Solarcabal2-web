"use client";

import React, { createContext, useContext, useEffect, useRef, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useAuth } from "@clerk/nextjs";
import { GET_CURRENT_USER, LOGIN, LOGOUT } from "@/graphql/queries";
import { toast } from "sonner";
import type {
  GetCurrentUserData,
  LoginData,
  LoginVars,
} from "@/graphql/auth.types.manual";

type UserCtx = {
  loading: boolean;
  customer: GetCurrentUserData["activeCustomer"] | null | undefined;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  retryGoogleLogin: () => Promise<void>;
};

const Ctx = createContext<UserCtx>({
  loading: false,
  customer: undefined,
  login: async () => { },
  logout: async () => { },
  refetchUser: async () => { },
  retryGoogleLogin: async () => { },
});

export const useUser = () => useContext(Ctx);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, getToken } = useAuth();

  const { data, loading, refetch } = useQuery<GetCurrentUserData>(
    GET_CURRENT_USER,
    { fetchPolicy: "network-only" }
  );

  const [isActing, setIsActing] = useState(false);

  const [loginMut] = useMutation<LoginData, LoginVars>(LOGIN, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });

  const [logoutMut] = useMutation(LOGOUT, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });

  const processedToken = useRef<string | null>(null);
  const isBridging = useRef(false);

  // ---------------------------------------------------------------------------
  // Core bridge function — extracted so retryGoogleLogin can call it too
  // ---------------------------------------------------------------------------
  const bridgeToVendure = async (showToasts = true) => {
    if (!isSignedIn) return;
    if (data?.activeCustomer) return;
    if (isBridging.current) return;

    try {
      isBridging.current = true;

      const clerkToken = await getToken();
      if (!clerkToken) return;

      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: clerkToken }),
      });

      const json = await res.json();

      // Email verification required — account was just created
      if (res.status === 403 && json.error === "VERIFICATION_REQUIRED") {
        if (showToasts) {
          toast.error("Please verify your email to continue.", {
            description: (
              <span>
                We sent a verification link to your inbox.
                Once verified, click{" "}
                <strong>Retry sign-in</strong> below.
              </span>
            ) as any,
            action: {
              label: "Retry sign-in",
              onClick: () => {
                // Reset processed token so bridge runs again
                processedToken.current = null;
                bridgeToVendure(true);
              },
            },
            duration: 30000, // keep visible for 30s
          });
        }
        return;
      }

      if (res.status === 409) {
        if (showToasts) {
          toast.error("An account with this email already exists.", {
            description: "Please log in with your email and password instead.",
            duration: 8000,
          });
        }
        return;
      }

      if (!res.ok || json.error) {
        console.error("Vendure Google auth failed:", json.error);
        return;
      }

      processedToken.current = clerkToken;
      await refetch();

      if (showToasts) {
        toast.success("✅ Signed in with Google");
      }
    } catch (err) {
      console.error("Vendure Google auth error:", err);
    } finally {
      isBridging.current = false;
    }
  };

  // ---------------------------------------------------------------------------
  // Auto-bridge when Clerk signs in
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSignedIn) {
      processedToken.current = null;
      isBridging.current = false;
      return;
    }
    if (data?.activeCustomer) return;

    bridgeToVendure(true);
  }, [isSignedIn, data?.activeCustomer]);

  // ---------------------------------------------------------------------------
  // Public retry — called from the toast action button
  // ---------------------------------------------------------------------------
  const retryGoogleLogin = async () => {
    processedToken.current = null;
    await bridgeToVendure(true);
  };

  // ---------------------------------------------------------------------------
  // Login / Logout
  // ---------------------------------------------------------------------------
  const login = async (username: string, password: string, rememberMe = true) => {
    setIsActing(true);
    try {
      const res = await loginMut({
        variables: { username, password, rememberMe },
        context: { fetchOptions: { credentials: "include" } },
      });
      const payload: any = res.data?.login;
      if (payload?.errorCode) {
        throw new Error(payload?.message ?? "Login failed");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsActing(false);
    }
  };

  const logout = async () => {
    setIsActing(true);
    try {
      await logoutMut({
        context: { fetchOptions: { credentials: "include" } },
      });
      await refetch();
    } finally {
      setIsActing(false);
    }
  };

  const refetchUser = async () => {
    await refetch();
  };

  const value = useMemo<UserCtx>(
    () => ({
      loading: loading || isActing,
      customer: data?.activeCustomer,
      login,
      logout,
      refetchUser,
      retryGoogleLogin,
    }),
    [loading, isActing, data]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;