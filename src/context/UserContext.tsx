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
  customer: undefined,
  login: async () => { },
  logout: async () => { },
});

export const useUser = () => useContext(Ctx);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, loading, refetch } = useQuery<GetCurrentUserData>(
    GET_CURRENT_USER,
    {
      fetchPolicy: "network-only", // always fetch fresh user data
    }
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

  const login = async (
    username: string,
    password: string,
    rememberMe = true
  ) => {
    setIsActing(true);
    try {
      console.log("🔵 LOGIN: Sending mutation...", { username, rememberMe });

      const res = await loginMut({
        variables: { username, password, rememberMe },
        context: { fetchOptions: { credentials: "include" } },
      });

      console.log("🟢 LOGIN: Full response:", res);
      console.log("🟢 LOGIN: Response data:", res.data);
      console.log("🟢 LOGIN: Login payload:", res.data?.login);

      const payload: any = res.data?.login;

      console.log("🟢 LOGIN: Payload __typename:", payload?.__typename);
      console.log("🟢 LOGIN: Payload errorCode:", payload?.errorCode);
      console.log("🟢 LOGIN: Payload message:", payload?.message);

      if (payload?.errorCode) {
        console.error("❌ LOGIN: Error detected:", payload);
        throw new Error(payload?.message ?? "Login failed");
      }

      console.log("✅ LOGIN: Success!");
      // user data is refetched automatically via refetchQueries
    } catch (error) {
      console.error("❌ LOGIN: Exception caught:", error);
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

  const value = useMemo<UserCtx>(
    () => ({
      loading: loading || isActing,
      customer: data?.activeCustomer,
      login,
      logout,
    }),
    [loading, isActing, data]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;