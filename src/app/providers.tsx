"use client";

import React, { useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { Observable } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const authLink = new ApolloLink((operation, forward) => {
      // getToken() is async, so we use setContext via a promise
      return new Observable((observer) => {
        getToken().then((token) => {
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }));
          forward(operation).subscribe(observer);
        }).catch(observer.error.bind(observer));
      });
    });

    const httpLink = new HttpLink({
      uri: "/api/graphql",
      credentials: "include",
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              activeCustomer: { merge: true },
            },
          },
        },
      }),
    });
  }, [getToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}