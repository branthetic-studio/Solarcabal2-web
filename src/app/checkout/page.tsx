"use client";
import React, { Suspense, useMemo, useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { gql } from "@apollo/client";
import Suscribe from "@/Components/Suscribe/Suscribe";
import AddressModal from "@/Components/AddressModal";
import InstallmentPayment, { InstallmentPlan } from "@/Components/Installmentpayment";
import { StaticImageData } from "next/image";

import {
  GET_ACTIVE_ORDER,
  GET_SHIPPING_METHODS,
  SET_SHIPPING_METHOD,
  SET_SHIPPING_ADDRESS,
  TRANSITION_TO_STATE,
  PAYSTACK_INTENT,
  RECREATE_FAILED_ORDER,
} from "@/graphql/queries";

/* ------------------- Types ------------------- */

// Using string to avoid TypeScript control-flow narrowing errors
// when comparing method inside useMemo / async functions.
type PaymentMethod = string;

type ActiveOrderLine = {
  id: string;
  quantity: number;
  linePriceWithTax: number;
  productVariant?: {
    name?: string;
    product?: {
      featuredAsset?: { preview?: string | null } | null;
    } | null;
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
  shippingAddress?: any;
  shippingLines?: any[];
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type SetShippingAddressResponse = {
  setOrderShippingAddress:
    | ActiveOrder
    | { errorCode: string; message: string };
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

/* ------------------- Helpers ------------------- */

/**
 * Extracts a human-readable message from anything that might be thrown.
 * Handles: Error, GraphQL ApolloError, plain objects, strings.
 */
function extractErrorMessage(err: unknown): string {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;

  // ApolloError / GraphQL errors
  const e = err as any;
  if (e?.graphQLErrors?.length) {
    return e.graphQLErrors.map((g: any) => g.message).join(", ");
  }
  if (e?.networkError?.message) return `Network error: ${e.networkError.message}`;
  if (e?.message) return e.message;

  try {
    return JSON.stringify(err);
  } catch {
    return "An unknown error occurred.";
  }
}

/* ------------------- Formatters ------------------- */
const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const formatNaira = (kobo: number) => NGN.format(kobo / 100);

/* ------------------- GraphQL ------------------- */
const UPDATE_CART = gql`
  mutation UpdateCart($lineId: ID!, $quantity: Int!) {
    adjustOrderLineQuantity(orderLineId: $lineId, quantity: $quantity) {
      ... on Order {
        id
        totalQuantity
        lines {
          id
          quantity
          linePriceWithTax
          productVariant {
            name
            product {
              featuredAsset {
                preview
              }
            }
          }
        }
        totalWithTax
        subTotalWithTax
      }
      ... on OrderModificationError {
        message
      }
    }
  }
`;

/* ------------------- Inner Page ------------------- */
function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [method, setMethod] = useState<PaymentMethod>("paystack" as PaymentMethod);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlan | null>(null);

  // Pre-select method from URL param (e.g. ?method=installment from Pay Later button)
  useEffect(() => {
    const methodParam = searchParams?.get("method");
    if (methodParam === "installment" || methodParam === "paystack" || methodParam === "bank") {
      setMethod(methodParam as PaymentMethod);
    }
  }, [searchParams]);

  /* ------------------- Queries ------------------- */
  const { data: activeOrderData, refetch } = useQuery<{
    activeOrder: ActiveOrder;
  }>(GET_ACTIVE_ORDER);

  const activeOrder = activeOrderData?.activeOrder;

  const { data: shippingMethodsData } = useQuery<{
    eligibleShippingMethods: ShippingMethod[];
  }>(GET_SHIPPING_METHODS, {
    skip: !activeOrder,
  });

  const shippingMethods = (shippingMethodsData?.eligibleShippingMethods ?? []).filter(
    (m) => !m.name.toLowerCase().includes("bnpl")
  );

  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingMethod) {
      setSelectedShippingMethod(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingMethod]);

  /* ------------------- Mutations ------------------- */
  const [updateCartMutation] = useMutation(UPDATE_CART);
  const [setShippingAddressMutation] =
    useMutation<SetShippingAddressResponse>(SET_SHIPPING_ADDRESS);
  const [setShippingMethodMutation] = useMutation(SET_SHIPPING_METHOD);
  const [transitionToState] = useMutation<TransitionToStateResponse>(TRANSITION_TO_STATE);
  const [createPaystackIntent] = useMutation(PAYSTACK_INTENT);
  const [recreateFailedOrder] = useMutation(RECREATE_FAILED_ORDER);

  /* ------------------- Handlers ------------------- */
  const updateQuantity = async (lineId: string, qty: number) => {
    if (qty < 1) return;
    try {
      const res = await updateCartMutation({ variables: { lineId, quantity: qty } });
      const payload = res.data as {
        adjustOrderLineQuantity:
          | {
              __typename: "Order";
              id: string;
              totalQuantity: number;
              lines: ActiveOrderLine[];
              totalWithTax: number;
              subTotalWithTax?: number;
            }
          | { __typename: "OrderModificationError"; message: string };
      };
      if (payload.adjustOrderLineQuantity.__typename === "Order") {
        await refetch();
      } else {
        toast.error(payload.adjustOrderLineQuantity.message);
      }
    } catch (err) {
      console.error("Error updating cart:", extractErrorMessage(err));
      toast.error("Failed to update cart.");
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
        await refetch();
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

  /* ------------------- Core checkout / Paystack launch ------------------- */
  const handleCheckout = async () => {
    // ── Pre-flight guards ────────────────────────────────────────────────────
    if (!activeOrder) {
      toast.error("No active order found.");
      return;
    }

    // Vendure rejects ArrangingPayment when the server order has no lines.
    // This happens for guests whose local cart was never synced to the server.
    if (!activeOrder.lines || activeOrder.lines.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      router.push("/cart");
      return;
    }

    if (!activeOrder.shippingAddress && !shippingAddress) {
      toast.error("Please add a shipping address.");
      return;
    }
    if (!selectedShippingMethod) {
      toast.error("Please select a shipping method.");
      return;
    }
    if (method === "installment" && !installmentPlan) {
      toast.error("Please confirm your installment plan first.");
      return;
    }

    setIsPaying(true);

    try {
      // ── Step 1: Set shipping method ────────────────────────────────────────
      if (!activeOrder.shippingLines || activeOrder.shippingLines.length === 0) {
        try {
          await setShippingMethodMutation({ variables: { id: [selectedShippingMethod] } });
        } catch (err) {
          console.error("[checkout] setShippingMethod failed:", extractErrorMessage(err));
          toast.error("Failed to set shipping method. Please try again.");
          return;
        }
      }

      // ── Step 2: Transition to ArrangingPayment ─────────────────────────────
      let transitionResponse: TransitionToStateResponse["transitionOrderToState"] | undefined;
      try {
        const transitionResult = await transitionToState({
          variables: { state: "ArrangingPayment" },
        });
        transitionResponse = transitionResult.data?.transitionOrderToState;
      } catch (err) {
        console.error("[checkout] transitionToState failed:", extractErrorMessage(err));
        toast.error("Could not prepare your order for payment. Please try again.");
        return;
      }

      if (
        transitionResponse &&
        "__typename" in transitionResponse &&
        transitionResponse.__typename === "OrderStateTransitionError"
      ) {
        const raw = transitionResponse.transitionError ?? transitionResponse.message ?? "";
        console.error("[checkout] transition error:", raw);
        const friendly = raw.includes("empty")
          ? "Your cart is empty. Please add items before paying."
          : raw.includes("address")
          ? "Please complete your shipping address before paying."
          : `Order error: ${raw}`;
        toast.error(friendly);
        return;
      }

      // ── Step 3: Create Paystack intent ────────────────────────────────────
      try {
        await createPaystackIntent({ variables: { orderCode: activeOrder.code } });
      } catch (err) {
        console.error("[checkout] createPaystackIntent failed:", extractErrorMessage(err));
        toast.error("Could not initialise payment. Please check your connection and try again.");
        return;
      }

      // ── Step 4: Launch Paystack popup ─────────────────────────────────────
      const chargeAmount =
        method === "installment" && installmentPlan
          ? installmentPlan.depositAmount * 100
          : activeOrder.totalWithTax;

      let PaystackPop: any;
      try {
        const mod = await import("@paystack/inline-js");
        PaystackPop = mod.default;
      } catch (err) {
        console.error("[checkout] Paystack SDK load failed:", extractErrorMessage(err));
        toast.error("Could not load the payment SDK. Please refresh the page and try again.");
        return;
      }

      const paystack = new PaystackPop();
      (paystack.newTransaction as any)({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        amount: chargeAmount,
        email: activeOrder.customer?.emailAddress || "",
        reference: activeOrder.code,
        channels:
          method === "bank"
            ? ["bank_transfer"]
            : ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        metadata: {
          order_id: activeOrder.id,
          payment_method: method,
          ...(method === "installment" && installmentPlan
            ? {
                installment_periods: installmentPlan.periods,
                installment_frequency: installmentPlan.frequency,
              }
            : {}),
        },
        onSuccess: () => {
          router.replace(
            `/main/checkout/paystack-redirect?reference=${activeOrder.id}&status=success&amount=${chargeAmount}`
          );
        },
        onCancel: async () => {
          try {
            await recreateFailedOrder({ variables: { orderCode: activeOrder.code } });
          } catch (e) {
            console.error("[checkout] recreateFailedOrder failed:", extractErrorMessage(e));
          }
          toast.error("Payment cancelled.");
          router.replace("/cart");
        },
      });
    } catch (err) {
      // Catch-all for anything unexpected
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
    if (method === "installment" && installmentPlan) {
      return `Pay Deposit — ${NGN.format(installmentPlan.depositAmount)}`;
    }
    if (method === "bank") return "Continue to Bank Transfer";
    return "Pay with Paystack";
  }, [isPaying, method, installmentPlan]);

  /* ------------------- Render ------------------- */
  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-md font-semibold text-neutral-800">Payment Method</h1>
        <p className="text-xs text-neutral-500">Showing your selected products</p>

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
                <p className="mb-4 text-lg font-semibold">Payment</p>

                <div className="flex flex-col gap-4">

                  {/* ── Paystack (card / USSD / mobile money) ── */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      method === "paystack"
                        ? "border-[#ff0000] bg-[#f3f3f3]"
                        : "border-[#d1d1d1] bg-neutral-100 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <input
                        type="radio"
                        checked={method === "paystack"}
                        onChange={() => setMethod("paystack")}
                        className="accent-[#ff0000]"
                      />
                      <div>
                        <p className="font-medium text-sm">Card / USSD / Mobile Money</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Pay securely via Paystack
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 items-center bg-white border border-neutral-200 rounded-lg px-2 py-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="24" rx="4" fill="#ff0000" />
                          <path
                            d="M4 8h16M4 12h10M4 16h7"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs font-bold text-[#333333]">Paystack</span>
                      </div>
                    </div>
                  </label>

                  {/* ── Bank Transfer ── */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      method === "bank"
                        ? "border-[#ff0000] bg-[#f3f3f3]"
                        : "border-[#d1d1d1] bg-neutral-100 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <input
                        type="radio"
                        checked={method === "bank"}
                        onChange={() => setMethod("bank")}
                        className="accent-[#ff0000]"
                      />
                      <div>
                        <p className="font-medium text-sm">Bank Transfer</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Transfer directly from your bank
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center bg-white border border-neutral-200 rounded-lg px-2 py-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"
                          stroke="#6b7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-xs font-medium text-neutral-600">Bank</span>
                    </div>
                  </label>

                  {/* ── Installment Payment ── */}
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      method === "installment"
                        ? "border-[#ff0000] bg-[#f3f3f3]"
                        : "border-[#d1d1d1] bg-neutral-100 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <input
                        type="radio"
                        checked={method === "installment"}
                        onChange={() => setMethod("installment")}
                        className="accent-[#ff0000]"
                      />
                      <div>
                        <p className="font-medium text-sm">Installment Payment</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Split into manageable payments
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 items-center bg-white border border-neutral-200 rounded-lg px-2 py-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2v20M2 12h20"
                          stroke="#6b7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="2" />
                      </svg>
                      <span className="text-xs font-medium text-neutral-600">Pay Later</span>
                    </div>
                  </label>
                </div>

                {/* ── Shipping Address ── */}
                <div className="my-6">
                  <p className="mb-2 text-sm font-semibold">Billing Address</p>

                  <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5">
                    <p className="mb-4 text-lg font-semibold">Shipping Address</p>
                    {activeOrder?.shippingAddress || shippingAddress ? (
                      <div className="bg-neutral-100 rounded-xl p-3">
                        <p className="text-sm font-medium">
                          {activeOrder?.shippingAddress?.fullName || shippingAddress?.fullName}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {activeOrder?.shippingAddress?.streetLine1 ||
                            shippingAddress?.streetLine1}
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

                  {/* ── Shipping Method ── */}
                  <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5 mt-6">
                    <p className="mb-4 text-lg font-semibold">Shipping Method</p>
                    <div className="space-y-3">
                      {shippingMethods.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg cursor-pointer hover:bg-neutral-200"
                        >
                          <div className="flex gap-3 items-center">
                            <input
                              type="radio"
                              name="shipping"
                              checked={selectedShippingMethod === m.id}
                              onChange={() => setSelectedShippingMethod(m.id)}
                              className="accent-red-500"
                            />
                            <div>
                              <p className="font-medium text-sm">{m.name}</p>
                              <p className="text-xs text-neutral-600">{m.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">{formatNaira(m.price)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push("/cart")}
              className="text-red-500 text-sm font-medium flex items-center gap-2"
            >
              <Image src="/shopping-cart.png" alt="Back" width={16} height={16} /> Return to Cart
            </button>

            <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5 pt-8">
              <h3 className="text-sm font-semibold mb-4 border-b border-[#d1d1d1] pb-4">
                Delivery & Products
              </h3>
              <div className="flex flex-col gap-5">
                <InfoRow icon="/truck.png" title="Delivery" text="1–9 business days" />
                <InfoRow icon="/repeat.png" title="Returns" text="7-day return policy" />
                <InfoRow icon="/shield.png" title="Warranty" text="Varies per item" />
              </div>
            </div>
          </section>

          {/* ---------------- RIGHT SIDE (SUMMARY) ---------------- */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#d1d1d1] bg-white p-6">
              <p className="text-sm font-semibold mb-3">Your Order</p>

              {/* Empty cart warning shown inline in the summary panel */}
              {(!activeOrder?.lines || activeOrder.lines.length === 0) && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  Your cart is empty. Please{" "}
                  <button
                    className="underline font-medium"
                    onClick={() => router.push("/cart")}
                  >
                    go back to cart
                  </button>{" "}
                  and add items before checking out.
                </div>
              )}

              <div className="space-y-5">
                {activeOrder?.lines?.map((ln) => (
                  <div key={ln.id} className="flex gap-3 items-start">
                    <Image
                      src={
                        ln.productVariant?.product?.featuredAsset?.preview ||
                        "/placeholder.png"
                      }
                      alt="preview"
                      width={75}
                      height={75}
                      className="rounded border bg-[#F3F5F7] p-4"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{ln.productVariant?.name}</p>
                      <p className="text-xs text-neutral-500">Category</p>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            className="w-4 h-4 border rounded-full text-xs"
                            onClick={() => updateQuantity(ln.id, ln.quantity - 1)}
                          >
                            –
                          </button>
                          <span className="text-xs">{ln.quantity}</span>
                          <button
                            className="w-4 h-4 border rounded-full text-xs"
                            onClick={() => updateQuantity(ln.id, ln.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatNaira(ln.linePriceWithTax)}
                          </p>
                          <button className="text-xs text-red-500 flex items-center gap-1">
                            Remove{" "}
                            <Image src="/trash.png" alt="Remove" width={12} height={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatNaira(activeOrder?.subTotalWithTax ?? 0)} />
                <Row label="Discount" value="- ₦0" />
                <Row label="Shipping" value="₦0" />
                {method === "installment" && installmentPlan && (
                  <>
                    <Row
                      label="Deposit (now)"
                      value={NGN.format(installmentPlan.depositAmount)}
                    />
                    <Row
                      label={`${installmentPlan.periods}× ${installmentPlan.frequency} repayments`}
                      value={NGN.format(installmentPlan.repaymentAmount)}
                    />
                    <Row
                      label="Insurance Fee (1%)"
                      value={NGN.format(installmentPlan.insuranceFee)}
                    />
                  </>
                )}
              </div>

              <div className="mt-3">
                <Row
                  big
                  bold
                  label="Grand Total"
                  value={formatNaira(activeOrder?.totalWithTax ?? 0)}
                />
              </div>

              {/* ── Paystack CTA button ── */}
              <button
                onClick={handleCheckout}
                disabled={isPaying || !activeOrder?.lines?.length}
                className={`mt-5 w-full py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  isPaying || !activeOrder?.lines?.length
                    ? "bg-red-300 cursor-not-allowed opacity-70"
                    : "bg-[#ff0000] hover:bg-red-700 active:scale-[0.98]"
                }`}
              >
                {!isPaying && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {checkoutLabel}
              </button>

              {/* Secured by Paystack note */}
              <p className="mt-3 text-center text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
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
    <Suspense
      fallback={
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
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}

/* ---------------- Helper Components ---------------- */
function RadioRow({ checked, onChange, label, right }: any) {
  return (
    <label className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg cursor-pointer">
      <div className="flex gap-3 items-center">
        <input type="radio" checked={checked} onChange={onChange} className="accent-red-500" />
        <span>{label}</span>
      </div>
      {right}
    </label>
  );
}

function Row({ label, value, bold, big }: any) {
  return (
    <div className="flex justify-between text-[#717171] font-xs">
      <span className="font-light">{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${big ? "text-base" : ""}`}>{value}</span>
    </div>
  );
}

function InfoRow({ icon, title, text }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f0f0f0] pb-2">
      <Image className="shrink-0" src={icon} alt="Icon" width={24} height={24} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}