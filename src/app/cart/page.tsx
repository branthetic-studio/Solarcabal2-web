"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";
import Footer from "@/Components/Footer/Footer";
import Navbar from "@/Components/Navbar/Navbar";
import { toast } from "sonner";
import Suscribe from "@/Components/Suscribe/Suscribe";
import { useQuery } from "@apollo/client/react";
import { GET_ACCOUNT_DETAILS } from "@/graphql/queries";
import AuthModal from "@/Components/AuthModal";

/**
 * Format a value in cents to a currency string.
 * Vendure stores all prices in cents (e.g. 150000 = ₦1,500).
 */
const money = (amountInCents: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, (amountInCents || 0) / 100));

export default function CartPage() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { cart, handleAdjustQuantity, removeFromCartMutation } = useCart();
  const { items: localItems, updateQuantity, removeItem } = useLocalCart();
  const u = useUser() as any;
  const isLoggedIn = !!(u?.me || u?.user || u?.activeCustomer || u?.customer);

  const order = cart?.activeOrder;
  const lines = isLoggedIn ? order?.lines ?? [] : [];

  const serverSubtotal = order?.subTotalWithTax ?? 0;
  const serverShipping = (order?.shippingLines ?? []).reduce(
    (s: number, x: any) => s + (x?.priceWithTax ?? 0),
    0
  );
  const serverTax = (order?.taxSummary ?? []).reduce(
    (s: number, x: any) => s + (x?.tax ?? 0),
    0
  );
  const serverTotal =
    order?.totalWithTax ?? serverSubtotal + serverShipping + serverTax;
  const serverCurrency = order?.currencyCode ?? "NGN";

  // Local cart totals — priceWithTax is stored in cents
  const localSubtotal = localItems.reduce(
    (s, it) => s + (it.priceWithTax ?? 0) * (it.quantity ?? 1),
    0
  );
  const localCurrency = localItems[0]?.currencyCode ?? "NGN";

  const { data: accountData, loading: accountLoading } = useQuery(
    GET_ACCOUNT_DETAILS,
    { skip: !isLoggedIn, fetchPolicy: "network-only" }
  );

  const activeCustomer = (accountData as any)?.activeCustomer ?? null;
  const addresses = activeCustomer?.addresses ?? [];
  const defaultShippingAddress =
    addresses.find((a: any) => a.defaultShippingAddress) ?? null;

  // ── Empty state: guest ──────────────────────────────────────────────────────
  if (!isLoggedIn && localItems.length === 0) {
    return (
      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <Navbar />
        <h1 className="text-xl sm:text-2xl font-semibold">Shopping Cart</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-neutral-600">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  // ── Empty state: logged in ──────────────────────────────────────────────────
  if (isLoggedIn && lines.length === 0) {
    return (
      <main className="mx-auto">
        <Navbar />
        <div className="px-8 py-6 my-6">
          <h1 className="text-xl sm:text-2xl font-semibold">Shopping Cart</h1>
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-neutral-600">Your cart is empty.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
        <Suscribe />
        <Footer />
      </main>
    );
  }

  return (
    <main className="w-full">
      <Navbar />
      <div className="w-full px-18">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">Shopping Cart</h1>
        </div>

        {/* Grid: Items + Summary */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Items ─────────────────────────────────────────────────────── */}
          <section className="lg:col-span-2">
            <ul className="space-y-4">

              {/* Logged-in: server cart lines */}
              {isLoggedIn
                ? (lines as any[]).map((line: any) => {
                    const asset =
                      line?.featuredAsset?.preview ??
                      line?.productVariant?.product?.featuredAsset?.preview ??
                      line?.productVariant?.product?.assets?.[0]?.preview ??
                      null;

                    const name =
                      line?.productVariant?.product?.name ??
                      line?.productVariant?.name ??
                      "Product";

                    const brand =
                      line?.productVariant?.product?.facetValues?.find?.(
                        (fv: any) => /brand/i.test(fv?.facet?.name ?? "")
                      )?.name ?? "—";

                    const unitPrice = line?.unitPriceWithTax ?? 0;
                    const lineTotal =
                      line?.linePriceWithTax ?? unitPrice * (line?.quantity ?? 1);

                    return (
                      <li
                        key={line.id}
                        className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-4">
                          {/* Image */}
                          <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg bg-neutral-100 shrink-0">
                            {asset ? (
                              <Image
                                src={asset}
                                alt={name}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                No Image
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] sm:text-base font-semibold text-neutral-900">
                                  {name}
                                </p>
                                <p className="mt-0.5 text-xs sm:text-[13px] text-neutral-500">
                                  {brand}
                                </p>
                                <p className="mt-2 text-[13px] sm:text-sm font-semibold text-neutral-900">
                                  {money(unitPrice, serverCurrency)}{" "}
                                  <span className="text-[11px] font-normal text-neutral-500">
                                    / pcs
                                  </span>
                                </p>
                              </div>

                              <div className="text-right">
                                <button
                                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700"
                                  onClick={() => removeFromCartMutation(line.id)}
                                  aria-label="Remove"
                                >
                                  Remove <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="mt-3 text-[12px] sm:text-sm text-neutral-500">
                                  <span className="mr-1">Total</span>
                                  <span className="font-semibold text-neutral-900">
                                    {money(lineTotal, serverCurrency)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Qty */}
                            <div className="mt-3 sm:mt-4 flex items-center gap-3">
                              <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                                <button
                                  onClick={() =>
                                    handleAdjustQuantity(
                                      line.id,
                                      Math.max(0, (line.quantity ?? 1) - 1)
                                    )
                                  }
                                  className="h-8 w-8 flex items-center justify-center"
                                  aria-label="Decrease"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-[13px] font-medium">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleAdjustQuantity(
                                      line.id,
                                      (line.quantity ?? 1) + 1
                                    )
                                  }
                                  className="h-8 w-8 flex items-center justify-center"
                                  aria-label="Increase"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })

                /* Guest: local cart items */
                : localItems.map((line) => {
                    // priceWithTax is stored in cents (e.g. 150000 = ₦1,500)
                    // money() divides by 100, so pass the raw cent value directly
                    const unitPrice = line.priceWithTax ?? 0;
                    const lineTotal = unitPrice * (line.quantity ?? 1);

                    return (
                      <li
                        key={line.id}
                        className="border-b border-neutral-200 bg-white p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-4">
                          {/* Image */}
                          <div className="h-20 w-20 p-2 sm:h-20 sm:w-20 overflow-hidden rounded-lg bg-neutral-100 shrink-0">
                            {line.image ? (
                              <Image
                                src={line.image}
                                alt={line.name}
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                No Image
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] sm:text-base font-semibold text-neutral-900">
                                  {line.name}
                                </p>
                                <p className="mt-0.5 text-xs sm:text-[13px] text-neutral-500">
                                  {line.brand ?? "—"}
                                </p>
                                {/* Unit price — stored in cents, money() divides by 100 */}
                                <p className="mt-2 text-[13px] sm:text-sm font-semibold text-neutral-900">
                                  {money(unitPrice, localCurrency)}{" "}
                                  <span className="text-[11px] font-normal text-neutral-500">
                                    / pcs
                                  </span>
                                </p>
                              </div>

                              <div className="text-right">
                                <button
                                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700"
                                  onClick={() => removeItem(line.id)}
                                  aria-label="Remove"
                                >
                                  Remove <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="mt-3 text-[12px] sm:text-sm text-neutral-500">
                                  <span className="mr-1 text-xs">Total</span>
                                  <span className="font-semibold text-neutral-900">
                                    {money(lineTotal, localCurrency)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Qty */}
                            <div className="mt-3 sm:mt-4 flex items-center gap-3">
                              <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      line.id,
                                      Math.max(0, (line.quantity ?? 1) - 1)
                                    )
                                  }
                                  className="h-8 w-8 flex items-center justify-center"
                                  aria-label="Decrease"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-[13px] font-medium">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(line.id, (line.quantity ?? 1) + 1)
                                  }
                                  className="h-8 w-8 flex items-center justify-center"
                                  aria-label="Increase"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
            </ul>

            {/* Continue shopping */}
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-5 py-2 text-sm font-medium hover:bg-neutral-50"
              >
                ← Continue shopping
              </Link>
            </div>
          </section>

          {/* ── Order Summary ─────────────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-6 h-max rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold">Order Summary</h2>

            {isLoggedIn ? (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Sub total products</dt>
                  <dd className="font-semibold">{money(serverSubtotal, serverCurrency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Delivery fee</dt>
                  <dd className="font-semibold">{money(serverShipping, serverCurrency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Tax</dt>
                  <dd className="font-semibold">{money(serverTax, serverCurrency)}</dd>
                </div>
                <div className="mt-3 border-t border-neutral-200 pt-3 text-base">
                  <div className="flex justify-between">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-semibold">{money(serverTotal, serverCurrency)}</dd>
                  </div>
                </div>
              </dl>
            ) : (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Sub total products</dt>
                  <dd className="font-semibold">{money(localSubtotal, localCurrency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Delivery fee</dt>
                  <dd className="font-semibold">{money(0, localCurrency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Tax</dt>
                  <dd className="font-semibold">{money(0, localCurrency)}</dd>
                </div>
                <div className="mt-3 border-t border-neutral-200 pt-3 text-base">
                  <div className="flex justify-between">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-semibold">{money(localSubtotal, localCurrency)}</dd>
                  </div>
                </div>
              </dl>
            )}

            {/* Customer details */}
            <div className="mt-6 rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Customer Details</p>
                <button
                  onClick={() => router.push("/Accounts")}
                  className="inline-flex items-center gap-1 text-xs hover:text-red-700"
                >
                  Change{" "}
                  <Image
                    src="/edit-rectangle.png"
                    alt="edit"
                    className="h-3.5 w-3.5"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              <div className="mt-3 text-xs text-neutral-700">
                {accountLoading ? (
                  <p className="text-neutral-500">Loading...</p>
                ) : activeCustomer ? (
                  <>
                    <p className="font-medium">
                      {activeCustomer.firstName} {activeCustomer.lastName}
                    </p>
                    <p className="mt-1 text-neutral-500">{activeCustomer.emailAddress}</p>
                    <p className="mt-1 text-neutral-500">
                      {defaultShippingAddress?.phoneNumber ?? "No phone number"}
                    </p>
                  </>
                ) : (
                  <p className="text-neutral-500">No customer details found</p>
                )}
              </div>
            </div>

            {/* Delivery details */}
            <div className="mt-4 rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Delivery Details</p>
                <button
                  onClick={() => router.push("/Accounts")}
                  className="inline-flex items-center gap-1 text-xs hover:text-red-700"
                >
                  Change{" "}
                  <Image
                    src="/edit-rectangle.png"
                    alt="edit"
                    className="h-3.5 w-3.5"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              <div className="mt-3 text-xs text-neutral-700">
                {defaultShippingAddress ? (
                  <>
                    <p>Door Delivery</p>
                    <p className="mt-1 text-neutral-500">
                      {defaultShippingAddress.streetLine1}
                      {defaultShippingAddress.city ? `, ${defaultShippingAddress.city}` : ""}
                    </p>
                    <p className="mt-1 text-neutral-500">
                      {defaultShippingAddress.country?.name ?? "Nigeria"}
                    </p>
                  </>
                ) : (
                  <>
                    <p>No delivery address</p>
                    <p className="mt-1 text-neutral-500">
                      Please add an address in your account
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  toast.info("Please log in to checkout", {
                    action: { label: "Log in", onClick: () => setIsAuthOpen(true) },
                    duration: 4000,
                  });
                  setIsAuthOpen(true);
                  return;
                }
                router.push("/checkout");
              }}
              className="mt-6 w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              Checkout
            </button>
          </aside>
        </div>
      </div>
      <Suscribe />
      <Footer />
      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </main>
  );
}