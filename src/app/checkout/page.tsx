"use client";
import React, { useMemo, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Image from "next/image";
import PaymentScreens from "@/Components/payment/PaymentScreens";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";

import {
  GET_ACTIVE_ORDER,
  GET_CUSTOMER_ORDERS,
  TRANSITION_TO_STATE,
  PAYSTACK_INTENT,
  RECREATE_FAILED_ORDER,
} from "@/graphql/queries";

/* ------------------- Types ------------------- */
type PaymentMethod = "bank" | "card" | "paypal";

type OrderItem = {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  qty: number;
  image: string;
};

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
  shippingWithTax?: number | null;
  lines: ActiveOrderLine[];
  customer?: { emailAddress?: string | null } | null;
};

type GetActiveOrderData = {
  activeOrder: ActiveOrder | null;
};

/* ------------------- Data ------------------- */
const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const ORDER_ITEMS: OrderItem[] = [
  {
    id: "macbook",
    title: "MacBook Pro M2 (13.3-inch)",
    subtitle: "Silver",
    price: 543_000,
    qty: 1,
    image: "/assets/macbook.png",
  },
  {
    id: "sleeve",
    title: 'Inatek 13–13.3" Laptop Sleeve',
    subtitle: "4.0",
    price: 9_125,
    qty: 1,
    image: "/assets/sleeve.png",
  },
  {
    id: "privacy",
    title: "Laptop Privacy Screen for 13-inch MacBook",
    subtitle: "3.2/5",
    price: 9_236,
    qty: 1,
    image: "/assets/privacy.png",
  },
];

/* ------------------- Success Modal ------------------- */
const PaymentSuccess = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl w-full max-w-md p-8 relative">
      <button
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        onClick={onClose}
      >
        ✕
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          ✅
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Payment Successful
        </h2>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex justify-between py-3">
          <span className="text-gray-600">Payment type</span>
          <span className="text-gray-900 font-medium">Net Banking</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-600">Phone number</span>
          <span className="text-gray-900">+1234567890</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-600">Email</span>
          <span className="text-gray-900">JimmySmith1996@gmail.com</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-600">Transaction id</span>
          <span className="text-gray-900">234567890</span>
        </div>
        <div className="flex justify-between py-3 border-t border-gray-200 pt-4">
          <span className="text-gray-600">Amount Paid</span>
          <span className="text-gray-900 font-semibold text-lg">$543.02</span>
        </div>
      </div>

      <button
        className="w-full py-4 bg-red-500 text-white rounded-full text-base font-medium hover:bg-red-600"
        onClick={onClose}
      >
        Order Status
      </button>
    </div>
  </div>
);

/* ------------------- Main Page ------------------- */
const Page = () => {
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Modals
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Loading
  const [isPaying, setIsPaying] = useState(false);

  // Active order
  const { data: activeOrderData, refetch } =
    useQuery<GetActiveOrderData>(GET_ACTIVE_ORDER);
  const activeOrder = activeOrderData?.activeOrder;

  // Mutations used in the flow
  const [transitionToState] = useMutation(TRANSITION_TO_STATE, {
    variables: { state: "ArrangingPayment" },
  });

  const [createPaystackIntent] = useMutation(PAYSTACK_INTENT);
  const [recreateFailedOrder] = useMutation(RECREATE_FAILED_ORDER);

  // Fallback UI totals (if active order is not yet available)
  const fallbackSubtotal = useMemo(
    () => ORDER_ITEMS.reduce((s, it) => s + it.price * it.qty, 0),
    []
  );
  const fallbackDelivery = 1_000;
  const fallbackTax = 249;
  const fallbackTotal = fallbackSubtotal + fallbackDelivery + fallbackTax;

  /* ------------------- Checkout Handler ------------------- */
  const handleCheckout = async () => {
    if (!activeOrder) {
      alert("No active order found.");
      return;
    }

    try {
      setIsPaying(true);

      // 1) Transition to "ArrangingPayment"
      await transitionToState();

      await createPaystackIntent({
        variables: { orderCode: activeOrder.code },
      });

      if (typeof window === "undefined") return;
      // 3) Open Paystack Inline
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        amount: activeOrder.totalWithTax, // Use totalWithTax as the amount
        email: activeOrder.customer?.emailAddress || "",
        reference: activeOrder.code, // Very important: active order code
        onSuccess: async () => {
          await refetch();
          // Mirror your example: keep `id` in query param
          router.replace(
            `/main/checkout/paystack-redirect?reference=${activeOrder.id}&status=success&amount=${activeOrder.totalWithTax}`
          );
        },
        onCancel: async () => {
          await recreateFailedOrder({
            variables: { orderCode: activeOrder.code },
            refetchQueries: [
              { query: GET_ACTIVE_ORDER },
              { query: GET_CUSTOMER_ORDERS },
            ],
            awaitRefetchQueries: true,
          });
          router.replace("/main/home");
        },
      });
    } catch (err: any) {
      console.error(err);
      try {
        if (activeOrder?.code) {
          await recreateFailedOrder({
            variables: { orderCode: activeOrder.code },
            refetchQueries: [
              { query: GET_ACTIVE_ORDER },
              { query: GET_CUSTOMER_ORDERS },
            ],
            awaitRefetchQueries: true,
          });
        }
      } catch {
        // swallow recreate errors
      }
      alert("Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-neutral-800">
              Payment Method
            </h1>
            <p className="text-xs text-neutral-500">
              Showing your chosen product
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT SIDE */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-neutral-800">
                Payment
              </p>

              <div className="space-y-3">
                <RadioRow
                  checked={method === "bank"}
                  onChange={() => setMethod("bank")}
                  label="Bank Transfer"
                />

                <RadioRow
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                  label="Debit Cards"
                  right={
                    <div className="flex items-center gap-2">
                      <BrandDot title="Mastercard" className="bg-[#EB001B]" />
                      <BrandDot title="Visa" className="bg-[#1434CB]" />
                      <button
                        title="Add card"
                        onClick={() => setShowPayment(true)}
                        className="grid h-6 w-6 place-items-center rounded-full border border-neutral-300 text-neutral-500 hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  }
                />

                <RadioRow
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                  label={
                    <span className="text-[#0070ba] font-medium">PayPal</span>
                  }
                />
              </div>

              {/* Billing address */}
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-neutral-800">
                  Billing address
                </p>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3">
                  <label className="flex items-center gap-2 text-[12px] text-neutral-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                    />
                    Same as shipping address
                  </label>
                  <button
                    className="inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-700"
                    title="Edit billing address"
                  >
                    <EditIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Return link */}
            <a
              href="/cart"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:opacity-90"
            >
              <ReturnIcon />
              Return to checkout
            </a>
          </section>

          {/* RIGHT: Order Summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-neutral-800">
                Your Order
              </p>

              <div className="space-y-3">
                {activeOrder?.lines?.length
                  ? activeOrder.lines.map((ln: any) => {
                      const title =
                        ln.productVariant?.name ?? "Product Variant";
                      const thumb =
                        ln.productVariant?.product?.featuredAsset?.preview ??
                        "/assets/placeholder.png";
                      return (
                        <div key={ln.id} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">
                            <Image
                              src={thumb}
                              alt={title}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-medium text-neutral-800">
                              {title}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              x{ln.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] font-semibold text-neutral-900">
                              {NGN.format(ln.linePriceWithTax / 100)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  : ORDER_ITEMS.map((it) => (
                      <div key={it.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">
                          <Image
                            src={it.image}
                            alt={it.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-neutral-800">
                            {it.title}
                          </p>
                          {it.subtitle && (
                            <p className="text-[11px] text-neutral-500">
                              {it.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-semibold text-neutral-900">
                            {NGN.format(it.price)}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            x{it.qty}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>

              {/* Summary rows */}
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <div className="space-y-2 text-[12px]">
                  <Row
                    label="Sub total products"
                    value={NGN.format(
                      activeOrder?.subTotalWithTax
                        ? activeOrder.subTotalWithTax / 100
                        : fallbackSubtotal
                    )}
                  />
                  <Row
                    label="Delivery fee"
                    value={NGN.format(
                      activeOrder?.shippingWithTax
                        ? activeOrder.shippingWithTax / 100
                        : fallbackDelivery
                    )}
                  />
                  <Row
                    label="Tax"
                    value={
                      activeOrder
                        ? NGN.format(
                            Math.max(
                              0,
                              activeOrder.totalWithTax -
                                (activeOrder.subTotalWithTax ?? 0) -
                                (activeOrder.shippingWithTax ?? 0)
                            ) / 100
                          )
                        : NGN.format(fallbackTax)
                    }
                  />
                </div>
                <div className="mt-4">
                  <Row
                    label="Total"
                    value={NGN.format(
                      activeOrder
                        ? activeOrder.totalWithTax / 100
                        : fallbackTotal
                    )}
                    bold
                    big
                  />
                </div>

                <button
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60 cursor-pointer"
                  onClick={handleCheckout}
                  disabled={isPaying || !activeOrder}
                >
                  {isPaying ? "Processing…" : "Checkout"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />

      {/* ✅ Show card management modal */}
      {showPayment && <PaymentScreens onClose={() => setShowPayment(false)} />}

      {/* ✅ Show success modal */}
      {showSuccess && <PaymentSuccess onClose={() => setShowSuccess(false)} />}
    </main>
  );
};

/* ------------------- Helper Components ------------------- */
function RadioRow({
  checked,
  onChange,
  label,
  right,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 accent-red-500"
        />
        <span className="text-neutral-800">{label}</span>
      </div>
      {right && <div>{right}</div>}
    </label>
  );
}

function Row({
  label,
  value,
  bold,
  big,
}: {
  label: string;
  value: string;
  bold?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-600">{label}</span>
      <span
        className={`${
          bold ? "font-semibold text-neutral-900" : "text-neutral-700"
        } ${big ? "text-base" : "text-sm"}`}
      >
        {value}
      </span>
    </div>
  );
}

function BrandDot({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div
      title={title}
      className={`h-6 w-6 rounded-full ${className} ring-2 ring-white shadow`}
    />
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 17.25V21h3.75L18.81 8.94l-3.75-3.75L3 17.25z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14.06 4.94l3.75 3.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 11l-4 4m0 0l4 4m-4-4h10a6 6 0 100-12h-1"
        stroke="#ef4444"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Page;
