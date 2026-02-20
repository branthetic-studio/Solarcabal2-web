"use client";

import React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";

const money = (amount: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount || 0));

interface CartItemsProps {
  onClose?: () => void;
}

export default function CartItems({ onClose }: CartItemsProps) {
  const { cart, handleAdjustQuantity, removeFromCartMutation } = useCart();
  const { items: localItems, updateQuantity, removeItem } = useLocalCart();
  const user = useUser() as any;
  const isLoggedIn = !!(user?.me || user?.user || user?.activeCustomer);

  const order = cart?.activeOrder;
  const serverCurrency = order?.currencyCode ?? "NGN";

  // Mirror CartPage: logged-in → server lines, guest → local items
  const lines = isLoggedIn ? order?.lines ?? [] : localItems;

  return (
    <div className="w-full min-w-2xs mx-auto py-6 bg-[#ffffff] px-4 border-[#e3e3e3] border-l mt-6">

      {/* TOP BUTTONS */}
      <div className="flex flex-col gap-3">
        <Link
          href="/checkout"
          className="w-full bg-red-600 text-white py-3 text-center rounded-full font-semibold text-sm"
        >
          Checkout now
        </Link>

        <Link
          href="/cart"
          className="w-full border border-neutral-300 text-neutral-700 bg-white py-3 rounded-full font-semibold text-sm text-center"
        >
          Go to cart
        </Link>
      </div>

      {/* TITLE */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-sm font-semibold">
          Cart Items <span className="text-red-600">({lines.length})</span>
        </h2>
        {onClose && (
          <button className="text-xs" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        )}
      </div>

      {/* CART LIST */}
      <div className="mt-4 space-y-5">
        {lines.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-6">
            Your cart is empty.
          </p>
        )}

        {isLoggedIn
          ? (lines as any[]).map((line: any) => {
              // Mirror CartPage's asset resolution
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
              const lineTotal = line?.linePriceWithTax ?? unitPrice * (line?.quantity ?? 1);

              return (
                <div
                  key={line.id}
                  className="w-full flex items-start gap-4 border-b border-[#f3f5f7] pb-4"
                >
                  {/* IMAGE */}
                  <div className="h-[70px] w-[70px] shrink-0 bg-[#f3f5f7] rounded-lg overflow-hidden">
                    {asset ? (
                      <Image
                        src={asset}
                        alt={name}
                        width={70}
                        height={70}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        No Image
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="w-full min-w-0">
                    <p className="text-xs font-semibold truncate">{name}</p>
                    <p className="text-neutral-500 text-xs mt-1">{brand}</p>

                    {/* QUANTITY */}
                    <div className="w-full flex justify-between items-center mt-2">
                      <div className="flex items-center rounded-full overflow-hidden">
                        <button
                          className="h-6 w-6 text-xs flex items-center border border-[#dbdcdd] rounded-full justify-center"
                          onClick={() =>
                            handleAdjustQuantity(
                              line.id,
                              Math.max(0, (line.quantity ?? 1) - 1)
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          className="h-6 w-6 text-xs flex items-center justify-center border border-[#dbdcdd] rounded-full"
                          onClick={() =>
                            handleAdjustQuantity(line.id, (line.quantity ?? 1) + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* REMOVE */}
                      <button
                        className="text-red-600 flex items-center gap-1 text-xs"
                        onClick={() => removeFromCartMutation(line.id)}
                      >
                        Remove <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* TOTAL ON RIGHT */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-neutral-500">Total</p>
                    <p className="font-semibold text-xs">
                      {money(lineTotal, serverCurrency)}
                    </p>
                  </div>
                </div>
              );
            })
          : localItems.map((item) => {
              const localCurrency = item.currencyCode ?? "NGN";
              return (
                <div
                  key={item.id}
                  className="w-full flex items-start gap-4 border-b border-[#f3f5f7] pb-4"
                >
                  {/* IMAGE */}
                  <div className="h-[70px] w-[70px] shrink-0 bg-[#f3f5f7] rounded-lg overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={70}
                        height={70}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        No Image
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="w-full min-w-0">
                    <p className="text-xs font-semibold truncate">{item.name}</p>
                    <p className="text-neutral-500 text-xs mt-1">
                      {item.brand ?? "—"}
                    </p>

                    {/* QUANTITY */}
                    <div className="w-full flex justify-between items-center mt-2">
                      <div className="flex items-center rounded-full overflow-hidden">
                        <button
                          className="h-6 w-6 text-xs flex items-center border border-[#dbdcdd] rounded-full justify-center"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(0, (item.quantity ?? 1) - 1)
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          className="h-6 w-6 text-xs flex items-center justify-center border border-[#dbdcdd] rounded-full"
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity ?? 1) + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* REMOVE */}
                      <button
                        className="text-red-600 flex items-center gap-1 text-xs"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* TOTAL ON RIGHT */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-neutral-500">Total</p>
                    <p className="font-semibold text-xs">
                      {money(
                        (item.priceWithTax ?? 0) * (item.quantity ?? 1),
                        localCurrency
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}