"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import apolloClient, {
  setTokenGetter,
  restoreCache,
  persistCacheToStorage,
  cache,
} from "../lib/apolloClient";

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    // ✅ Restore cache from localStorage synchronously before first render
    // This is what makes data appear instantly on reload instead of after
    // the network round-trip (~800ms later)
    restoreCache();
    setCacheReady(true);
  }, []);

  // ✅ Subscribe to cache writes and persist them to localStorage
  // Every time Apollo writes data (query result, mutation, writeQuery),
  // we debounce-save the full cache so the next reload starts with real data
  useEffect(() => {
    if (!cacheReady) return;

    const subscription = cache.watch({
      query: require("@/graphql/queries").GET_CURRENT_USER,
      optimistic: false,
      callback: () => persistCacheToStorage(),
    });

    return () => subscription();
  }, [cacheReady]);

  // ✅ Simpler alternative: persist on any cache change using a broadcast channel
  // We use the apolloClient's cache directly
  useEffect(() => {
    if (!cacheReady) return;

    // Patch writeQuery and writeFragment to trigger persistence
    const originalWriteQuery = apolloClient.writeQuery.bind(apolloClient);
    const originalWriteFragment = apolloClient.writeFragment.bind(apolloClient);

    apolloClient.writeQuery = (...args: any[]) => {
      const result = (originalWriteQuery as any)(...args);
      persistCacheToStorage();
      return result;
    };

    apolloClient.writeFragment = (...args: any[]) => {
      const result = (originalWriteFragment as any)(...args);
      persistCacheToStorage();
      return result;
    };

    return () => {
      apolloClient.writeQuery = originalWriteQuery;
      apolloClient.writeFragment = originalWriteFragment;
    };
  }, [cacheReady]);

  if (!cacheReady) return null;

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}