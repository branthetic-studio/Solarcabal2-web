"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";
import {
  GET_COLLECTION_PRODUCTS,
  GET_PRODUCT_DETAILS,
} from "@/graphql/queries";

type Props = {
  categorySlug: string;
  brand: string[] | null;
  sort: string;
  condition: string;
  priceRange: [number, number];
};

export default function ProductGrid({
  categorySlug,
  brand,
  sort,
  condition,
  priceRange,
}: Props) {
  const { me } = useUser();
  const { addToCartMutation, handleAdjustQuantity, removeFromCartMutation } = useCart();
  const { addItem: addLocalItem, removeItem: removeLocalItem } = useLocalCart();

  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const autoAddedRef = useRef<Record<string, boolean>>({});

  const [loadDetails] = useLazyQuery(GET_PRODUCT_DETAILS, {
    fetchPolicy: "cache-first",
  });

  const { data, loading, error } = useQuery(GET_COLLECTION_PRODUCTS, {
    variables: {
      collectionSlug: categorySlug,
      groupByProduct: true,
      skip: 0,
      take: 20,
      filter: {
        price: { between: { start: priceRange[0], end: priceRange[1] } },
      },
    },
  });

  // Prepare product card items
  const items = useMemo(() => {
    return (
      data?.search.items.map((it: any) => ({
        id: it.slug,
        name: it.productName,
        slug: it.slug,
        image: it.productAsset?.preview ?? undefined,
        brand: it.brand ?? null,
        priceRaw:
          it.priceWithTax.__typename === "SinglePrice"
            ? it.priceWithTax.value
            : it.priceWithTax.min,
        currencyCode: it.currencyCode,
      })) ?? []
    );
  }, [data]);

  // -----------------------------
  // ADD TO CART INITIAL
  // -----------------------------
  const handleAddToCart = async (itemId: string) => {
    setQuantityMap((prev) => ({ ...prev, [itemId]: 1 }));
  };

  // -----------------------------
  // CHANGE QUANTITY
  // -----------------------------
  const adjustQuantity = (itemId: string, change: number) => {
    setQuantityMap((prev) => {
      const newQty = (prev[itemId] || 1) + change;
      if (newQty <= 0) {
        return { ...prev, [itemId]: undefined };
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  // -----------------------------
  // AUTO SYNC CART WHEN QUANTITY CHANGES
  // -----------------------------
  useEffect(() => {
    items.forEach(async (item) => {
      const qty = quantityMap[item.id];

      if (qty === undefined) {
        // Remove when returning to Add to Cart
        removeLocalItem(item.id);
        if (me) removeFromCartMutation({ variables: { productVariantId: item.id } });
        return;
      }

      // Fetch product variant details
      const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
      const variant = pd?.product?.variants?.[0];
      if (!variant) return;

      const image =
        item.image ??
        pd?.product?.featuredAsset?.preview ??
        pd?.product?.assets?.[0]?.preview ??
        undefined;

      // First-time add
      if (!autoAddedRef.current[item.id]) {
        autoAddedRef.current[item.id] = true;

        addLocalItem({
          id: variant.id,
          name: item.name,
          slug: item.slug,
          priceWithTax: variant.priceWithTax,
          currencyCode: variant.currencyCode,
          brand: item.brand ?? undefined,
          image: image ?? undefined,
          quantity: qty,
        });

        if (me) {
          addToCartMutation({
            variables: { productVariantId: variant.id, quantity: qty },
          });
        }

        toast.success("Added to Cart");
        return;
      }

      // Update existing quantity
      addLocalItem({
        id: variant.id,
        name: item.name,
        slug: item.slug,
        priceWithTax: variant.priceWithTax,
        currencyCode: variant.currencyCode,
        brand: item.brand ?? undefined,
        image: image ?? undefined,
        quantity: qty,
      });

      if (me) handleAdjustQuantity(variant.id, qty);
    });
  }, [quantityMap, items]);

  if (loading) return <div>Loading products…</div>;
  if (error) return <div>Failed to load products.</div>;

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const qty = quantityMap[item.id];

        return (
          <div
            key={item.id}
            className="w-full rounded-xl p-2 shadow-sm bg-white"
          >
            <div className="bg-[#F3F5F7] p-3 pb-1 rounded-t-md">
              <Link href={`/products/${item.slug}`}>
                <img
                  src={item.image || "/placeholder.png"}
                  className="w-full h-40 object-contain rounded-md"
                  alt={item.name}
                />
              </Link>

              {/* BUTTON OR COUNTER */}
              {qty === undefined ? (
                <button
                  className="w-full bg-black text-white py-2 rounded-md mt-3"
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md -px-6 py-2">
                  <button
                    className="text-lg font-bold bg-black rounded-md text-white px-2"
                    onClick={() => adjustQuantity(item.id, -1)}
                  >
                    –
                  </button>

                  <span className="font-semibold">{qty}</span>

                  <button
                    className="text-lg font-bold bg-black rounded-md text-white px-2"
                    onClick={() => adjustQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <p className="text-sm text-gray-500 mt-2">{item.brand}</p>
            <p className="font-semibold text-sm">{item.name}</p>
            <p className="text-md font-bold mt-4">
              {item.currencyCode} {item.priceRaw.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
