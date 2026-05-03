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
import { useClerk, useAuth } from "@clerk/nextjs";
import { clearPersistedCache } from "../lib/apolloClient";

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

// ✅ SAFETY: ensure plain objects only
function toPlain<T>(data: T): T {
  return data ? JSON.parse(JSON.stringify(data)) : data;
}

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const apollo = useApolloClient();
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);

  const hasInitialized = useRef(false);

  // 🚀 SINGLE SOURCE OF TRUTH INIT
  useEffect(() => {
    if (!isLoaded) return;

    // prevent duplicate runs
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // 1. Instant UI from cache (no flicker)
    const cached = apollo.readQuery<GetCurrentUserData>({
      query: GET_CURRENT_USER,
    });

    if (cached?.activeCustomer !== undefined) {
      setCustomer(toPlain(cached.activeCustomer ?? null));
      setLoading(false);
    }

    // 2. If NOT signed in → stop here (no backend call)
    if (!isSignedIn) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    // 3. If signed in → validate once (no duplicate queries)
    apollo
      .query<GetCurrentUserData>({
        query: GET_CURRENT_USER,
        fetchPolicy: "network-only",
      })
      .then((res) => {
        const fresh = res.data?.activeCustomer ?? null;

        setCustomer(toPlain(fresh));

        apollo.writeQuery({
          query: GET_CURRENT_USER,
          data: toPlain(res.data),
        });
      })
      .catch(() => {
        setCustomer(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, apollo]);

  const [loginMut] = useMutation<LoginData, LoginVars>(LOGIN);
  const [logoutMut] = useMutation(LOGOUT);

  // 🔐 LOGIN
  const login = async (username: string, password: string, rememberMe = true) => {
    setLoading(true);
    try {
      const res = await loginMut({
        variables: { username, password, rememberMe },
      });

      const payload: any = res.data?.login;
      if (payload?.errorCode) throw new Error(payload.message ?? "Login failed");

      await refetchUser(); // single refresh
    } finally {
      setLoading(false);
    }
  };

  // 🔓 LOGOUT (clean + stable)
  const logout = async () => {
    setLoading(true);
    try {
      await logoutMut();

      clearPersistedCache(); // wipe local cache
      await apollo.clearStore(); // clear memory cache

      setCustomer(null); // MUST be null

      await clerk.signOut();

      hasInitialized.current = false; // allow fresh init next time
    } finally {
      setLoading(false);
    }
  };

  // 🔄 REFETCH (used after login)
  const refetchUser = useCallback(async () => {
    const res = await apollo.query<GetCurrentUserData>({
      query: GET_CURRENT_USER,
      fetchPolicy: "network-only",
    });

    const fresh = res.data?.activeCustomer ?? null;

    setCustomer(toPlain(fresh));

    apollo.writeQuery({
      query: GET_CURRENT_USER,
      data: toPlain(res.data),
    });
  }, [apollo]);

  // 🔁 SSO (retry-safe)
  const setCustomerFromSSO = useCallback(async () => {
    for (let i = 0; i < 5; i++) {
      const res = await apollo.query<GetCurrentUserData>({
        query: GET_CURRENT_USER,
        fetchPolicy: "network-only",
      });

      const found = res.data?.activeCustomer ?? null;

      if (found) {
        setCustomer(toPlain(found));

        apollo.writeQuery({
          query: GET_CURRENT_USER,
          data: toPlain(res.data),
        });

        return;
      }

      await new Promise((r) => setTimeout(r, 400));
    }

    setCustomer(null);
  }, [apollo]);

  const value = useMemo(
    () => ({
      loading,
      customer,
      login,
      logout,
      refetchUser,
      setCustomerFromSSO,
      retryGoogleLogin: async () => {},
    }),
    [loading, customer, refetchUser, setCustomerFromSSO]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default UserProvider;