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
    <div className="w-full max-w-2xl mx-auto py-6 bg-[#ffffff] px-4 border-[#e3e3e3] border-l mt-6">

      {/* TOP BUTTONS */}
      <div className="flex flex-col gap-3">
        <Link href="/checkout" className="w-full bg-red-600 text-white py-3 text-center rounded-full font-semibold text-sm">
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
        <h2 className="text-md font-semibold">
          Cart Items <span className="text-red-600">({lines.length})</span>
        </h2>
        <button className="text-xl">✕</button>
      </div>

      {/* CART LIST */}
      <div className="mt-4 space-y-5">
        {lines.map((item: any) => (
          <div
            key={item.id}
            className="w-full flex items-start gap-4 border-b-[#f3f5f7] pb-4"
          >
            {/* IMAGE */}
            <div className="h-full bg-[#f3f5f7] rounded-lg overflow-hidden">
              <Image
                src={
                  isLoggedIn
                    ? item?.featuredAsset?.preview ??
                    item?.productVariant?.product?.featuredAsset?.preview
                    : item.image
                }
                alt={item.name}
                width={70}
                height={70}
                className="h-full w-full object-cover"
              />
            </div>

            {/* DETAILS */}
            <div className="w-full">
              <p className=" text-xs font-semibold">{item.name}</p>
              <p className="text-neutral-500 text-xs mt-2">
                {item.category ?? "Battery"}
              </p>

              {/* PRICE */}
              {/* <p className="mt-1 font-semibold text-sm">
                {money(isLoggedIn ? item.unitPriceWithTax : item.priceWithTax)}
              </p> */}

              {/* QUANTITY */}
              <div className="w-full flex justify-between items-center mt-2">
                <div className="flex items-center rounded-full overflow-hidden">
                  <button
                    className="h-6 w-6 text-xs flex items-center border border-[#dbdcdd] rounded-full justify-center"
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
                    className="h-6 w-6 text-xs flex items-center justify-center border border-[#dbdcdd] rounded-full"
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
                  className="text-red-600 flex items-center gap-1 text-xs"
                  onClick={() =>
                    isLoggedIn
                      ? handleAdjustQuantity(item.id, 0)
                      : removeItem(item.id)
                  }
                >
                  Remove <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* TOTAL ON RIGHT */}
            <div className="text-right">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="font-semibold text-xs">
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
