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
  const { data, loading, refetch } = useQuery<GetCurrentUserData>(
    GET_CURRENT_USER,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const [loginMut] = useMutation<LoginData, LoginVars>(LOGIN, {
    // refresh me/activeCustomer after login
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });

  const [logoutMut] = useMutation(LOGOUT, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
    awaitRefetchQueries: true,
  });

  const [isActing, setIsActing] = useState(false);

  const login = async (
    username: string,
    password: string,
    rememberMe = true
  ) => {
    setIsActing(true);
    try {
      const res = await loginMut({
        variables: { username, password, rememberMe },
      });
      const payload: any = res.data?.login;
      if (payload?.errorCode) {
        throw new Error(payload?.message ?? "Login failed");
      }
      // At this point, Vendure has set the session cookie
      // GET_CURRENT_USER is refetched by the mutation config
    } finally {
      setIsActing(false);
    }
  };

  const logout = async () => {
    setIsActing(true);
    try {
      await logoutMut();
      await refetch(); // makes sure UI sees null user
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
