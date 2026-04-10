"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client/react";
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
  retryGoogleLogin: () => Promise<void>;
};

const Ctx = createContext<UserCtx>({
  loading: false,
  customer: undefined,
  login: async () => {},
  logout: async () => {},
  refetchUser: async () => {},
  retryGoogleLogin: async () => {},
});

export const useUser = () => useContext(Ctx);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const apollo = useApolloClient();
  const [isActing, setIsActing] = useState(false);

  const { data, loading, refetch } = useQuery<GetCurrentUserData>(
    GET_CURRENT_USER,
    {
      // cache-and-network: serves cached value instantly (so navbar
      // doesn't flicker) AND re-validates in the background.
      // Critically, writes results back to cache so all consumers update.
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [loginMut] = useMutation<LoginData, LoginVars>(LOGIN, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });

  const [logoutMut] = useMutation(LOGOUT, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });

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
      // Clear entire Apollo cache on logout so stale customer data
      // doesn't linger across sessions
      await apollo.clearStore();
      await refetch();
    } finally {
      setIsActing(false);
    }
  };

  // Retry with backoff — gives Vendure time to set the session cookie.
  // Called by AuthModal after Clerk setActive() and by sso-callback.
  const refetchUser = useCallback(async () => {
    // Attempt 1 — immediate
    const r1 = await refetch();
    if (r1.data?.activeCustomer) return;

    // Attempt 2 — wait 600ms then retry
    await new Promise((res) => setTimeout(res, 600));
    const r2 = await refetch();
    if (r2.data?.activeCustomer) return;

    // Attempt 3 — wait another 1s then final retry
    await new Promise((res) => setTimeout(res, 1000));
    await refetch();
  }, [refetch]);

  const retryGoogleLogin = async () => {};

  const value = useMemo<UserCtx>(
    () => ({
      loading: loading || isActing,
      customer: data?.activeCustomer,
      login,
      logout,
      refetchUser,
      retryGoogleLogin,
    }),
    [loading, isActing, data, refetchUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;