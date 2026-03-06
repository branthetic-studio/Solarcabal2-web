"use client";

import React, { createContext, useContext, useEffect, useRef, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { GET_CURRENT_USER, LOGIN, LOGOUT } from "@/graphql/queries";
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
};

const Ctx = createContext<UserCtx>({
  loading: false,
  customer: undefined,
  login: async () => { },
  logout: async () => { },
  refetchUser: async () => { },
});

export const useUser = () => useContext(Ctx);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
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

  // ---------------------------------------------------------------------------
  // Google → Vendure bridge
  //
  // Lives here (always mounted) instead of AuthModal (unmounted after redirect).
  // Fires once per unique googleToken — the ref persists across re-renders.
  // ---------------------------------------------------------------------------
  const lastGoogleToken = useRef<string | null>(null);

  useEffect(() => {
    const googleToken = session?.googleToken;
    if (!googleToken || googleToken === lastGoogleToken.current) return;

    lastGoogleToken.current = googleToken; // deduplicate

    (async () => {
      try {
        const res = await fetch("/api/auth/google-login", {
          method: "POST",
          credentials: "include", // lets browser receive Vendure's Set-Cookie
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: googleToken }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          console.error("Vendure Google auth failed:", data.error);
          return;
        }

        // Refresh Vendure session → triggers navbar/customer to update
        await refetch();
      } catch (err) {
        console.error("Vendure Google auth error:", err);
      }
    })();
  }, [session?.googleToken]);

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
    }),
    [loading, isActing, data]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;