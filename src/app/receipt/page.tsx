"use client";

import React, { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useUser } from "@/context/UserContext";
import { Package, ArrowLeft, Download, Share2, AlertCircle } from "lucide-react";
import Suscribe from "@/Components/Suscribe/Suscribe";


const GET_ORDER_FOR_RECEIPT = gql`
  query GetOrderForReceipt($code: String!) {
    activeCustomer {
      orders(options: { filter: { code: { eq: $code } } }) {
        items {
          id
          code
          state
          totalWithTax
          subTotalWithTax
          shippingWithTax
          currencyCode
          orderPlacedAt
          createdAt
          lines {
            id
            quantity
            linePriceWithTax
            featuredAsset {
              preview
            }
            productVariant {
              id
              name
              sku
              product {
                name
              }
            }
          }
          shippingAddress {
            fullName
            streetLine1
            city
            postalCode
          }
        }
      }
    }
  }
`;


const money = (cents: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, (cents || 0) / 100));

const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + ", " + d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATE_BADGE: Record<string, { label: string; classes: string }> = {
  PaymentSettled:     { label: "Paid",        classes: "bg-green-50 text-green-700 border border-green-200" },
  PaymentAuthorized:  { label: "Paid",        classes: "bg-green-50 text-green-700 border border-green-200" },
  PartiallyShipped:   { label: "Shipped out", classes: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  Shipped:            { label: "Shipped out", classes: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  PartiallyDelivered: { label: "Delivered",   classes: "bg-green-50 text-green-800 border border-green-200" },
  Delivered:          { label: "Delivered",   classes: "bg-green-50 text-green-800 border border-green-200" },
  Cancelled:          { label: "Cancelled",   classes: "bg-orange-50 text-orange-600 border border-orange-200" },
  AddingItems:        { label: "Draft",       classes: "bg-gray-100 text-gray-600 border border-gray-200" },
  ArrangingPayment:   { label: "Pending",     classes: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
};

const getStateBadge = (state: string) =>
  STATE_BADGE[state] ?? { label: state, classes: "bg-gray-100 text-gray-600 border border-gray-200" };


export default function ReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("code");
  const { customer, loading: userLoading } = useUser();
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery<{
    activeCustomer: {
      orders: {
        items: Array<{
          id: string;
          code: string;
          state: string;
          totalWithTax: number;
          subTotalWithTax: number;
          shippingWithTax: number;
          currencyCode: string;
          orderPlacedAt?: string;
          createdAt: string;
          lines: Array<{
            id: string;
            quantity: number;
            linePriceWithTax: number;
            featuredAsset?: { preview: string } | null;
            productVariant: {
              id: string;
              name: string;
              sku: string;
              product?: { name: string } | null;
            };
          }>;
          shippingAddress?: {
            fullName?: string;
            streetLine1?: string;
            city?: string;
            postalCode?: string;
          } | null;
        }>;
      };
    } | null;
  }>(GET_ORDER_FOR_RECEIPT, {
    variables: { code: orderCode },
    skip: !orderCode || !customer,
    fetchPolicy: "cache-and-network",
  });

  const order = data?.activeCustomer?.orders?.items?.[0];
  const currency = order?.currencyCode ?? "NGN";
  const lines = order?.lines ?? [];
  const subTotal = order?.subTotalWithTax ?? 0;
  const shipping = order?.shippingWithTax ?? 0;
  const total = order?.totalWithTax ?? 0;
  const placedAt = order?.orderPlacedAt ?? order?.createdAt;
  const { label: stateLabel, classes: stateClasses } = getStateBadge(order?.state ?? "");

  /* ── Generate receipt as PNG image (images stripped to avoid CORS) ── */
  const [shareCopied, setShareCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const generateReceiptImage = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null;

    const { toPng } = await import("html-to-image");

 
    const dataUrl = await toPng(receiptRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 2,
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLImageElement) return false;
        if (node instanceof HTMLElement && node.dataset?.receiptExclude === "true") return false;
        return true;
      },
    });

    const res = await fetch(dataUrl);
    return await res.blob();
  };

 
  const handleShare = async () => {
    setIsGeneratingImage(true);
    try {
      const blob = await generateReceiptImage();
      if (!blob) {
        console.error("[receipt] no blob generated");
        return;
      }

      const file = new File([blob], `receipt-${order?.code ?? "order"}.png`, {
        type: "image/png",
      });

      // Try native share with file (mobile / AirDrop / supported browsers)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Receipt #${order?.code}`,
            files: [file],
          });
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
          console.warn("[receipt] navigator.share failed, falling back to download:", err);
        }
      }

  
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order?.code ?? "order"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error("[receipt] share image failed:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  /* ── Handle download (saves receipt as PNG image) ── */
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateReceiptImage();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${order?.code ?? "order"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[receipt] download image failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── Not logged in ── */
  if (!userLoading && !customer) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="text-neutral-600">Please sign in to view your receipt.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white"
          >
            Go Home
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  /* ── No code param ── */
  if (!orderCode) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <p className="text-neutral-600">No order code provided.</p>
          <button
            onClick={() => router.push("/orders")}
            className="mt-4 rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white"
          >
            Back to Orders
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  /* ── Loading ── */
  if (loading || userLoading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse mb-8" />
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6 animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-32 bg-neutral-200 rounded" />
                  <div className="h-4 w-40 bg-neutral-100 rounded" />
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 pt-6 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-neutral-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-neutral-200 rounded" />
                    <div className="h-3 w-24 bg-neutral-100 rounded" />
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  /* ── Error ── */
  if (error || !order) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-300 mb-4" />
          <p className="text-neutral-600">
            {error ? "Failed to load receipt." : "Order not found."}
          </p>
          <button
            onClick={() => router.push("/orders")}
            className="mt-4 rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white"
          >
            Back to Orders
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  /* ── Receipt ── */
  return (
    <main className="min-h-screen bg-[#f5f5f5] print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="mx-auto max-w-[92%] py-10">

        {/* Back + heading */}
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <h1 className="text-lg font-bold text-neutral-900 mb-5">Receipt</h1>

        {/* ── Receipt card ── */}
        <div
          ref={receiptRef}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          {/* Transaction meta */}
          <div className="px-6 pt-6 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Transaction ID</span>
              <span className="text-sm font-medium text-neutral-800 font-mono">
                {order.code}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Time</span>
              <span className="text-sm text-neutral-800">
                {formatDateTime(placedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Status</span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${stateClasses}`}
              >
                {stateLabel}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-neutral-200 mx-6" />

          {/* Product lines */}
          <div className="px-6 py-4 space-y-4">
            {lines.map((line: any) => (
              <div key={line.id} className="flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 shrink-0 rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center">
                  {line.featuredAsset?.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.featuredAsset.preview}
                      alt={line.productVariant?.name ?? "Product"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-neutral-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">
                    {line.productVariant?.product?.name ?? line.productVariant?.name ?? "Product"}
                  </p>
                  {line.productVariant?.name && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {line.productVariant.name}
                    </p>
                  )}
                  {line.quantity > 1 && (
                    <p className="text-xs text-neutral-400">Qty: {line.quantity}</p>
                  )}
                  <p className="text-sm font-semibold text-neutral-800 mt-1">
                    {money(line.linePriceWithTax, currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-neutral-200 mx-6" />

          {/* Totals */}
          <div className="px-6 py-4 space-y-2.5">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span>{money(subTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Delivery Fee</span>
              <span>{money(shipping, currency)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-100">
              <span>Total Amount</span>
              <span className="text-base">{money(total, currency)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div data-receipt-exclude="true" className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              onClick={() => router.push("/enquiries")}
              className="flex-1 rounded-full bg-red-600 text-white py-3 text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Dispute Resolution
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 rounded-full bg-neutral-900 text-white py-3 text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Generating..." : "Download Receipt"}
            </button>
            <button
              onClick={handleShare}
              disabled={isGeneratingImage}
              className="flex-1 rounded-full border border-neutral-300 text-neutral-700 py-3 text-sm font-semibold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Share2 className="h-4 w-4" />
              {isGeneratingImage ? "Preparing..." : shareCopied ? "Saved!" : "Share Receipt"}
            </button>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Suscribe />
        <Footer />
      </div>
    </main>
  );
}