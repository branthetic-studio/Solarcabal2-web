import { useEffect, useRef } from "react";
import { useLocalCart } from "@/context/LocalCartContext";

type AddToCartFn = (vars: {
  productVariantId: string;
  quantity: number;
}) => Promise<any>;

export function useSyncCartOnLogin(
  isLoggedIn: boolean,
  addToCartMutation: AddToCartFn,
  clearLocalCart: () => void
) {
  const { items } = useLocalCart();
  const hasSynced = useRef(false);
  const itemsRef = useRef(items);

  // Keep a stable ref to latest items without re-triggering sync
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Run sync once when user becomes logged in
  useEffect(() => {
    if (!isLoggedIn || hasSynced.current) return;

    hasSynced.current = true;
    const snapshot = itemsRef.current;
    if (snapshot.length === 0) return;

    const sync = async () => {
      for (const item of snapshot) {
        try {
          await addToCartMutation({
            productVariantId: item.id,
            quantity: item.quantity,
          });
        } catch (e) {
          console.error(`[SyncCart] Failed to sync "${item.name}":`, e);
        }
      }
      clearLocalCart();
    };

    sync();
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset flag on logout so next login syncs again
  useEffect(() => {
    if (!isLoggedIn) {
      hasSynced.current = false;
    }
  }, [isLoggedIn]);
}