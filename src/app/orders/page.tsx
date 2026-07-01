

// "use client";

// import React, { useState } from "react";
// import { useQuery } from "@apollo/client/react";
// import { gql } from "@apollo/client";
// import { GET_CUSTOMER_ORDERS } from "@/graphql/queries";
// import Navbar from "@/Components/Navbar/Navbar";
// import Footer from "@/Components/Footer/Footer";
// import { useUser } from "@/context/UserContext";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Package, ShoppingBag, ArrowRight } from "lucide-react";
// import Suscribe from "@/Components/Suscribe/Suscribe";

// /* ─────────────────────────────────────────────────────────────────────────────
//    Separate detail query — does NOT touch the existing GET_CUSTOMER_ORDERS
// ───────────────────────────────────────────────────────────────────────────── */
// const GET_ORDER_DETAIL = gql`
//   query GetOrderDetail($code: String!) {
//     activeCustomer {
//       orders(options: { filter: { code: { eq: $code } } }) {
//         items {
//           id
//           code
//           state
//           totalWithTax
//           subTotalWithTax
//           shippingWithTax
//           currencyCode
//           orderPlacedAt
//           createdAt
//           lines {
//             id
//             quantity
//             linePriceWithTax
//             taxRate
//             featuredAsset {
//               preview
//             }
//             productVariant {
//               id
//               name
//               sku
//             }
//           }
//           shippingAddress {
//             fullName
//             streetLine1
//             city
//             postalCode
//           }
//         }
//       }
//     }
//   }
// `;

// /* ─────────────────────────────────────────────────────────────────────────────
//    Types
// ───────────────────────────────────────────────────────────────────────────── */
// type OrderLine = {
//   id: string;
//   productVariant: { name: string; sku: string };
//   quantity: number;
//   taxRate: number;
//   linePriceWithTax: number;
//   featuredAsset?: { preview: string } | null;
// };

// type Order = {
//   id: string;
//   code: string;
//   state: string;
//   totalWithTax: number;
//   currencyCode?: string;
//   orderPlacedAt?: string;
//   createdAt?: string;
//   lines?: OrderLine[];
//   subTotalWithTax?: number;
//   shippingWithTax?: number;
//   shippingAddress?: {
//     fullName?: string;
//     streetLine1?: string;
//     city?: string;
//     postalCode?: string;
//   };
// };

// type GetCustomerOrdersResponse = {
//   activeCustomer: {
//     orders: {
//       totalItems: number;
//       items: Order[];
//     };
//   } | null;
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    Helpers
// ───────────────────────────────────────────────────────────────────────────── */
// const money = (amountInCents: number, currency = "NGN") =>
//   new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format(Math.max(0, (amountInCents || 0) / 100));

// const formatDate = (iso?: string) => {
//   if (!iso) return "—";
//   return new Date(iso).toLocaleDateString("en-NG", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatDateTime = (iso?: string) => {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   const date = d.toLocaleDateString("en-NG", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
//   const time = d.toLocaleTimeString("en-NG", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
//   return `${date} · ${time}`;
// };

// /* ─────────────────────────────────────────────────────────────────────────────
//    State badge styles
// ───────────────────────────────────────────────────────────────────────────── */
// const STATE_STYLES: Record<
//   string,
//   { label: string; textColor: string; badgeClass: string }
// > = {
//   PaymentSettled: {
//     label: "Paid",
//     textColor: "text-green-600",
//     badgeClass: "bg-green-50 text-green-700 border border-green-200",
//   },
//   PaymentAuthorized: {
//     label: "Paid",
//     textColor: "text-green-600",
//     badgeClass: "bg-green-50 text-green-700 border border-green-200",
//   },
//   PartiallyShipped: {
//     label: "Shipped out",
//     textColor: "text-indigo-600",
//     badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
//   },
//   Shipped: {
//     label: "Shipped out",
//     textColor: "text-indigo-600",
//     badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
//   },
//   PartiallyDelivered: {
//     label: "Delivered",
//     textColor: "text-green-700",
//     badgeClass: "bg-green-50 text-green-800 border border-green-200",
//   },
//   Delivered: {
//     label: "Delivered",
//     textColor: "text-green-700",
//     badgeClass: "bg-green-50 text-green-800 border border-green-200",
//   },
//   Cancelled: {
//     label: "Cancelled",
//     textColor: "text-orange-500",
//     badgeClass: "bg-orange-50 text-orange-600 border border-orange-200",
//   },
//   AddingItems: {
//     label: "Draft",
//     textColor: "text-gray-500",
//     badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
//   },
//   ArrangingPayment: {
//     label: "Pending",
//     textColor: "text-yellow-600",
//     badgeClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
//   },
// };

// const getStateStyle = (state: string) =>
//   STATE_STYLES[state] ?? {
//     label: state,
//     textColor: "text-gray-500",
//     badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
//   };

// /* ─────────────────────────────────────────────────────────────────────────────
//    OrderDetail component
//    — fires GET_ORDER_DETAIL using the order id
//    — uses basicOrder (from list) as immediate fallback for meta bar
// ───────────────────────────────────────────────────────────────────────────── */
// function OrderDetail({
//   orderCode,
//   basicOrder,
//   onBack,
// }: {
//   orderCode: string;
//   basicOrder: Order;
//   onBack: () => void;
// }) {
//   const router = useRouter();
//   const { data, loading } = useQuery<{
//     activeCustomer: {
//       orders: {
//         items: Order[];
//       };
//     } | null;
//   }>(GET_ORDER_DETAIL, {
//     variables: { code: orderCode },
//     fetchPolicy: "cache-and-network",
//   });

//   // Response comes back as activeCustomer.orders.items[0]
//   const fetched = data?.activeCustomer?.orders?.items?.[0];
//   const order: Order = fetched ?? basicOrder;
//   const currency = order.currencyCode ?? "NGN";
//   const { label, badgeClass } = getStateStyle(order.state);
//   const placedAt = order.orderPlacedAt ?? order.createdAt;
//   const lines = order.lines ?? [];
//   const subTotal = order.subTotalWithTax ?? 0;
//   const shipping = order.shippingWithTax ?? 0;
//   const tax = Math.max(0, order.totalWithTax - subTotal - shipping);

//   return (
//     <div className="w-full">
//       {/* Back button */}
//       <button
//         onClick={onBack}
//         aria-label="Back to orders"
//         className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
//       >
//         <ArrowRight className="h-4 w-4 rotate-180" />
//         Back to Orders
//       </button>

//       {/* Order ID heading */}
//       <h2 className="text-xl font-bold text-neutral-900 mb-6">
//         Order ID{" "}
//         <span className="text-neutral-400 font-medium">#{order.code}</span>
//       </h2>

//       {/* 4-column meta bar */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-6 border-b border-neutral-200 bg-white rounded-xl p-5 shadow-sm">
//         <div>
//           <p className="text-xs text-neutral-400 mb-2">Order Status</p>
//           <span
//             className={`inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${badgeClass}`}
//           >
//             {label}
//           </span>
//         </div>
//         <div>
//           <p className="text-xs text-neutral-400 mb-2">Total</p>
//           <span className="inline-block rounded-full px-4 py-1.5 text-sm font-bold bg-neutral-900 text-white">
//             {money(order.totalWithTax, currency)}
//           </span>
//         </div>
//         <div>
//           <p className="text-xs text-neutral-400 mb-2">Date Approved</p>
//           <p className="text-sm font-semibold text-neutral-800">
//             {formatDateTime(placedAt)}
//           </p>
//         </div>
//         <div>
//           <p className="text-xs text-neutral-400 mb-2">Date Delivered</p>
//           <span className="inline-block rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700">
//             {order.state === "Delivered" || order.state === "PartiallyDelivered"
//               ? formatDate(placedAt)
//               : "—"}
//           </span>
//         </div>
//       </div>

//       {/* Loading skeleton for lines */}
//       {loading && lines.length === 0 ? (
//         <div className="space-y-4 animate-pulse mb-8">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="flex gap-4 items-center">
//               <div className="w-16 h-16 rounded-lg bg-neutral-200 shrink-0" />
//               <div className="flex-1 space-y-2">
//                 <div className="h-4 w-48 bg-neutral-200 rounded" />
//                 <div className="h-3 w-24 bg-neutral-100 rounded" />
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         /* Two-column body */
//         <div className="flex flex-col md:flex-row gap-10 items-start">

//           {/* Left — product lines */}
//           <div className="flex-1 space-y-4">
//             {lines.length === 0 ? (
//               <p className="text-sm text-neutral-400">
//                 No items found for this order.
//               </p>
//             ) : (
//               lines.map((line: any) => (
//                 <div
//                   key={line.id}
//                   className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-0"
//                 >
//                   {/* Product image from featuredAsset.preview */}
//                   <div className="w-16 h-16 shrink-0 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center">
//                     {line.featuredAsset?.preview ? (
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={line.featuredAsset.preview}
//                         alt={line.productVariant?.name ?? "Product"}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <Package className="w-5 h-5 text-neutral-300" />
//                     )}
//                   </div>

//                   {/* Product info */}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-neutral-900 truncate">
//                       {line.productVariant?.name ?? "Product"}
//                     </p>
//                     {line.quantity > 1 && (
//                       <p className="text-xs text-neutral-400 mt-0.5">
//                         Qty: {line.quantity}
//                       </p>
//                     )}
//                     <p className="text-sm font-bold text-neutral-800 mt-1">
//                       {money(line.linePriceWithTax, currency)}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Right — summary + customer + delivery + buttons */}
//           <div className="md:w-80 lg:w-96 space-y-6 shrink-0">

//             {/* Order Summary */}
//             <div>
//               <h3 className="text-base font-bold text-neutral-900 mb-3">
//                 Order Summary
//               </h3>
//               <div className="space-y-2.5">
//                 <div className="flex justify-between text-sm text-neutral-500">
//                   <span>Sub total products</span>
//                   <span>{money(subTotal, currency)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-neutral-500">
//                   <span>Delivery fee</span>
//                   <span>{money(shipping, currency)}</span>
//                 </div>
//                 {tax > 0 && (
//                   <div className="flex justify-between text-sm text-neutral-500">
//                     <span>Tax</span>
//                     <span>{money(tax, currency)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
//                   <span>Total</span>
//                   <span>{money(order.totalWithTax, currency)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Customer Details */}
//             {order.shippingAddress?.fullName && (
//               <div>
//                 <h3 className="text-base font-bold text-neutral-900 mb-2">
//                   Customer Details
//                 </h3>
//                 <p className="text-sm font-semibold text-neutral-800">
//                   {order.shippingAddress.fullName}
//                 </p>
//                 {order.shippingAddress.streetLine1 && (
//                   <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
//                     {[
//                       order.shippingAddress.streetLine1,
//                       order.shippingAddress.city,
//                       order.shippingAddress.postalCode,
//                     ]
//                       .filter(Boolean)
//                       .join(", ")}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Delivery Details */}
//             <div>
//               <h3 className="text-base font-bold text-neutral-900 mb-2">
//                 Delivery Details
//               </h3>
//               <p className="text-sm font-semibold text-neutral-800">
//                 Door Delivery{" "}
//                 <span className="text-xs font-normal text-neutral-400">
//                   (from {money(shipping, currency)})
//                 </span>
//               </p>
//               <p className="text-xs text-neutral-500 mt-1">
//                 Placed on{" "}
//                 <span className="font-semibold text-neutral-700">
//                   {formatDate(placedAt)}
//                 </span>
//               </p>
//             </div>

//             {/* Action buttons */}
//             <div className="space-y-3 pt-2">
//               {/* <button className="w-full rounded-full bg-neutral-900 text-white py-3.5 text-sm font-semibold hover:bg-neutral-800 transition-colors">
//                 Buy Again
//               </button> */}
//               <button
//                 onClick={() => router.push(`/receipt?code=${order.code}`)}
//                 className="w-full rounded-full bg-red-600 text-white py-3.5 text-sm font-semibold hover:bg-red-700 transition-colors"
//               >
//                 View Receipt
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────────────────────
//    OrdersPage
// ───────────────────────────────────────────────────────────────────────────── */
// export default function OrdersPage() {
//   const router = useRouter();
//   const { customer, loading: userLoading } = useUser();
//   const [page, setPage] = useState(1);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const pageSize = 10;

//   const { data, loading, error } = useQuery<GetCustomerOrdersResponse>(
//     GET_CUSTOMER_ORDERS,
//     {
//       variables: { options: { take: pageSize, skip: (page - 1) * pageSize } },
//       skip: !customer,
//       fetchPolicy: "cache-and-network",
//     }
//   );

//   // const orders = data?.activeCustomer?.orders?.items ?? [];

//   const orders = [...(data?.activeCustomer?.orders?.items ?? [])].sort(
//   (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
// );

//   const totalItems = data?.activeCustomer?.orders?.totalItems ?? 0;
//   const totalPages = Math.ceil(totalItems / pageSize);

//   /* Not logged in */
//   if (!userLoading && !customer) {
//     return (
//       <main className="min-h-screen bg-[#f5f5f5]">
//         <Navbar />
//         <div className="mx-auto max-w-lg px-4 py-20 text-center">
//           <ShoppingBag className="mx-auto h-14 w-14 text-neutral-300 mb-4" />
//           <h1 className="text-xl font-semibold text-neutral-800">
//             Sign in to view your orders
//           </h1>
//           <p className="mt-2 text-sm text-neutral-500">
//             You need to be logged in to see your order history.
//           </p>
//           <Link
//             href="/"
//             className="mt-6 inline-block rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
//           >
//             Go to Home
//           </Link>
//         </div>
//         <Suscribe />
//         <Footer />
//       </main>
//     );
//   }

//   /* Loading skeleton */
//   if (loading || userLoading) {
//     return (
//       <main className="min-h-screen bg-[#f5f5f5]">
//         <Navbar />
//         <div className="mx-auto max-w-3xl px-4 py-10">
//           <div className="h-7 w-40 bg-neutral-200 rounded animate-pulse mb-6" />
//           <div className="space-y-3">
//             {[1, 2, 3, 4].map((i) => (
//               <div
//                 key={i}
//                 className="rounded-xl bg-white border border-neutral-200 p-5 animate-pulse"
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="flex gap-3 items-center">
//                     <div className="w-10 h-10 rounded-full bg-neutral-200" />
//                     <div className="space-y-2">
//                       <div className="h-4 w-32 bg-neutral-200 rounded" />
//                       <div className="h-3 w-20 bg-neutral-100 rounded" />
//                     </div>
//                   </div>
//                   <div className="h-4 w-24 bg-neutral-200 rounded" />
//                 </div>
//                 <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between">
//                   <div className="h-3 w-16 bg-neutral-100 rounded" />
//                   <div className="h-4 w-24 bg-neutral-200 rounded" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <Suscribe />
//         <Footer />
//       </main>
//     );
//   }

//   /* Error */
//   if (error && !data) {
//     return (
//       <main className="min-h-screen bg-neutral-50">
//         <Navbar />
//         <div className="mx-auto max-w-3xl px-4 py-10 text-center">
//           <p className="text-red-500 text-sm">
//             Failed to load orders. Please try again later.
//           </p>
//         </div>
//         <Suscribe />
//         <Footer />
//       </main>
//     );
//   }

//   /* Empty state */
//   if (orders.length === 0) {
//     return (
//       <main className="min-h-screen bg-[#f5f5f5]">
//         <Navbar />
//         <div className="mx-auto max-w-3xl px-4 py-10">
//           <h1 className="text-xl font-semibold text-neutral-900 mb-8">
//             My Orders
//           </h1>
//           <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-16 text-center">
//             <Package className="h-14 w-14 text-neutral-300 mb-4" />
//             <p className="font-semibold text-neutral-700">No orders yet</p>
//             <p className="mt-1 text-sm text-neutral-400">
//               When you place an order, it will appear here.
//             </p>
//             <Link
//               href="/products"
//               className="mt-6 rounded-full bg-red-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
//             >
//               Start Shopping
//             </Link>
//           </div>
//         </div>
//         <Suscribe />
//         <Footer />
//       </main>
//     );
//   }

//   /* Detail view — shown when an order is selected */
//   if (selectedId) {
//     const selectedOrder = orders.find((o) => o.id === selectedId);
//     if (selectedOrder) {
//       return (
//         <main className="min-h-screen bg-[#f5f5f5]">
//           <Navbar />
//           <div className="mx-auto max-w-[92%]  py-10">
//             <OrderDetail
//               orderCode={selectedOrder.code}
//               basicOrder={selectedOrder}
//               onBack={() => setSelectedId(null)}
//             />
//           </div>
//           <Suscribe />
//           <Footer />
//         </main>
//       );
//     }
//   }

//   /* Orders list */
//   return (
//     <main className="min-h-screen bg-[#f5f5f5]">
//       <Navbar />
//       <div className="mx-auto max-w-[92%]  py-10">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-xl font-semibold text-neutral-900">My Orders </h1>
//           <span className="text-sm text-neutral-400">
//             {totalItems} order{totalItems !== 1 ? "s" : ""}
//           </span>
//         </div>

//         {/* List */}
//         <ul className="space-y-3">
//           {orders.map((order) => {
//             const { label, textColor } = getStateStyle(order.state);
//             const placedAt = order.orderPlacedAt ?? order.createdAt;

//             return (
//               <li
//                 key={order.id}
//                 className="rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-sm transition-shadow"
//               >
//                 <div className="px-5 py-4">
//                   {/* Top row */}
//                   <div className="flex items-center justify-between gap-4">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
//                         <Package className="h-5 w-5 text-neutral-500" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-neutral-900">
//                           Order #{order.code}
//                         </p>
//                         <p className="text-xs text-neutral-400 mt-0.5">
//                           {formatDate(placedAt)}
//                         </p>
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => setSelectedId(order.id)}
//                       aria-label="View order details"
//                       className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors shrink-0"
//                     >
//                       View Details
//                       <ArrowRight className="h-4 w-4" />
//                     </button>
//                   </div>

//                   {/* Bottom row */}
//                   <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
//                     <span className={`text-xs font-semibold ${textColor}`}>
//                       {label}
//                     </span>
//                     <span className="text-sm font-bold text-neutral-900">
//                       {money(order.totalWithTax, order.currencyCode ?? "NGN")}
//                     </span>
//                   </div>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="mt-8 flex items-center justify-center gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//             >
//               Previous
//             </button>
//             <span className="text-sm text-neutral-500">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//       <Suscribe />
//       <Footer />
//     </main>
//   );
// }


"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { GET_CUSTOMER_ORDERS } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ShoppingBag, ArrowRight, Calendar } from "lucide-react";
import Suscribe from "@/Components/Suscribe/Suscribe";

/* ─────────────────────────────────────────────────────────────────────────────
   Separate detail query — does NOT touch the existing GET_CUSTOMER_ORDERS
───────────────────────────────────────────────────────────────────────────── */
const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($code: String!) {
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
            taxRate
            featuredAsset {
              preview
            }
            productVariant {
              id
              name
              sku
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

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */
type OrderLine = {
  id: string;
  productVariant: { name: string; sku: string };
  quantity: number;
  taxRate: number;
  linePriceWithTax: number;
  featuredAsset?: { preview: string } | null;
};

type Order = {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  currencyCode?: string;
  orderPlacedAt?: string;
  createdAt?: string;
  lines?: OrderLine[];
  subTotalWithTax?: number;
  shippingWithTax?: number;
  shippingAddress?: {
    fullName?: string;
    streetLine1?: string;
    city?: string;
    postalCode?: string;
  };
};

type GetCustomerOrdersResponse = {
  activeCustomer: {
    orders: {
      totalItems: number;
      items: Order[];
    };
  } | null;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const money = (amountInCents: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, (amountInCents || 0) / 100));

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
};

/* ─────────────────────────────────────────────────────────────────────────────
   State badge styles
───────────────────────────────────────────────────────────────────────────── */
const STATE_STYLES: Record<
  string,
  { label: string; textColor: string; badgeClass: string }
> = {
  PaymentSettled: {
    label: "Paid",
    textColor: "text-green-600",
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
  },
  PaymentAuthorized: {
    label: "Paid",
    textColor: "text-green-600",
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
  },
  PartiallyShipped: {
    label: "Shipped out",
    textColor: "text-indigo-600",
    badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  Shipped: {
    label: "Shipped out",
    textColor: "text-indigo-600",
    badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  PartiallyDelivered: {
    label: "Delivered",
    textColor: "text-green-700",
    badgeClass: "bg-green-50 text-green-800 border border-green-200",
  },
  Delivered: {
    label: "Delivered",
    textColor: "text-green-700",
    badgeClass: "bg-green-50 text-green-800 border border-green-200",
  },
  Cancelled: {
    label: "Cancelled",
    textColor: "text-orange-500",
    badgeClass: "bg-orange-50 text-orange-600 border border-orange-200",
  },
  AddingItems: {
    label: "Draft",
    textColor: "text-gray-500",
    badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  ArrangingPayment: {
    label: "Pending",
    textColor: "text-yellow-600",
    badgeClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
};

const getStateStyle = (state: string) =>
  STATE_STYLES[state] ?? {
    label: state,
    textColor: "text-gray-500",
    badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
  };

/* ─────────────────────────────────────────────────────────────────────────────
   OrderDetail component
───────────────────────────────────────────────────────────────────────────── */
function OrderDetail({
  orderCode,
  basicOrder,
  onBack,
}: {
  orderCode: string;
  basicOrder: Order;
  onBack: () => void;
}) {
  const router = useRouter();
  const { data, loading } = useQuery<{
    activeCustomer: {
      orders: {
        items: Order[];
      };
    } | null;
  }>(GET_ORDER_DETAIL, {
    variables: { code: orderCode },
    fetchPolicy: "cache-and-network",
  });

  const fetched = data?.activeCustomer?.orders?.items?.[0];
  const order: Order = fetched ?? basicOrder;
  const currency = order.currencyCode ?? "NGN";
  const { label, badgeClass } = getStateStyle(order.state);
  const placedAt = order.orderPlacedAt ?? order.createdAt;
  const lines = order.lines ?? [];
  const subTotal = order.subTotalWithTax ?? 0;
  const shipping = order.shippingWithTax ?? 0;
  const tax = Math.max(0, order.totalWithTax - subTotal - shipping);

  return (
    <div className="w-full">
      {/* Back button */}
      <button
        onClick={onBack}
        aria-label="Back to orders"
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        Back to Orders
      </button>

      {/* Order ID heading */}
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Order ID{" "}
        <span className="text-neutral-400 font-medium">#{order.code}</span>
      </h2>

      {/* 4-column meta bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-6 border-b border-neutral-200 bg-white rounded-xl p-5 shadow-sm">
        <div>
          <p className="text-xs text-neutral-400 mb-2">Order Status</p>
          <span
            className={`inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${badgeClass}`}
          >
            {label}
          </span>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-2">Total</p>
          <span className="inline-block rounded-full px-4 py-1.5 text-sm font-bold bg-neutral-900 text-white">
            {money(order.totalWithTax, currency)}
          </span>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-2">Date Approved</p>
          <p className="text-sm font-semibold text-neutral-800">
            {formatDateTime(placedAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-2">Date Delivered</p>
          <span className="inline-block rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700">
            {order.state === "Delivered" || order.state === "PartiallyDelivered"
              ? formatDate(placedAt)
              : "—"}
          </span>
        </div>
      </div>

      {/* Loading skeleton for lines */}
      {loading && lines.length === 0 ? (
        <div className="space-y-4 animate-pulse mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-neutral-200 rounded" />
                <div className="h-3 w-24 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Two-column body */
        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* Left — product lines */}
          <div className="flex-1 space-y-4">
            {lines.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No items found for this order.
              </p>
            ) : (
              lines.map((line: any) => (
                <div
                  key={line.id}
                  className="flex items-center gap-4 pb-4 border-b border-neutral-100 last:border-0"
                >
                  {/* Product image from featuredAsset.preview */}
                  <div className="w-16 h-16 shrink-0 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center">
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

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {line.productVariant?.name ?? "Product"}
                    </p>
                    {line.quantity > 1 && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Qty: {line.quantity}
                      </p>
                    )}
                    <p className="text-sm font-bold text-neutral-800 mt-1">
                      {money(line.linePriceWithTax, currency)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right — summary + customer + delivery + buttons */}
          <div className="md:w-80 lg:w-96 space-y-6 shrink-0">

            {/* Order Summary */}
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-3">
                Order Summary
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Sub total products</span>
                  <span>{money(subTotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Delivery fee</span>
                  <span>{money(shipping, currency)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Tax</span>
                    <span>{money(tax, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{money(order.totalWithTax, currency)}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            {order.shippingAddress?.fullName && (
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  Customer Details
                </h3>
                <p className="text-sm font-semibold text-neutral-800">
                  {order.shippingAddress.fullName}
                </p>
                {order.shippingAddress.streetLine1 && (
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {[
                      order.shippingAddress.streetLine1,
                      order.shippingAddress.city,
                      order.shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Delivery Details */}
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Delivery Details
              </h3>
              <p className="text-sm font-semibold text-neutral-800">
                Door Delivery{" "}
                <span className="text-xs font-normal text-neutral-400">
                  (from {money(shipping, currency)})
                </span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Placed on{" "}
                <span className="font-semibold text-neutral-700">
                  {formatDate(placedAt)}
                </span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => router.push(`/receipt?code=${order.code}`)}
                className="w-full rounded-full bg-red-600 text-white py-3.5 text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                View Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   OrdersPage
───────────────────────────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const router = useRouter();
  const { customer, loading: userLoading } = useUser();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string>(""); // "" = all, else "YYYY-M"
  const pageSize = 10;

  const { data, loading, error } = useQuery<GetCustomerOrdersResponse>(
    GET_CUSTOMER_ORDERS,
    {
      variables: { options: { take: pageSize, skip: (page - 1) * pageSize } },
      skip: !customer,
      fetchPolicy: "cache-and-network",
    }
  );

  const orders = [...(data?.activeCustomer?.orders?.items ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const totalItems = data?.activeCustomer?.orders?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Build the list of months that actually have orders, newest first
  const monthOptions = useMemo(() => {
    const seen = new Map<
      string,
      { value: string; label: string; sort: number }
    >();
    orders.forEach((o) => {
      const iso = o.orderPlacedAt ?? o.createdAt;
      if (!iso) return;
      const d = new Date(iso);
      const value = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(value)) {
        seen.set(value, {
          value,
          label: d.toLocaleDateString("en-NG", {
            month: "short",
            year: "numeric",
          }),
          sort: d.getFullYear() * 12 + d.getMonth(),
        });
      }
    });
    return Array.from(seen.values()).sort((a, b) => b.sort - a.sort);
  }, [orders]);

  // Apply the month filter
  const filteredOrders = useMemo(() => {
    if (!monthFilter) return orders;
    return orders.filter((o) => {
      const iso = o.orderPlacedAt ?? o.createdAt;
      if (!iso) return false;
      const d = new Date(iso);
      return `${d.getFullYear()}-${d.getMonth()}` === monthFilter;
    });
  }, [orders, monthFilter]);

  /* Not logged in */
  if (!userLoading && !customer) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-14 w-14 text-neutral-300 mb-4" />
          <h1 className="text-xl font-semibold text-neutral-800">
            Sign in to view your orders
          </h1>
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

  /* Loading skeleton */
  if (loading || userLoading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-7 w-40 bg-neutral-200 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-neutral-200 p-5 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-neutral-200 rounded" />
                      <div className="h-3 w-20 bg-neutral-100 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-24 bg-neutral-200 rounded" />
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between">
                  <div className="h-3 w-16 bg-neutral-100 rounded" />
                  <div className="h-4 w-24 bg-neutral-200 rounded" />
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

  /* Error */
  if (error && !data) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-red-500 text-sm">
            Failed to load orders. Please try again later.
          </p>
        </div>
        <Suscribe />
        <Footer />
      </main>
    );
  }

  /* Empty state */
  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-xl font-semibold text-neutral-900 mb-8">
            My Orders
          </h1>
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

  /* Detail view — shown when an order is selected */
  if (selectedId) {
    const selectedOrder = orders.find((o) => o.id === selectedId);
    if (selectedOrder) {
      return (
        <main className="min-h-screen bg-[#f5f5f5]">
          <Navbar />
          <div className="mx-auto max-w-[92%]  py-10">
            <OrderDetail
              orderCode={selectedOrder.code}
              basicOrder={selectedOrder}
              onBack={() => setSelectedId(null)}
            />
          </div>
          <Suscribe />
          <Footer />
        </main>
      );
    }
  }

  /* Orders list */
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="mx-auto max-w-[92%]  py-10">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-semibold text-neutral-900">My Orders</h1>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-neutral-400">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
            </span>

            {/* Month / Year filter */}
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                aria-label="Filter orders by month"
                className="appearance-none rounded-lg border border-neutral-200 bg-white pl-9 pr-8 py-2 text-sm font-medium text-neutral-800 focus:outline-none focus:border-red-400 cursor-pointer"
              >
                <option value="">All dates</option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {/* chevron */}
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 4.5L6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* List */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-16 text-center">
            <Package className="h-12 w-12 text-neutral-300 mb-4" />
            <p className="font-semibold text-neutral-700">No orders for this month</p>
            <p className="mt-1 text-sm text-neutral-400">
              Try a different month or clear the filter.
            </p>
            <button
              onClick={() => setMonthFilter("")}
              className="mt-6 rounded-full border border-neutral-200 px-6 py-2 text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              Show all dates
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredOrders.map((order) => {
              const { label, textColor } = getStateStyle(order.state);
              const placedAt = order.orderPlacedAt ?? order.createdAt;

              return (
                <li
                  key={order.id}
                  className="rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="px-5 py-4">
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                          <Package className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            Order #{order.code}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {formatDate(placedAt)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedId(order.id)}
                        aria-label="View order details"
                        className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors shrink-0"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className={`text-xs font-semibold ${textColor}`}>
                        {label}
                      </span>
                      <span className="text-sm font-bold text-neutral-900">
                        {money(order.totalWithTax, order.currencyCode ?? "NGN")}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

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
