"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { GET_CUSTOMER_ORDERS } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import Suscribe from "@/Components/Suscribe/Suscribe";

/* ── Types ───────────────────────────────────────────────────────────────── */
type Order = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  currencyCode: string;
  createdAt: string;
};

type GetCustomerOrdersResponse = {
  activeCustomer: {
    orders: {
      totalItems: number;
      items: Order[];
    };
  } | null;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const money = (amountInCents: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, (amountInCents || 0) / 100));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATE_STYLES: Record<string, { label: string; classes: string }> = {
  PaymentSettled: { label: "Paid", classes: "bg-green-100 text-green-700" },
  PaymentAuthorized: { label: "Authorized", classes: "bg-blue-100 text-blue-700" },
  Shipped: { label: "Shipped", classes: "bg-indigo-100 text-indigo-700" },
  Delivered: { label: "Delivered", classes: "bg-green-100 text-green-800" },
  Cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-700" },
  AddingItems: { label: "Draft", classes: "bg-gray-100 text-gray-600" },
  ArrangingPayment: { label: "Pending", classes: "bg-yellow-100 text-yellow-700" },
};

const getStateStyle = (state: string) =>
  STATE_STYLES[state] ?? { label: state, classes: "bg-gray-100 text-gray-600" };

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const router = useRouter();
  const { customer, loading: userLoading } = useUser();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, loading, error } = useQuery<GetCustomerOrdersResponse>(
    GET_CUSTOMER_ORDERS,
    {
      variables: {
        options: {
          take: pageSize,
          skip: (page - 1) * pageSize,
        },
      },
      skip: !customer, // don't run if not logged in
      fetchPolicy: "cache-and-network",
    }
  );

  const orders = data?.activeCustomer?.orders?.items ?? [];
  const totalItems = data?.activeCustomer?.orders?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  /* ── Not logged in ── */
  if (!userLoading && !customer) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-14 w-14 text-neutral-300 mb-4" />
          <h1 className="text-xl font-semibold text-neutral-800">Sign in to view your orders</h1>
          <p className="mt-2 text-sm text-neutral-500">
            You need to be logged in to see your order history.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
        <Suscribe />
        <Footer />
      </main>
    );
  }

  /* ── Loading skeleton ── */
  if (loading || userLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-7 w-40 bg-neutral-200 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-neutral-200 p-5 animate-pulse">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-neutral-200 rounded" />
                    <div className="h-3 w-24 bg-neutral-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="h-4 w-24 bg-neutral-100 rounded" />
                  <div className="h-4 w-16 bg-neutral-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Suscribe />
        <Footer />
      </main>
    );
  }

  /* ── Error ── */
  /* ── Error ── */
  if (error && !data) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-red-500 text-sm">Failed to load orders. Please try again later.</p>
        </div>
        <Suscribe />
        <Footer />
      </main>
    );
  }

  /* ── Empty state ── */
  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-xl font-semibold text-neutral-900 mb-8">My Orders</h1>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-16 text-center">
            <Package className="h-14 w-14 text-neutral-300 mb-4" />
            <p className="font-semibold text-neutral-700">No orders yet</p>
            <p className="mt-1 text-sm text-neutral-400">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/products"
              className="mt-6 rounded-full bg-red-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Suscribe />
        <Footer />
      </main>
    );
  }

  /* ── Orders list ── */
  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-neutral-900">My Orders</h1>
          <span className="text-sm text-neutral-400">{totalItems} order{totalItems !== 1 ? "s" : ""}</span>
        </div>

        {/* Orders */}
        <ul className="space-y-4">
          {orders.map((order) => {
            const { label, classes } = getStateStyle(order.state);
            return (
              <li key={order.id}>
                <button
                  // onClick={() => router.push(`/orders/${order.code}`)}
                  className="w-full text-left rounded-2xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                        <Package className="h-5 w-5 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          Order #{order.code}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    {/* <div className="flex items-center gap-3 shrink-0">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}>
                        {label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                    </div> */}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-xs text-neutral-400">Total</span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {money(order.totalWithTax, order.currencyCode)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Suscribe />
      <Footer />
    </main>
  );
}