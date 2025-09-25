"use client";

import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";

export type LocalCartItem = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  priceWithTax: number;
  currencyCode: string;
  quantity: number;
  brand?: string;
};

interface LocalCartContextType {
  items: LocalCartItem[];
  getCount: () => number;
  getTotal: () => number;
  addItem: (
    item: Omit<LocalCartItem, "quantity"> & { quantity?: number }
  ) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const initialData: LocalCartContextType = {
  items: [],
  getCount: () => 0,
  getTotal: () => 0,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
};

const LocalCartContext = createContext<LocalCartContextType>(initialData);

export const useLocalCart = () => useContext(LocalCartContext);

const STORAGE_KEY = "localCart:v1";

function isValidItems(payload: any): payload is LocalCartItem[] {
  return (
    Array.isArray(payload) &&
    payload.every(
      (it) =>
        it &&
        typeof it.id === "string" &&
        typeof it.name === "string" &&
        typeof it.slug === "string" &&
        typeof it.priceWithTax === "number" &&
        typeof it.currencyCode === "string" &&
        typeof it.quantity === "number"
    )
  );
}

function save(items: LocalCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("[LocalCart] Failed to persist to localStorage:", e);
  }
}

const LocalCartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (isValidItems(parsed)) {
        setItems(parsed);
      } else {
        console.warn("[LocalCart] Invalid stored payload; clearing");
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("[LocalCart] Failed to parse stored payload; clearing", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Derived helpers
  const getCount = useMemo(() => {
    return () => items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotal = useMemo(() => {
    return () => items.reduce((t, it) => t + it.priceWithTax * it.quantity, 0);
  }, [items]);

  // Mutators (each one writes-through)
  const addItem = (
    newItem: Omit<LocalCartItem, "quantity"> & { quantity?: number }
  ) => {
    const quantity = newItem.quantity || 1;
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === newItem.id);
      const next =
        idx >= 0
          ? prev.map((it, i) =>
              i === idx ? { ...it, quantity: it.quantity + quantity } : it
            )
          : [...prev, { ...newItem, quantity }];
      save(next);
      return next;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, quantity } : it));
      save(next);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      save(next);
      return next;
    });
  };

  const clearCart = () => {
    setItems(() => {
      const next: LocalCartItem[] = [];
      save(next);
      return next;
    });
  };

  const value: LocalCartContextType = useMemo(
    () => ({
      items,
      getCount,
      getTotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, getCount, getTotal]
  );

  return (
    <LocalCartContext.Provider value={value}>
      {children}
    </LocalCartContext.Provider>
  );
};

export default LocalCartProvider;
