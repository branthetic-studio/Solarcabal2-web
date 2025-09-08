"use client";

import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { BsCartXFill } from "react-icons/bs";

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const page = () => {
  const { cart, handleAdjustQuantity } = useCart();
  const router = useRouter();

  if (!cart?.activeOrder) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="m-auto max-w-6xl px-4 py-16 h-100 text-center text-neutral-600 flex items-center justify-center flex-col gap-4">
          Your cart is empty
          <BsCartXFill size={86} color="grey" />
        </div>
        <Footer />
      </main>
    );
  }

  const order = cart.activeOrder;
  const subtotal = order.subTotalWithTax;
  const deliveryFee =
    order.shippingLines?.reduce(
      (sum, s) => sum + (s?.priceWithTax ?? 0),
      0
    ) ?? 0;
  const tax =
    order.taxSummary?.reduce((sum, t) => sum + (t.taxTotal ?? 0), 0) ?? 0;
  const total = order.totalWithTax;

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT: items */}
          <div className="space-y-4">
            {order.lines.map((line) => {
              const product = line.productVariant.product;
              const img = line.featuredAsset?.preview;

              return (
                <div
                  key={line.id}
                  className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {img ? (
                        <Image
                          src={img}
                          alt={product.slug}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                          No Image
                        </span>
                      )}
                    </div>

                    {/* details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800">
                            {line.productVariant.name}
                          </p>
                          <p className="mt-2 text-[13px] font-semibold text-neutral-900">
                            {NGN.format(line.unitPriceWithTax)}{" "}
                            <span className="text-[10px] font-normal text-neutral-500">
                              / pcs
                            </span>
                          </p>
                        </div>

                        {/* qty + remove */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                            <button
                              aria-label="decrease quantity"
                              onClick={() =>
                                handleAdjustQuantity(line.id, line.quantity - 1)
                              }
                              className="h-8 w-8 text-neutral-600 hover:bg-neutral-50"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                className="mx-auto"
                              >
                                <path
                                  d="M5 10h10"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <span className="px-3 text-sm tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              aria-label="increase quantity"
                              onClick={() =>
                                handleAdjustQuantity(line.id, line.quantity + 1)
                              }
                              className="h-8 w-8 text-neutral-600 hover:bg-neutral-50"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                className="mx-auto"
                              >
                                <path
                                  d="M10 5v10M5 10h10"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>

                          <button
                            aria-label="remove"
                            onClick={() => handleAdjustQuantity(line.id, 0)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* line total */}
                      <div className="mt-3 flex items-center justify-end">
                        <span className="text-xs text-neutral-500 mr-1">
                          Total
                        </span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {NGN.format(line.linePriceWithTax)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mt-2">
                <p className="mb-3 text-sm font-semibold text-neutral-800">
                  Summary
                </p>
                <div className="space-y-2 text-[12px]">
                  <Row label="Sub total products" value={NGN.format(subtotal)} />
                  <Row label="Delivery fee" value={NGN.format(deliveryFee)} />
                  <Row label="Tax" value={NGN.format(tax)} />
                </div>

                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <Row label="Total" value={NGN.format(total)} bold big />
                </div>

                <button
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                  onClick={() => router.push("/checkout")} 
                >
                  Checkout
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
};

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
    <div className="flex items-center justify-between">
      <span className={`text-neutral-500 ${big ? "text-sm" : ""}`}>
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold ? "font-semibold text-neutral-900" : "text-neutral-800"
        } ${big ? "text-base" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default page;
