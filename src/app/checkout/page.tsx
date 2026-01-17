"use client";
import React, { useMemo, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Image from "next/image";
import PaymentScreens from "@/Components/payment/PaymentScreens";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import Suscribe from "@/Components/Suscribe/Suscribe";

import {
  GET_ACTIVE_ORDER,
  GET_CUSTOMER_ORDERS,
  TRANSITION_TO_STATE,
  PAYSTACK_INTENT,
  RECREATE_FAILED_ORDER,
} from "@/graphql/queries";



/* ------------------- Types ------------------- */
type PaymentMethod = "bank" | "card" | "paypal";

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

interface InfoRowProps {
  icon: React.ReactNode; // <- allow image, emoji, or anything
  title: string;
  text: string;
}

type ActiveOrder = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  subTotalWithTax?: number | null;
  lines: ActiveOrderLine[];
  customer?: { emailAddress?: string | null } | null;
};

/* ------------------- Formatter ------------------- */
const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/* ------------------- GraphQL Update Cart Mutation ------------------- */
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

const Page = () => {
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [isPaying, setIsPaying] = useState(false);

  

  /* ------------------- Active Order Query ------------------- */
  const { data: activeOrderData, refetch } =
    useQuery<{ activeOrder: ActiveOrder }>(GET_ACTIVE_ORDER);

  const activeOrder = activeOrderData?.activeOrder;

  /* ------------------- Mutations ------------------- */
  const [updateCartMutation] = useMutation(UPDATE_CART);
  const [transitionToState] = useMutation(TRANSITION_TO_STATE);
  const [createPaystackIntent] = useMutation(PAYSTACK_INTENT);
  const [recreateFailedOrder] = useMutation(RECREATE_FAILED_ORDER);

  /* -------------- Update Quantity Handler -------------- */
  const updateQuantity = async (lineId: string, qty: number) => {
    if (qty < 1) return;

    try {
      const res = await updateCartMutation({
        variables: { lineId, quantity: qty },
      });

      if (res.data.adjustOrderLineQuantity.__typename === "Order") {
        await refetch();
      } else {
        alert(res.data.adjustOrderLineQuantity.message);
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  /* ------------------- Checkout + Paystack ------------------- */
  const handleCheckout = async () => {
    if (!activeOrder) return alert("No active order found.");

    try {
      setIsPaying(true);

      await transitionToState({ variables: { state: "ArrangingPayment" } });

      await createPaystackIntent({
        variables: { orderCode: activeOrder.code },
      });

      const { default: PaystackPop } = await import("@paystack/inline-js");

      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        amount: activeOrder.totalWithTax,
        email: activeOrder.customer?.emailAddress || "",
        reference: activeOrder.code,
        onSuccess: () => {
          router.replace(
            `/main/checkout/paystack-redirect?reference=${activeOrder.id}&status=success&amount=${activeOrder.totalWithTax}`
          );
        },
        onCancel: async () => {
          await recreateFailedOrder({
            variables: { orderCode: activeOrder.code },
          });
          router.replace("/main/home");
        },
      });
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-md font-semibold text-neutral-800">
          Payment Method
        </h1>
        <p className="text-xs text-neutral-500">
          Showing your selected products
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* ---------------- LEFT SIDE ---------------- */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#d1d1d1]  p-5">
              <p className="mb-4 text-lg font-semibold">Payment</p>


              {/* Radio Buttons */}
              <div className="flex flex-col gap-4">
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
                    <div className="flex gap-2 items-center">
                      <Image
                        src="/master card.png"
                        alt="Visa"
                        width={36}
                        height={36} />


                      <Image
                        src="/visapay.png"
                        alt="Visa"
                        width={36}
                        height={36} />

                      <button
                        onClick={() => setShowPayment(true)}
                        className="w-6 h-6 flex items-center justify-center border rounded-full"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  }
                />

                <RadioRow
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                  label={<span className="">PayPal</span>}
                />
              </div>



              {/* Billing address */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Billing Address</p>

                <div className="flex justify-between items-center bg-neutral-100 rounded-xl p-3">
                  <label className="flex gap-2 items-center text-sm">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="accent-red-500"
                    />
                    Same as shipping
                  </label>

                  <button className="text-neutral-600 hover:text-neutral-600">
                    ✎
                  </button>
                </div>
              </div>
            </div>

            {/* Back to cart */}
            <button
              onClick={() => router.push("/cart")}
              className="text-red-500 text-sm font-medium flex items-center gap-2"
            >
              <Image src="/shopping-cart.png" alt="Back" width={16} height={16} /> Return to Cart
            </button>

            {/* Info rows */}
            <div className="rounded-2xl border border-[#d1d1d1] bg-white p-5 pt-8">
              <h3 className="text-sm font-semibold mb-4 border-b border-[#d1d1d1] pb-4">Delivery & Products</h3>

           <div className="flex flex-col gap-5">
               <InfoRow icon={<Image src="/truck.png" alt="Delivery" width={24} height={24} />} title="Delivery" text="1–9 business days" />
              <InfoRow icon={<Image src="/repeat.png" alt="Delivery" width={24} height={24} />} title="Returns" text="7-day return policy" />
              <InfoRow icon={<Image src="/shield.png" alt="Delivery" width={24} height={24} />} title="Warranty" text="Varies per item" />
           </div>
            </div>
          </section>

          {/* ---------------- RIGHT SIDE (SUMMARY) ---------------- */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#d1d1d1] bg-white p-6">
              <p className="text-sm font-semibold mb-3">Your Order</p>

              <div className="space-y-5">
                {activeOrder?.lines?.map((ln) => (
                  <div key={ln.id} className="flex gap-3 items-start">
                    <Image
                      src={
                        ln.productVariant?.product?.featuredAsset?.preview ||
                        "/placeholder.png"
                      }
                      alt="preview"
                      width={55}
                      height={55}
                      className="rounded border"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {ln.productVariant?.name}
                      </p>
                      <p className="text-xs text-neutral-500">Category</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="w-6 h-6 border rounded"
                          onClick={() =>
                            updateQuantity(ln.id, ln.quantity - 1)
                          }
                        >
                          –
                        </button>

                        <span>{ln.quantity}</span>

                        <button
                          className="w-6 h-6 border rounded"
                          onClick={() =>
                            updateQuantity(ln.id, ln.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {NGN.format(ln.linePriceWithTax / 100)}
                      </p>
                      <button className="text-xs text-red-500">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <Row
                  label="Subtotal"
                  value={NGN.format(
                    (activeOrder?.subTotalWithTax ?? 0) / 100
                  )}
                />
                <Row label="Discount" value="- ₦1,011.87" />
                <Row label="Shipping" value="₦252,000" />
              </div>

              <div className="mt-3">
                <Row
                  big
                  bold
                  label="Grand Total"
                  value={NGN.format((activeOrder?.totalWithTax ?? 0) / 100)}
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPaying}
                className={`mt-4 w-full py-3 rounded-full text-white text-sm font-medium ${isPaying ? "bg-red-300" : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {isPaying ? "Processing..." : "Checkout"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Suscribe />
      <Footer />

      {showPayment && <PaymentScreens onClose={() => setShowPayment(false)} />}
    </main>
  );
};

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
      <span>{label}</span>
      <span className={`${bold ? "font-bold" : ""} ${big ? "text-base" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BrandDot({ className }: any) {
  return <div className={`w-6 h-6 rounded-full ${className}`} />;
}

function InfoRow({ icon, title, text }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f0f0f0] pb-2">
      <div className="w-6 h-6 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}

export default Page;
