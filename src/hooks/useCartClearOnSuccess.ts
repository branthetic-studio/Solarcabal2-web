// // src/hooks/useCartClearOnSuccess.ts
// import { useEffect } from "react";
// import { useLocalCart } from "@/context/LocalCartContext";
 
// export function useCartClearOnSuccess() {
//   const { clearCart } = useLocalCart();
 
//   useEffect(() => {
//     try {
//       const flag = sessionStorage.getItem("paymentSuccess");
//       if (flag !== "true") return;
//       sessionStorage.removeItem("paymentSuccess");
//       clearCart();
//     } catch (_) {}
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
// }
 


// src/hooks/useCartClearOnSuccess.ts
// import { useEffect } from "react";
// import { useLocalCart } from "@/context/LocalCartContext";

// const STORAGE_KEY = "localCart:v1";

// export function useCartClearOnSuccess() {
//   const { clearCart } = useLocalCart();

//   useEffect(() => {
//     try {
//       // Check both the sessionStorage flag AND directly check if localStorage
//       // was already wiped by the checkout page's onSuccess callback
//       const flag = sessionStorage.getItem("paymentSuccess");
//       const stored = localStorage.getItem(STORAGE_KEY);

//       if (flag === "true" || stored === "[]" || stored === null) {
//         // Clear the flag
//         sessionStorage.removeItem("paymentSuccess");
//         // Wipe localStorage directly (in case React state hasn't caught up)
//         localStorage.removeItem(STORAGE_KEY);
//         // Sync React state via context
//         clearCart();
//       }
//     } catch (_) {}
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
// }


// src/hooks/useCartClearOnSuccess.ts
import { useEffect } from "react";
import { useLocalCart } from "@/context/LocalCartContext";

const STORAGE_KEY = "localCart:v1";

export function useCartClearOnSuccess() {
  const { clearCart, items } = useLocalCart();

  // Run on mount — wipe localStorage and sync React state
  useEffect(() => {
    const flag = sessionStorage.getItem("paymentSuccess");
    if (flag !== "true") return;

    // Clear the flag immediately so we don't loop
    sessionStorage.removeItem("paymentSuccess");

    // Wipe localStorage directly
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (_) {}

    // Sync React state
    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also watch: if localStorage was wiped but React state still has items,
  // force a sync. This handles the case where LocalCartContext already
  // hydrated from localStorage before onSuccess ran.
  useEffect(() => {
    if (items.length === 0) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored || stored === "[]") {
        clearCart();
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);
}