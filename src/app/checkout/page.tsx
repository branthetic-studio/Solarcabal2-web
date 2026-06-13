"use client";
import React, { Suspense, useMemo, useState, useEffect, useRef } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StaticImageData } from "next/image";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";

import {
  ADD_TO_CART,
  GET_ACTIVE_ORDER,
  GET_SHIPPING_METHODS,
  GET_CUSTOMER_ADDRESSES,
  SET_SHIPPING_METHOD,
  SET_SHIPPING_ADDRESS,
  TRANSITION_TO_STATE,
  PAYSTACK_INTENT,
  RECREATE_FAILED_ORDER,
} from "@/graphql/queries";

import Suscribe from "@/Components/Suscribe/Suscribe";
import AddressModal from "@/Components/AddressModal";
import InstallmentPayment, { InstallmentPlan } from "@/Components/Installmentpayment";

/* ------------------- Types ------------------- */

type PaymentMethod = string;

type ActiveOrderLine = {
  id: string;
  quantity: number;
  linePriceWithTax: number;
  featuredAsset?: { id?: string; preview?: string | null } | null;
  productVariant?: {
    id?: string;
    name?: string;
    product?: { slug?: string } | null;
  } | null;
};

type ActiveOrder = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  subTotalWithTax?: number | null;
  lines: ActiveOrderLine[];
  customer?: { emailAddress?: string | null } | null;
  shippingAddress?: {
    fullName?: string | null;
    streetLine1?: string | null;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    countryCode?: string | null;
    phoneNumber?: string | null;
  } | null;
  shippingLines?: {
    shippingMethod?: { description?: string | null } | null;
    priceWithTax?: number;
  }[];
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type SetShippingAddressResponse = {
  setOrderShippingAddress: ActiveOrder | { errorCode: string; message: string };
};

type TransitionToStateResponse = {
  transitionOrderToState:
    | ActiveOrder
    | {
        __typename: "OrderStateTransitionError";
        errorCode: string;
        message: string;
        transitionError: string;
        fromState: string;
        toState: string;
      };
};

interface InfoRowProps {
  icon: string | StaticImageData;
  title: string;
  text: string;
}

type PaystackTransactionConfig = {
  key: string;
  email: string;
  amount: number;
  reference: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
};

type PaystackIntentData = {
  createPaystackPaymentIntent: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
    amount: number;
  };
};

type SavedAddress = {
  id: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  streetLine1?: string | null;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  defaultShippingAddress?: boolean | null;
  country?: { code: string } | null;
};

type GetCustomerAddressesData = {
  activeCustomer: {
    id: string;
    addresses: SavedAddress[];
  } | null;
};

/* ------------------- Helpers ------------------- */

function extractErrorMessage(err: unknown): string {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const e = err as any;
  if (e?.graphQLErrors?.length) {
    return e.graphQLErrors.map((g: any) => g.message).join(", ");
  }
  if (e?.networkError?.message) return `Network error: ${e.networkError.message}`;
  if (e?.message) return e.message;
  try { return JSON.stringify(err); } catch { return "An unknown error occurred."; }
}

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const formatNaira = (kobo: number) => NGN.format(kobo / 100);

async function recoverArrangingPaymentOrder(
  order: ActiveOrder,
  transitionToState: Function,
  recreateFailedOrder: Function,
  refetchActiveOrder: Function,
  setShippingMethodsReady: (v: boolean) => void
): Promise<ActiveOrder | null> {
  try {
    const result = await transitionToState({ variables: { state: "AddingItems" } });
    const response = result.data?.transitionOrderToState;
    if (response && "id" in response) {
      const refreshed = await refetchActiveOrder();
      const recovered = refreshed.data?.activeOrder;
      if (recovered && recovered.lines.length > 0 && recovered.state !== "ArrangingPayment") {
        setShippingMethodsReady(true);
      }
      return recovered ?? null;
    }
    console.warn("[checkout] transitionToState(AddingItems) failed:", response?.message ?? "unknown error");
  } catch (e) {
    console.warn("[checkout] transitionToState(AddingItems) threw, trying recreate:", extractErrorMessage(e));
  }

  try {
    await recreateFailedOrder({ variables: { orderCode: order.code } });
    const refreshed = await refetchActiveOrder();
    const recovered = refreshed.data?.activeOrder;
    if (recovered && recovered.lines.length > 0 && recovered.state !== "ArrangingPayment") {
      setShippingMethodsReady(true);
    }
    return recovered ?? null;
  } catch (e) {
    console.error("[checkout] recreateFailedOrder also failed:", extractErrorMessage(e));
    throw e;
  }
}

/* ------------------- Inner Page ------------------- */
function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { customer } = useUser();
  const { cart, handleAdjustQuantity, removeFromCartMutation, getOrderLineIdByVariantId } = useCart();
  const { items: localItems, updateQuantity: updateLocalQuantity, removeItem: removeLocalItem, clearCart } = useLocalCart();

  const [method, setMethod] = useState<PaymentMethod>("paystack");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  // ── Fetch saved addresses and auto-fill default on mount ─────────────────
  const { data: addressesData } = useQuery<GetCustomerAddressesData>(
    GET_CUSTOMER_ADDRESSES,
    {
      skip: !customer?.id,
      fetchPolicy: "cache-and-network",
    }
  );

  const savedAddresses = addressesData?.activeCustomer?.addresses ?? [];

  // Auto-fill shippingAddress with the default saved address when:
  // 1. Saved addresses have loaded
  // 2. The active server order has no address yet
  // 3. The user hasn't manually entered one this session
  useEffect(() => {
    if (shippingAddress) return; // user already set one this session
    if (!savedAddresses.length) return;

    // Prefer the default shipping address, fall back to first
    const defaultAddr =
      savedAddresses.find((a) => a.defaultShippingAddress) ?? savedAddresses[0];

    if (!defaultAddr) return;

    setShippingAddress({
      fullName: defaultAddr.fullName ?? "",
      phoneNumber: defaultAddr.phoneNumber ?? "",
      streetLine1: defaultAddr.streetLine1 ?? "",
      streetLine2: defaultAddr.streetLine2 ?? "",
      city: defaultAddr.city ?? "",
      province: defaultAddr.province ?? "",
      postalCode: defaultAddr.postalCode ?? "",
      countryCode: defaultAddr.country?.code ?? "NG",
    });
  }, [savedAddresses]);
  const [isPaying, setIsPaying] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan | null>(null);
  const [addItemToOrder] = useMutation(ADD_TO_CART);
  const [shippingMethodsReady, setShippingMethodsReady] = useState(false);
  const hasRecovered = useRef(false);

  const { data: activeOrderData, refetch: refetchActiveOrder } = useQuery<{
    activeOrder: ActiveOrder;
  }>(GET_ACTIVE_ORDER, { fetchPolicy: "network-only" });


  const activeOrder = activeOrderData?.activeOrder;


  const [transitionToState] = useMutation<TransitionToStateResponse>(TRANSITION_TO_STATE);
  const [recreateFailedOrder] = useMutation(RECREATE_FAILED_ORDER);
  const [setShippingAddressMutation] = useMutation<SetShippingAddressResponse>(SET_SHIPPING_ADDRESS);
  const [setShippingMethodMutation] = useMutation(SET_SHIPPING_METHOD);
  const [createPaystackIntent] = useMutation<PaystackIntentData>(PAYSTACK_INTENT);

  useEffect(() => {
    const ready = !!activeOrder && activeOrder.lines.length > 0 && activeOrder.state !== "ArrangingPayment";
    setShippingMethodsReady(ready);
  }, [activeOrder?.state, activeOrder?.lines?.length]);

  useEffect(() => {
    if (hasRecovered.current) return;
    if (!activeOrder) return;
    if (activeOrder.state !== "ArrangingPayment") return;
    hasRecovered.current = true;
    recoverArrangingPaymentOrder(activeOrder, transitionToState, recreateFailedOrder, refetchActiveOrder, setShippingMethodsReady)
      .catch((e) => {
        console.error("[checkout] on-mount recovery failed:", extractErrorMessage(e));
        toast.error("Could not restore your previous order. Please refresh the page.");
      });
  }, [activeOrder?.state]);

  useEffect(() => {
    const methodParam = searchParams?.get("method");
    if (methodParam === "installment" || methodParam === "paystack" || methodParam === "bank") {
      setMethod(methodParam as PaymentMethod);
    }
  }, [searchParams]);

  const { data: shippingMethodsData, refetch: refetchShippingMethods } = useQuery<{
    eligibleShippingMethods: ShippingMethod[];
  }>(GET_SHIPPING_METHODS, {
    skip: !shippingMethodsReady,
    fetchPolicy: "network-only",
  });

  const shippingMethods = (shippingMethodsData?.eligibleShippingMethods ?? []).filter(
    (m) => !m.name.toLowerCase().includes("bnpl")
  );

  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingMethod) {
      setSelectedShippingMethod(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingMethod]);

  const quantityMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (customer) {
      (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
        const vid = line?.productVariant?.id;
        if (vid && line.quantity > 0) map[vid] = line.quantity;
      });
    } else {
      localItems.forEach((it) => { if (it.quantity > 0) map[it.id] = it.quantity; });
    }
    return map;
  }, [customer, cart, localItems]);

  const selectedShippingCost = useMemo(() => {
    if (!selectedShippingMethod) return 0;
    return shippingMethods.find((m) => m.id === selectedShippingMethod)?.price ?? 0;
  }, [selectedShippingMethod, shippingMethods]);

  const serverAlreadyHasShipping = (activeOrder?.shippingLines?.length ?? 0) > 0;

  const displayTotal = useMemo(() => {
    if (serverAlreadyHasShipping) {
      const serverShippingCost = activeOrder?.shippingLines?.reduce((acc: number, sl: any) => acc + (sl.priceWithTax ?? 0), 0) ?? 0;
      const base = (activeOrder?.totalWithTax ?? 0) - serverShippingCost;
      return base + selectedShippingCost;
    }
    return (activeOrder?.subTotalWithTax ?? activeOrder?.totalWithTax ?? 0) + selectedShippingCost;
  }, [activeOrder, selectedShippingCost, serverAlreadyHasShipping]);

  // ── Derived: is a shipping address set? ──────────────────────────────────
  // Address is considered set if either the server order has one, OR
  // the user just submitted one via the modal this session.
  const hasShippingAddress = !!(
    activeOrder?.shippingAddress?.streetLine1 ||
    shippingAddress?.streetLine1
  );

  // ── Disable reason — shown as tooltip/label under button ─────────────────
  const disableReason = useMemo(() => {
    if (!activeOrder?.lines?.length) return "Add items to your cart first";
    if (!hasShippingAddress) return "Please add a shipping address to continue";
    if (!selectedShippingMethod) return "Please select a shipping method";
    return null;
  }, [activeOrder?.lines?.length, hasShippingAddress, selectedShippingMethod]);

  const isCheckoutDisabled = isPaying || !!disableReason;

  /* ------------------- Handlers ------------------- */

  const updateQuantity = async (variantId: string, lineId: string, newQty: number) => {
    if (newQty < 1) {
      removeLocalItem(variantId);
      if (customer) {
        const orderLineId = getOrderLineIdByVariantId(variantId) ?? lineId;
        if (orderLineId) {
          try { await removeFromCartMutation(orderLineId); }
          catch (e) { console.error("[checkout] removeFromCart failed:", extractErrorMessage(e)); }
        }
      }
      return;
    }
    updateLocalQuantity(variantId, newQty);
    if (customer) {
      const orderLineId = getOrderLineIdByVariantId(variantId) ?? lineId;
      if (orderLineId) {
        try { await handleAdjustQuantity(orderLineId, newQty); }
        catch (e) {
          console.error("[checkout] handleAdjustQuantity failed:", extractErrorMessage(e));
          toast.error("Failed to update quantity.");
        }
      }
    }
  };

  const handleAddressSubmit = async (addressData: any) => {
    try {
      const result = await setShippingAddressMutation({
        variables: {
          input: {
            fullName: addressData.fullName,
            streetLine1: addressData.streetLine1,
            streetLine2: addressData.streetLine2 || "",
            city: addressData.city,
            province: addressData.province || "",
            postalCode: addressData.postalCode || "",
            countryCode: addressData.countryCode || "NG",
            phoneNumber: addressData.phoneNumber,
          },
        },
      });
      const response = result.data?.setOrderShippingAddress;
      if (response && "id" in response) {
        setShippingAddress(addressData);
        toast.success("Shipping address saved");
      } else if (response && "errorCode" in response) {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Error setting shipping address:", extractErrorMessage(err));
      toast.error("Failed to set shipping address");
    }
  };

  const handleInstallmentConfirm = (plan: InstallmentPlan) => {
    setInstallmentPlan(plan);
    toast.success("Installment plan set. Proceed to checkout.");
  };

  const syncLocalCartToServer = async () => {
    if (!localItems.length) return false;
    try {
      for (const item of localItems) {
        await addItemToOrder({ variables: { productVariantId: item.id, quantity: item.quantity } });
      }
      const refreshed = await refetchActiveOrder();
      const refreshedOrder = refreshed.data?.activeOrder;
      if (refreshedOrder && refreshedOrder.lines.length > 0 && refreshedOrder.state !== "ArrangingPayment") {
        setShippingMethodsReady(true);
      }
      return true;
    } catch (err) {
      console.error("[checkout] cart sync failed:", extractErrorMessage(err));
      toast.error("Failed to sync cart.");
      return false;
    }
  };

  /* ------------------- Core checkout ------------------- */
  const handleCheckout = async () => {
    // Guard — should not be reachable since button is disabled, but safe fallback
    if (!hasShippingAddress) {
      toast.error("Please add a shipping address before paying.");
      return;
    }

    // ── FIX 1: prevent the on-mount recovery effect from kicking the order
    // back to "AddingItems" the moment WE transition it to "ArrangingPayment".
    // The ref updates synchronously, so the effect's guard short-circuits.
    hasRecovered.current = true;

    setIsPaying(true);
    try {
      let { data: freshData } = await refetchActiveOrder();
      let order = freshData?.activeOrder;

      if (order?.state === "ArrangingPayment") {
        try {
          const recovered = await recoverArrangingPaymentOrder(order, transitionToState, recreateFailedOrder, refetchActiveOrder, setShippingMethodsReady);
          if (!recovered) { toast.error("Could not restore your order. Please refresh the page."); return; }
          order = recovered;
          await refetchShippingMethods();
        } catch (e) {
          toast.error("Could not restore your previous order. Please refresh the page.");
          return;
        }
      }

      if ((!order?.lines || order.lines.length === 0) && localItems.length > 0) {
        const synced = await syncLocalCartToServer();
        if (!synced) return;
        const refreshed = await refetchActiveOrder();
        order = refreshed.data?.activeOrder;
      }

      if (!order?.lines || order.lines.length === 0) { toast.error("Your cart is empty."); router.push("/cart"); return; }
      if (!order.shippingAddress && !shippingAddress) { toast.error("Please add a shipping address."); return; }
      if (!selectedShippingMethod) { toast.error("Please select a shipping method."); return; }

      if (shippingAddress && !order.shippingAddress) {
        await setShippingAddressMutation({
          variables: {
            input: {
              fullName: shippingAddress.fullName,
              streetLine1: shippingAddress.streetLine1,
              streetLine2: shippingAddress.streetLine2 || "",
              city: shippingAddress.city,
              province: shippingAddress.province || "",
              postalCode: shippingAddress.postalCode || "",
              countryCode: shippingAddress.countryCode || "NG",
              phoneNumber: shippingAddress.phoneNumber,
            },
          },
        });
      }

      await setShippingMethodMutation({ variables: { id: [selectedShippingMethod] } });
      const afterShipping = await refetchActiveOrder();
      order = afterShipping.data?.activeOrder;

      if (!order?.lines || order.lines.length === 0) { toast.error("Order became empty after setting shipping. Please try again."); return; }

      const transitionResult = await transitionToState({ variables: { state: "ArrangingPayment" } });
      const transitionResponse = transitionResult.data?.transitionOrderToState;

      if (transitionResponse && "__typename" in transitionResponse && transitionResponse.__typename === "OrderStateTransitionError") {
        const raw = transitionResponse.transitionError ?? transitionResponse.message ?? "";
        const friendly = raw.includes("empty") ? "Your cart is empty. Please add items before paying."
          : raw.includes("address") ? "Please complete your shipping address." : raw;
        toast.error(friendly);
        return;
      }

      const afterTransition = await refetchActiveOrder();
      order = afterTransition.data?.activeOrder ?? order;

      let paystackIntentResult: { data?: PaystackIntentData };
      try {
        paystackIntentResult = await createPaystackIntent({ variables: { orderCode: order.code } });
      } catch (intentErr) {
        console.error("[checkout] createPaystackIntent failed:", extractErrorMessage(intentErr));
        toast.error("Failed to initialise payment. Please try again.");
        await recoverArrangingPaymentOrder(order, transitionToState, recreateFailedOrder, refetchActiveOrder, setShippingMethodsReady).catch(() => {});
        return;
      }

      const intentData = paystackIntentResult.data?.createPaystackPaymentIntent;
      if (!intentData?.reference) {
        toast.error("Failed to get payment reference from server. Please try again.");
        await recoverArrangingPaymentOrder(order, transitionToState, recreateFailedOrder, refetchActiveOrder, setShippingMethodsReady).catch(() => {});
        return;
      }

      const serverTotal = intentData.amount ?? order.totalWithTax;
      const chargeAmount = method === "installment" && installmentPlan ? Math.round(installmentPlan.depositAmount * 100) : serverTotal;
      const email = order.customer?.emailAddress ?? "";

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("A valid email address is required to complete payment. Please log in."); return; }
      if (!chargeAmount || chargeAmount <= 0 || !Number.isFinite(chargeAmount)) { toast.error("Invalid payment amount. Please refresh and try again."); return; }
      if (!order.code) { toast.error("Order reference is missing. Please refresh and try again."); return; }
      if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) { toast.error("Payment configuration error. Please contact support."); return; }

      // ── FIX 2: use the LIVE order code as the Paystack reference (matches the
      // backend's verify-by-order-code flow), not the stale activeOrderData.
      const paystackReference = order.code;

      // ── Reference debug log ──
      console.log("[checkout] Paystack reference:", paystackReference, {
        orderId: order.id,
        orderCode: order.code,
        intentReference: intentData.reference,
        chargeAmount,
      });

      const PaystackPop = (await import("@paystack/inline-js")).default;
      const paystack = new PaystackPop();

      const transactionConfig: PaystackTransactionConfig = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        amount: chargeAmount,
        email,
        reference: paystackReference,
        channels: method === "bank" ? ["bank_transfer"] : ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],

        onSuccess: () => {
          console.log("[checkout] payment successful, clearing local cart and redirecting...");
          // Wipe cart from localStorage synchronously before any navigation
          try {
            localStorage.removeItem("localCart:v1");
            localStorage.setItem("localCart:v1", JSON.stringify([]));
            sessionStorage.setItem("paymentSuccess", "true");
          } catch (_) {}
          // Small delay so localStorage write completes before navigation
          setTimeout(() => {
            router.replace(`/checkout/paystack-redirect?reference=${order!.id}&status=success&amount=${chargeAmount}`);
          }, 100);
        },
        onCancel: async () => {
          try {
            await recoverArrangingPaymentOrder(order!, transitionToState, recreateFailedOrder, refetchActiveOrder, setShippingMethodsReady);
            await refetchShippingMethods();
            // Re-enable on-mount recovery now that this checkout attempt is abandoned.
            hasRecovered.current = false;
          } catch (e) { console.error("[checkout] recovery on cancel failed:", extractErrorMessage(e)); }
          toast.error("Payment cancelled. You can try again.");
        },
      };

      paystack.newTransaction(transactionConfig);
    } catch (err) {
      const msg = extractErrorMessage(err);
      console.error("[checkout] unexpected error:", msg);
      toast.error(`Payment failed: ${msg}`);
    } finally {
      setIsPaying(false);
    }
  };

  /* ------------------- Button label ------------------- */
  const checkoutLabel = useMemo(() => {
    if (isPaying) return "Processing...";
    if (!hasShippingAddress) return "Add Shipping Address to Continue";
    if (method === "installment" && installmentPlan) return `Pay Deposit — ${NGN.format(installmentPlan.depositAmount)}`;
    if (method === "bank") return "Continue to Bank Transfer";
    return "Pay with Paystack";
  }, [isPaying, method, installmentPlan, hasShippingAddress]);

  const shippingLoadingMessage = useMemo(() => {
    if (!activeOrder) return "Waiting for order…";
    if (activeOrder.state === "ArrangingPayment") return "Recovering order, please wait…";
    if (activeOrder.lines.length === 0) return "Add items to your cart to see shipping options.";
    if (!shippingMethodsReady) return "Preparing shipping options…";
    return "Loading shipping methods…";
  }, [activeOrder?.state, activeOrder?.lines?.length, shippingMethodsReady]);

  /* ------------------- Render ------------------- */
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      <div className="mx-auto max-w-[95%] px-4 py-10">
        <h1 className="text-[20px] font-semibold text-[#0B0F0E]">Payment Method</h1>
        <p className="text-[14px] text-[#818B9C] mt-2">Showing your selected products</p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">

          {/* ---------------- LEFT SIDE ---------------- */}
          <section className="space-y-6">
            {method === "installment" ? (
              <InstallmentPayment
                totalAmount={activeOrder?.totalWithTax ?? 0}
                onConfirm={handleInstallmentConfirm}
                onBack={() => setMethod("paystack")}
              />
            ) : (
              <div className="rounded-2xl border border-[#d1d1d1] p-5">
                {/* ── Shipping Address ── */}
                <div className="my-6">
                  <p className="mb-4 text-[22px] font-[500] text-[#000000]">Billing Address</p>
                  <div className="rounded-2xl border border-[#d1d1d1] p-5">
                    <p className="mb-4 text-lg font-semibold">Shipping Address</p>
                    {activeOrder?.shippingAddress || shippingAddress ? (
                      <div className="bg-neutral-100 rounded-xl p-3">
                        <p className="text-sm font-medium">
                          {activeOrder?.shippingAddress?.fullName || shippingAddress?.fullName}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {activeOrder?.shippingAddress?.streetLine1 || shippingAddress?.streetLine1}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {activeOrder?.shippingAddress?.city || shippingAddress?.city}
                        </p>
                        <AddressModal
                          trigger={
                            <button className="mt-2 text-xs text-red-500 hover:text-red-600">
                              Change Address
                            </button>
                          }
                          initialValue={
                            activeOrder?.shippingAddress
                              ? {
                                  fullName: activeOrder.shippingAddress.fullName ?? "",
                                  phoneNumber: activeOrder.shippingAddress.phoneNumber ?? "",
                                  streetLine1: activeOrder.shippingAddress.streetLine1 ?? "",
                                  streetLine2: activeOrder.shippingAddress.streetLine2 ?? "",
                                  city: activeOrder.shippingAddress.city ?? "",
                                  province: activeOrder.shippingAddress.province ?? "",
                                  postalCode: activeOrder.shippingAddress.postalCode ?? "",
                                  countryCode: activeOrder.shippingAddress.countryCode ?? "NG",
                                }
                              : shippingAddress ?? undefined
                          }
                          onSubmit={handleAddressSubmit}
                        />
                      </div>
                    ) : (
                      <AddressModal
                        trigger={
                          <button className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600">
                            Add Shipping Address
                          </button>
                        }
                        onSubmit={handleAddressSubmit}
                      />
                    )}
                  </div>
                </div>

                <p className="mb-4 text-[22px] font-[500] text-[#000000]">Payment</p>

                <div className="flex flex-col gap-4">
                  {/* ── Paystack ── */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === "paystack" ? "border-[#ff0000] bg-[#f3f3f3]" : "border-[#d1d1d1] bg-neutral-100 hover:border-neutral-300"}`}>
                    <div className="flex gap-3 items-center">
                      <input type="radio" checked={method === "paystack"} onChange={() => setMethod("paystack")} className="accent-[#ff0000]" />
                      <div>
                        <p className="font-medium text-sm">Card / USSD / Mobile Money</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Pay securely via Paystack</p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center bg-white border border-neutral-200 rounded-lg px-2 py-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="4" fill="#ff0000" />
                        <path d="M4 8h16M4 12h10M4 16h7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs font-bold text-[#333333]">Paystack</span>
                    </div>
                  </label>

                  {/* ── Bank Transfer ── */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === "bank" ? "border-[#ff0000] bg-[#f3f3f3]" : "border-[#d1d1d1] bg-neutral-100 hover:border-neutral-300"}`}>
                    <div className="flex gap-3 items-center">
                      <input type="radio" checked={method === "bank"} onChange={() => setMethod("bank")} className="accent-[#ff0000]" />
                      <div>
                        <p className="font-medium text-sm">Bank Transfer</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Transfer directly from your bank</p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center bg-white border border-neutral-200 rounded-lg px-2 py-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs font-medium text-neutral-600">Bank</span>
                    </div>
                  </label>

                  {/* ── Installment ── */}
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${method === "installment" ? "border-[#ff0000] bg-[#f3f3f3]" : "border-[#d1d1d1] bg-neutral-100 hover:border-neutral-300"}`}>
                    <div className="flex gap-3 items-center">
                      <input type="radio" checked={method === "installment"} onChange={() => setMethod("installment")} className="accent-[#ff0000]" />
                      <div>
                        <p className="font-medium text-sm">Installment Payment</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Split into manageable payments</p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center bg-white border border-neutral-200 rounded-lg px-2 py-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v20M2 12h20" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="2" />
                      </svg>
                      <span className="text-xs font-medium text-neutral-600">Pay Later</span>
                    </div>
                  </label>

                  {/* ── Shipping Method ── */}
                  <div className="rounded-2xl border border-[#d1d1d1] p-5 mt-6">
                    <p className="mb-4 text-lg font-semibold">Shipping Method</p>
                    <div className="space-y-3">
                      {shippingMethods.length === 0 ? (
                        <p className="text-xs text-neutral-500 text-center py-2">{shippingLoadingMessage}</p>
                      ) : (
                        shippingMethods.map((m) => (
                          <label key={m.id} className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg cursor-pointer hover:bg-neutral-200">
                            <div className="flex gap-3 items-center">
                              <input type="radio" name="shipping" checked={selectedShippingMethod === m.id} onChange={() => setSelectedShippingMethod(m.id)} className="accent-red-500" />
                              <div>
                                <p className="font-medium text-sm">{m.name}</p>
                                <p className="text-xs text-neutral-600">{m.description}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold">{formatNaira(m.price)}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => router.push("/cart")} className="text-red-500 text-[16px] font-medium flex items-center gap-2">
              <Image src="/shopping-cart.png" alt="Back" width={18} height={18} /> Return to Cart
            </button>

            <div className="rounded-2xl border border-[#d1d1d1] p-5 pt-8">
              <h3 className="text-sm font-semibold mb-4 border-b border-[#d1d1d1] pb-4">Delivery & Products</h3>
              <div className="flex flex-col gap-5">
                <InfoRow icon="/truck.png" title="Delivery" text="1–9 business days" />
                <InfoRow icon="/repeat.png" title="Returns" text="7-day return policy" />
                <InfoRow icon="/shield.png" title="Warranty" text="Varies per item" />
              </div>
            </div>
          </section>

          {/* ---------------- RIGHT SIDE (SUMMARY) ---------------- */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[8px] border-[2px] border-[#EDEDED] p-6">
              <p className="text-[24px] font-[500] mb-3 text-[#0C0C0C]">Your Order</p>

              {(!activeOrder?.lines || activeOrder.lines.length === 0) && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  Your cart is empty. Please{" "}
                  <button className="underline font-medium" onClick={() => router.push("/cart")}>go back to cart</button>{" "}
                  and add items before checking out.
                </div>
              )}

              <div className="space-y-5">
                {activeOrder?.lines?.map((ln) => {
                  const variantId = ln.productVariant?.id ?? "";
                  const qty = (variantId ? quantityMap[variantId] : undefined) ?? ln.quantity;
                  return (
                    <div key={ln.id} className="flex gap-3 items-start">
                      <Image src={ln.featuredAsset?.preview || "/placeholder.png"} alt="preview" width={75} height={75} className="rounded border bg-[#F3F5F7] p-4" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{ln.productVariant?.name}</p>
                        <p className="text-xs text-neutral-500">Category</p>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2 mt-2">
                            <button className="w-4 h-4 border rounded-full text-xs" onClick={() => updateQuantity(variantId, ln.id, qty - 1)}>–</button>
                            <span className="text-xs">{qty}</span>
                            <button className="w-4 h-4 border rounded-full text-xs" onClick={() => updateQuantity(variantId, ln.id, qty + 1)}>+</button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatNaira(ln.linePriceWithTax)}</p>
                            <button className="text-xs text-red-500 flex items-center gap-1" onClick={() => updateQuantity(variantId, ln.id, 0)}>
                              Remove <Image src="/trash.png" alt="Remove" width={12} height={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Order Summary ── */}
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatNaira(activeOrder?.subTotalWithTax ?? 0)} />
                <Row label="Discount" value="- ₦0" />
                <Row label="Shipping" value={selectedShippingCost > 0 ? formatNaira(selectedShippingCost) : "₦0"} />
                {method === "installment" && installmentPlan && (
                  <>
                    <Row label="Deposit (now)" value={NGN.format(installmentPlan.depositAmount)} />
                    <Row label={`${installmentPlan.periods}× ${installmentPlan.frequency} repayments`} value={NGN.format(installmentPlan.repaymentAmount)} />
                    <Row label="Insurance Fee (1%)" value={NGN.format(installmentPlan.insuranceFee)} />
                  </>
                )}
              </div>

              <div className="mt-3">
                <Row big bold label="Grand Total" value={formatNaira(displayTotal)} />
              </div>

              {/* ── CTA Button ── */}
              <button
                onClick={handleCheckout}
                disabled={isCheckoutDisabled}
                className={`mt-5 w-full py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  isCheckoutDisabled
                    ? "bg-red-300 cursor-not-allowed opacity-70"
                    : "bg-[#ff0000] hover:bg-red-700 active:scale-[0.98]"
                }`}
              >
                {!isPaying && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" />
                  </svg>
                )}
                {checkoutLabel}
              </button>

              {/* ── Disable reason hint ── */}
              {disableReason && !isPaying && (
                <p className="mt-2 text-center text-xs text-red-500 font-medium">
                  {disableReason}
                </p>
              )}

              <p className="mt-3 text-center text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" stroke="#9ca3af" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                Secured by Paystack
              </p>
            </div>
          </aside>
        </div>
      </div>

      <Suscribe />
      <Footer />
    </main>
  );
}

/* ------------------- Default Export with Suspense ------------------- */
export default function Page() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-6 animate-pulse">
          <div className="h-6 w-48 bg-neutral-200 rounded mb-2" />
          <div className="h-4 w-64 bg-neutral-200 rounded" />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="h-96 bg-neutral-200 rounded-2xl" />
            <div className="h-96 bg-neutral-200 rounded-2xl" />
          </div>
        </div>
      </main>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

/* ---------------- Helper Components ---------------- */
function Row({ label, value, bold, big }: any) {
  return (
    <div className="flex justify-between text-[#717171] font-[14px]">
      <span className="font-light">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${big ? "text-base" : ""}`}>{value}</span>
    </div>
  );
}

function InfoRow({ icon, title, text }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[#d1d1d1] pb-2">
      <Image className="shrink-0" src={icon} alt="Icon" width={24} height={24} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}