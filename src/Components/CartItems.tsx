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

export default function CartItems() {
  const { cart, handleAdjustQuantity } = useCart();
  const { items: localItems, updateQuantity, removeItem } = useLocalCart();
  const user = useUser() as any;
  const isLoggedIn = !!(user?.me || user?.user || user?.activeCustomer);

  const lines = isLoggedIn ? cart?.activeOrder?.lines ?? [] : localItems;

  return (
    <div className="w-full max-w-2xl mx-auto py-6 bg-[#ffffff] px-4 border-[#888888] border-l mt-6">

      {/* TOP BUTTONS */}
      <div className="flex flex-col gap-3">
        <button className="w-full bg-red-600 text-white py-3 rounded-full font-semibold text-sm">
          Checkout now
        </button>

        <Link
          href="/cart"
          className="w-full border border-neutral-300 text-neutral-700 bg-white py-3 rounded-full font-semibold text-sm text-center"
        >
          Go to cart
        </Link>
      </div>

      {/* TITLE */}
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-xl font-semibold">
          Cart Items <span className="text-red-600">({lines.length})</span>
        </h2>
        <button className="text-xl">✕</button>
      </div>

      {/* CART LIST */}
      <div className="mt-4 space-y-5">
        {lines.map((item: any) => (
          <div
            key={item.id}
            className="flex items-start gap-4 border-b pb-4"
          >
            {/* IMAGE */}
            <div className="h-20 w-20 rounded-lg overflow-hidden">
              <Image
                src={
                  isLoggedIn
                    ? item?.featuredAsset?.preview ??
                      item?.productVariant?.product?.featuredAsset?.preview
                    : item.image
                }
                alt={item.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>

            {/* DETAILS */}
            <div className="flex-1">
              <p className="font-semibold text-[15px]">{item.name}</p>
              <p className="text-neutral-500 text-xs">
                {item.category ?? "Battery"}
              </p>

              {/* PRICE */}
              <p className="mt-1 font-semibold">
                {money(isLoggedIn ? item.unitPriceWithTax : item.priceWithTax)}
              </p>

              {/* QUANTITY */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button
                    className="h-7 w-7 flex items-center justify-center"
                    onClick={() =>
                      isLoggedIn
                        ? handleAdjustQuantity(item.id, item.quantity - 1)
                        : updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    className="h-7 w-7 flex items-center justify-center"
                    onClick={() =>
                      isLoggedIn
                        ? handleAdjustQuantity(item.id, item.quantity + 1)
                        : updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                {/* REMOVE */}
                <button
                  className="text-red-600 flex items-center gap-1 text-sm"
                  onClick={() =>
                    isLoggedIn
                      ? handleAdjustQuantity(item.id, 0)
                      : removeItem(item.id)
                  }
                >
                  Remove <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* TOTAL ON RIGHT */}
            <div className="text-right">
              <p className="text-sm text-neutral-500">Total</p>
              <p className="font-semibold">
                {money(
                  (isLoggedIn
                    ? item.unitPriceWithTax
                    : item.priceWithTax) * item.quantity
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
