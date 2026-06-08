"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import Link from "next/link";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useLocalCart } from "@/context/LocalCartContext";
import { GET_ACTIVE_ORDER, TRANSITION_TO_STATE } from "@/graphql/queries";

/* ─── GraphQL ─────────────────────────────────────────────────────────────── */

const ADD_PAYMENT_TO_ORDER = gql`
  mutation AddPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order {
        id
        code
        state
        totalWithTax
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on PaymentFailedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on PaymentDeclinedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on OrderPaymentStateError {
        errorCode
        message
      }
      ... on IneligiblePaymentMethodError {
        errorCode
        message
        eligibilityCheckerMessage
      }
    }
  }
`;

/* ─── Types ───────────────────────────────────────────────────────────────── */

type Stage =
  | "verifying"      // checking params & order state
  | "adding_payment" // calling addPaymentToOrder
  | "success"        // all done
  | "failed"         // unrecoverable error
  | "cancelled";     // user came back with status !== success

type OrderSummary = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
};

type AddPaymentResult =
  | (OrderSummary & { __typename?: string })
  | { errorCode: string; message: string; paymentErrorMessage?: string; __typename?: string };

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatNaira(kobo: number) {
  return NGN.format(Math.max(0, kobo / 100));
}

function extractErrorMessage(err: unknown): string {
  if (!err) return "An unknown error occurred.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  const e = err as any;
  if (e?.graphQLErrors?.length)
    return e.graphQLErrors.map((g: any) => g.message).join(", ");
  if (e?.networkError?.message) return `Network error: ${e.networkError.message}`; // Fixed line
  if (e?.message) return e.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "An unknown error occurred.";
  }
}

/* ─── Spinner ─────────────────────────────────────────────────────────────── */

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-red-500"
      style={{ width: size, height: size }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─── Animated checkmark ─────────────────────────────────────────────────── */

function SuccessCheckmark() {
  return (
    <div className="relative flex items-center justify-center">
      <span className="absolute inline-flex h-24 w-24 rounded-full bg-green-400 opacity-20 animate-ping" />
      <span className="absolute inline-flex h-20 w-20 rounded-full bg-green-400 opacity-30" />
      <svg
        className="relative z-10 h-20 w-20"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="40" cy="40" r="38" stroke="#22c55e" strokeWidth="3" fill="white" />
        <path
          d="M24 41 L35 52 L57 30"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="50"
          strokeDashoffset="0"
          style={{ animation: "drawCheck 0.5s ease-out 0.2s both" }}
        />
      </svg>
      <style>{`
        @keyframes drawCheck {
          from { stroke-dashoffset: 50; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Inner page ─────────────────────────────────────────────────────────── */

function PaystackRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status    = searchParams?.get("status");    // "success" | anything else
  const orderId   = searchParams?.get("reference"); // order.id passed in onSuccess
  const rawAmount = searchParams?.get("amount");    // kobo string
  const amountKobo = rawAmount ? parseInt(rawAmount, 10) : 0;

  const [stage, setStage] = useState<Stage>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [confirmedOrder, setConfirmedOrder] = useState<OrderSummary | null>(null);

  const hasRun = useRef(false);

  /* ── Cart clearing ── */
  const { clearCart: clearLocalCart } = useLocalCart();

  /* ── Mutations ── */
  const [addPaymentToOrder] = useMutation<{ addPaymentToOrder: AddPaymentResult }>(
    ADD_PAYMENT_TO_ORDER
  );
  const [transitionToState] = useMutation(TRANSITION_TO_STATE);

  /* ── Active order query ── */
  const { refetch: refetchActiveOrder } = useQuery<{ activeOrder: OrderSummary }>(
    GET_ACTIVE_ORDER,
    { fetchPolicy: "network-only" }
  );

  /* ── Main effect: runs once on mount ── */
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (status !== "success") {
      setStage("cancelled");
      return;
    }

    if (!orderId) {
      setStage("failed");
      setErrorMessage("Missing order reference. Please contact support.");
      return;
    }

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmPayment() {
    try {
      setStage("verifying");

      /* Step 1: Fetch fresh order */
      let { data: freshData } = await refetchActiveOrder();
      let order = freshData?.activeOrder;

      /* Order already settled / gone — treat as success */
      if (!order) {
        clearLocalCart();
        setStage("success");
        return;
      }

      /* Step 2: Add payment if still in ArrangingPayment */
      if (order.state === "ArrangingPayment") {
        setStage("adding_payment");

        const paymentResult = await addPaymentToOrder({
          variables: {
            input: {
              method: "paystack",
              metadata: {
                verificationOrderId: orderId,
              },
            },
          },
        });

        const response = paymentResult.data?.addPaymentToOrder;

        if (!response) {
          throw new Error("No response from payment confirmation.");
        }

        /* Error union branch */
        if ("errorCode" in response) {
          /* Already settled — check live state */
          if (
            response.errorCode === "ORDER_PAYMENT_STATE_ERROR" ||
            response.message?.toLowerCase().includes("already")
          ) {
            const rechecked = await refetchActiveOrder();
            const recheckOrder = rechecked.data?.activeOrder;
            if (!recheckOrder || recheckOrder.state === "PaymentSettled") {
              clearLocalCart();
              setConfirmedOrder(
                recheckOrder ?? { id: orderId!, code: "", state: "PaymentSettled", totalWithTax: amountKobo }
              );
              setStage("success");
              return;
            }
          }
          throw new Error(
            (response as any).paymentErrorMessage ?? response.message ?? "Payment confirmation failed."
          );
        }

        /* Success branch — response is an Order */
        order = response as OrderSummary;
      }

      /* Step 3: Transition PaymentAuthorized → PaymentSettled if needed */
      if (order.state === "PaymentAuthorized") {
        try {
          await transitionToState({ variables: { state: "PaymentSettled" } });
          const refreshed = await refetchActiveOrder();
          order = refreshed.data?.activeOrder ?? order;
        } catch (_) {
          // Server may handle this automatically — don't fail the page
        }
      }

      /* Step 4: Clear cart and show success */
      clearLocalCart();
      setConfirmedOrder(order);
      setStage("success");

    } catch (err) {
      console.error("[paystack-redirect] confirmPayment error:", extractErrorMessage(err));
      setErrorMessage(extractErrorMessage(err));
      setStage("failed");
    }
  }

  /* ─── Render ────────────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-16">

        {/* ── Verifying / Processing ── */}
        {(stage === "verifying" || stage === "adding_payment") && (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Spinner size={36} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-800">
                {stage === "adding_payment" ? "Confirming your order…" : "Verifying your payment…"}
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Please don't close this page. This will only take a moment.
              </p>
            </div>
            <div className="w-full rounded-full bg-neutral-100 h-1.5 overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-700"
                style={{ width: stage === "adding_payment" ? "70%" : "35%" }}
              />
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {stage === "success" && (
          <div
            className="flex flex-col items-center gap-6 rounded-2xl border border-green-100 bg-white p-10 shadow-sm text-center"
            style={{ animation: "fadeInUp 0.4s ease both" }}
          >
            <SuccessCheckmark />

            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Order Confirmed!</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Thank you for your purchase. We've received your payment and your
                order is being processed.
              </p>
            </div>

            <div className="w-full rounded-xl border border-neutral-100 bg-neutral-50 p-5 space-y-3 text-sm">
              {confirmedOrder?.code && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order number</span>
                  <span className="font-semibold text-neutral-800">#{confirmedOrder.code}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount paid</span>
                <span className="font-semibold text-neutral-800">
                  {formatNaira(confirmedOrder?.totalWithTax ?? amountKobo)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                  Payment Settled
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              A confirmation will be sent to your email address.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/orders"
                className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white text-center hover:bg-red-700 transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="w-full rounded-full border border-neutral-200 py-3 text-sm font-medium text-neutral-700 text-center hover:bg-neutral-100 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* ── Cancelled ── */}
        {stage === "cancelled" && (
          <div
            className="flex flex-col items-center gap-6 rounded-2xl border border-yellow-100 bg-white p-10 shadow-sm text-center"
            style={{ animation: "fadeInUp 0.4s ease both" }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50">
              <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold text-neutral-900">Payment Not Completed</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Your payment was cancelled or not completed. Your cart has been saved —
                you can try again whenever you're ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/checkout"
                className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white text-center hover:bg-red-700 transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/cart"
                className="w-full rounded-full border border-neutral-200 py-3 text-sm font-medium text-neutral-700 text-center hover:bg-neutral-100 transition-colors"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        )}

        {/* ── Failed ── */}
        {stage === "failed" && (
          <div
            className="flex flex-col items-center gap-6 rounded-2xl border border-red-100 bg-white p-10 shadow-sm text-center"
            style={{ animation: "fadeInUp 0.4s ease both" }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M15 9l-6 6M9 9l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold text-neutral-900">Payment Confirmation Failed</h1>
              <p className="mt-2 text-sm text-neutral-500">
                We received your payment but couldn't confirm the order automatically.
                Please contact our support team with the details below.
              </p>
            </div>

            {errorMessage && (
              <div className="w-full rounded-xl bg-red-50 border border-red-100 p-4 text-left">
                <p className="text-xs font-semibold text-red-700 mb-1">Error details</p>
                <p className="text-xs text-red-600 font-mono break-all">{errorMessage}</p>
              </div>
            )}

            <div className="w-full rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-left space-y-2">
              {orderId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order reference</span>
                  <span className="font-mono text-xs text-neutral-700 break-all">{orderId}</span>
                </div>
              )}
              {amountKobo > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount</span>
                  <span className="font-semibold text-neutral-800">{formatNaira(amountKobo)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-neutral-400">
              If you were charged, please don't pay again — reach out to support and we'll
              resolve it manually.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  hasRun.current = false;
                  setErrorMessage("");
                  confirmPayment();
                }}
                className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white text-center hover:bg-red-700 transition-colors"
              >
                Retry Confirmation
              </button>
              <Link
                href="/"
                className="w-full rounded-full border border-neutral-200 py-3 text-sm font-medium text-neutral-700 text-center hover:bg-neutral-100 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Footer />
    </main>
  );
}

/* ─── Default export with Suspense (required for useSearchParams) ────────── */
export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size={40} />
            <p className="text-sm text-neutral-500">Loading…</p>
          </div>
        </main>
      }
    >
      <PaystackRedirectPage />
    </Suspense>
  );
}