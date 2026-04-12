"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useMutation, useApolloClient } from "@apollo/client/react";
import { GET_CURRENT_USER, LOGIN, LOGOUT } from "@/graphql/queries";
import type {
  GetCurrentUserData,
  LoginData,
  LoginVars,
} from "@/graphql/auth.types.manual";
import { useClerk } from "@clerk/nextjs";

type Customer = GetCurrentUserData["activeCustomer"];

type UserCtx = {
  loading: boolean;
  customer: Customer | null | undefined;
  login: (u: string, p: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  setCustomerFromSSO: () => Promise<void>;
  retryGoogleLogin: () => Promise<void>;
};

const Ctx = createContext<UserCtx>({
  loading: false,
  customer: undefined,
  login: async () => {},
  logout: async () => {},
  refetchUser: async () => {},
  setCustomerFromSSO: async () => {},
  retryGoogleLogin: async () => {},
});

export const useUser = () => useContext(Ctx);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const apollo = useApolloClient();
  const clerk = useClerk();

  const [isActing, setIsActing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const initialFetchDone = useRef(false);

  // ─── Initial fetch on mount (once) ───────────────────────────────────────
  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    apollo
      .query<GetCurrentUserData>({
        query: GET_CURRENT_USER,
        fetchPolicy: "network-only",
      })
      .then((result) => {
        setCustomer(result.data?.activeCustomer ?? null);
      })
      .catch(() => setCustomer(null));
  }, [apollo]);

  const [loginMut] = useMutation<LoginData, LoginVars>(LOGIN);
  const [logoutMut] = useMutation(LOGOUT);

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  const login = async (username: string, password: string, rememberMe = true) => {
    setIsActing(true);
    try {
      const res = await loginMut({
        variables: { username, password, rememberMe },
      });
      const payload: any = res.data?.login;
      if (payload?.errorCode) throw new Error(payload.message ?? "Login failed");
      await refetchUser();
    } finally {
      setIsActing(false);
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = async () => {
    setIsActing(true);
    try {
      await logoutMut();
      await clerk.signOut();
      await apollo.clearStore();
      setCustomer(null);
    } finally {
      setIsActing(false);
    }
  };

  // ─── REFETCH USER ─────────────────────────────────────────────────────────
  const refetchUser = useCallback(async () => {
    const result = await apollo.query<GetCurrentUserData>({
      query: GET_CURRENT_USER,
      fetchPolicy: "network-only",
    });
    const newCustomer = result.data?.activeCustomer ?? null;
    setCustomer(newCustomer);
    apollo.writeQuery({ query: GET_CURRENT_USER, data: result.data });
  }, [apollo]);

  // ─── CALLED AFTER SSO (cookie is guaranteed set before this runs) ─────────
  // Retries up to 5x with 400ms gaps in case the cookie needs a moment
  const setCustomerFromSSO = useCallback(async () => {
    for (let i = 0; i < 5; i++) {
      const result = await apollo.query<GetCurrentUserData>({
        query: GET_CURRENT_USER,
        fetchPolicy: "network-only",
      });
      const found = result.data?.activeCustomer ?? null;
      if (found) {
        setCustomer(found);
        apollo.writeQuery({ query: GET_CURRENT_USER, data: result.data });
        return;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    // Fallback: set null so UI doesn't stay in loading limbo
    setCustomer(null);
  }, [apollo]);

  const retryGoogleLogin = async () => {};

  const value = useMemo(
    () => ({
      loading: isActing,
      customer,
      login,
      logout,
      refetchUser,
      setCustomerFromSSO,
      retryGoogleLogin,
    }),
    [isActing, customer, refetchUser, setCustomerFromSSO]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;