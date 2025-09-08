"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import client from "@/lib/apolloClient"; // adjust path if needed
import { ApolloProvider } from "@apollo/client/react";

const INTROSPECTION_QUERY = gql`
  {
    __schema {
      queryType {
        name
      }
      types {
        name
        kind
      }
    }
  }
`;

function SchemaViewer() {
  const { data, loading, error } = useQuery(INTROSPECTION_QUERY);

  if (loading) return <p>Loading schema...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function TestSchemaPage() {
  return (
    <ApolloProvider client={client}>
      <SchemaViewer />
    </ApolloProvider>
  );
}
