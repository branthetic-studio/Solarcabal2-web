import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
} from "@apollo/client";

let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const attachToken = tokenGetter ? tokenGetter() : Promise.resolve(null);
    attachToken
      .then((token) => {
        operation.setContext(({ headers = {} }: any) => ({
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }));
        forward(operation).subscribe(observer);
      })
      .catch(observer.error.bind(observer));
  });
});

const httpLink = new HttpLink({
  uri: "/api/graphql",
  credentials: "include",
});

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        activeCustomer: { merge: true },
      },
    },
  },
});

const CACHE_KEY = "apollo-cache-persist";

// ✅ Restore cache from localStorage (runs once on client before first render)
export function restoreCache(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    cache.restore(data);
    console.log("[Apollo] Cache restored from localStorage");
  } catch (e) {
    console.warn("[Apollo] Could not restore cache:", e);
    localStorage.removeItem(CACHE_KEY); // wipe corrupt data
  }
}

// ✅ Save cache to localStorage after every write
// Debounced to avoid thrashing on rapid mutations
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function persistCacheToStorage(): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const data = cache.extract();
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[Apollo] Could not persist cache:", e);
    }
  }, 300); // debounce 300ms
}

// ✅ Wipe persisted cache (call on logout)
export function clearPersistedCache(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    // ignore
  }
}

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

export default apolloClient;