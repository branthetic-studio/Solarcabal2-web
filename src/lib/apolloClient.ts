import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat } from "@apollo/client";

// ✅ Replace with your actual backend GraphQL endpoint
const httpLink = new HttpLink({
  uri: "/api/graphql-proxy", 
});

// ✅ Middleware to add Authorization header
const authMiddleware = new ApolloLink((operation, forward) => {
  // Get token from localStorage (or cookies, depending on your setup)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ only add if token exists
    },
  }));

  return forward(operation);
});

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
});

export default client;
