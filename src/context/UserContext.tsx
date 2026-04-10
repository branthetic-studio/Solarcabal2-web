"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  useMutation,
  useQuery,
  useApolloClient,
} from "@apollo/client/react";

import {
  GET_CURRENT_USER,
  LOGIN,
  LOGOUT,
} from "@/graphql/queries";

import type {
  GetCurrentUserData,
  LoginData,
  LoginVars,
} from "@/graphql/auth.types.manual";

import { useClerk } from "@clerk/nextjs";

type UserCtx = {
  loading: boolean;
  customer: GetCurrentUserData["activeCustomer"] | null | undefined;
  login: (u: string, p: string, remember?: boolean) => Promise<void>;
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
  const clerk = useClerk();

  const [isActing, setIsActing] = useState(false);

  const { data, loading, refetch } = useQuery<GetCurrentUserData>(
    GET_CURRENT_USER,
    {
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [loginMut] = useMutation<LoginData, LoginVars>(LOGIN);

  const [logoutMut] = useMutation(LOGOUT);

  // ---------------- LOGIN ----------------
  const login = async (
    username: string,
    password: string,
    rememberMe = true
  ) => {
    setIsActing(true);

    try {
      const res = await loginMut({
        variables: { username, password, rememberMe },
        context: { fetchOptions: { credentials: "include" } },
      });

      const payload: any = res.data?.login;

      if (payload?.errorCode) {
        throw new Error(payload.message ?? "Login failed");
      }

      // 🔥 IMPORTANT: refresh everything after login
      await refetch();
      await apollo.resetStore();
    } finally {
      setIsActing(false);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    setIsActing(true);

    try {
      // 1. backend logout (Vendure)
      await logoutMut({
        context: { fetchOptions: { credentials: "include" } },
      });

      // 2. clear Apollo cache + reset store (VERY IMPORTANT)
      await apollo.clearStore();
      await apollo.resetStore();

      // 3. logout Clerk safely (ONLY here, NOT during login)
      await clerk.signOut();

      // 4. refetch user
      await refetch();
    } finally {
      setIsActing(false);
    }
  };

  // ---------------- REFRESH USER ----------------
  const refetchUser = useCallback(async () => {
    const r1 = await refetch();
    if (r1.data?.activeCustomer) return;

    await new Promise((r) => setTimeout(r, 500));

    const r2 = await refetch();
    if (r2.data?.activeCustomer) return;

    await new Promise((r) => setTimeout(r, 1000));

    await refetch();
  }, [refetch]);

  const retryGoogleLogin = async () => {};

  const value = useMemo(
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