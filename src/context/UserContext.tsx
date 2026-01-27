"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_CURRENT_USER, LOGIN, LOGOUT } from "@/graphql/queries";
import type {
  GetCurrentUserData,
  LoginData,
  LoginVars,
} from "@/graphql/auth.types.manual";

type UserCtx = {
  loading: boolean;
  me: GetCurrentUserData["me"] | null | undefined;
  customer: GetCurrentUserData["activeCustomer"] | null | undefined;
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<UserCtx>({
  loading: false,
  me: undefined,
  customer: undefined,
  login: async () => {},
  logout: async () => {},
});

export const useUser = () => useContext(Ctx);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, loading, refetch } = useQuery<GetCurrentUserData>(GET_CURRENT_USER, {
    fetchPolicy: "network-only", // always fetch fresh user data
  });

  const [isActing, setIsActing] = useState(false);

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
        context: { fetchOptions: { credentials: "include" } }, // ✅ important for cookies
      });

      const payload: any = res.data?.login;
      if (payload?.errorCode) {
        throw new Error(payload?.message ?? "Login failed");
      }

      // user data is refetched automatically via refetchQueries
    } finally {
      setIsActing(false);
    }
  };

  const logout = async () => {
    setIsActing(true);
    try {
      await logoutMut({ context: { fetchOptions: { credentials: "include" } } });
      await refetch();
    } finally {
      setIsActing(false);
    }
  };

  const value = useMemo<UserCtx>(
    () => ({
      loading: loading || isActing,
      me: data?.me,
      customer: data?.activeCustomer,
      login,
      logout,
    }),
    [loading, isActing, data]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;
