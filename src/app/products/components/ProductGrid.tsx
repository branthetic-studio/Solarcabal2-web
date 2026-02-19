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

type GetProductDetailsResponse = {
  product: {
    id: string;
    name: string;
    variants: {
      id: string;
      name: string;
      priceWithTax: number;
      currencyCode: string;
      featuredAsset?: { preview?: string | null } | null;
    }[];
    featuredAsset?: { preview?: string | null } | null;
    assets?: { preview?: string | null }[] | null;
  };
};

interface GetCollectionProductsResponse {
  search: {
    totalItems: number;
    items: Array<{
      productName: string;
      slug: string;
      productVariantId: string;
      productVariantName: string;
      productAsset?: { preview: string };
      priceWithTax: {
        __typename: string;
        value?: number;
        min?: number;
        max?: number;
      };
      currencyCode: string;
    }>;
  };
}

export default function ProductGrid({
  categorySlug,
  brand,
  sort,
  condition,
  priceRange,
}: Props) {
  const { customer } = useUser();
  const {
    addToCartMutation,
    handleAdjustQuantity,
    removeFromCartMutation,
    getOrderLineIdByVariantId,
  } = useCart();

  const {
    addItem: addLocalItem,
    removeItem: removeLocalItem,
    updateQuantity: updateLocalQuantity,
  } = useLocalCart();

  const [quantityMap, setQuantityMap] = useState<
    Record<string, number | undefined>
  >({});

  const [variantIdMap, setVariantIdMap] = useState<Record<string, string>>({});
  const autoAddedRef = useRef<Record<string, boolean>>({});
  const processingRef = useRef<Record<string, boolean>>({}); // prevents double async runs

  const [loadDetails] = useLazyQuery<GetProductDetailsResponse>(
    GET_PRODUCT_DETAILS,
    { fetchPolicy: "cache-first" }
  );

  const { data, loading, error } = useQuery<GetCollectionProductsResponse>(
    GET_COLLECTION_PRODUCTS,
    {
      variables: {
        collectionSlug: categorySlug,
        groupByProduct: true,
        skip: 0,
        take: 20,
        filter: {
          price: { between: { start: priceRange[0], end: priceRange[1] } },
        },
      },
    }
  );

  const items = useMemo(() => {
    return (
      data?.search.items.map((it: any) => ({
        id: it.slug, // UI id (keep same as your UI)
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

  const handleAddToCart = async (itemId: string) => {
    setQuantityMap((prev) => ({ ...prev, [itemId]: 1 }));
  };

  // 🔥 FIX: start from 0 instead of 1 (prevents jumping to 2)
  const adjustQuantity = (itemId: string, change: number) => {
    setQuantityMap((prev) => {
      const current = prev[itemId] ?? 0;
      const newQty = current + change;

      if (newQty <= 0) {
        return { ...prev, [itemId]: undefined };
      }

      return { ...prev, [itemId]: newQty };
    });
  };

  // ✅ Fixed sync logic (no UI changes, just correct behavior)
  useEffect(() => {
    if (!items.length) return;

    const syncItem = async (item: (typeof items)[number]) => {
      const qty = quantityMap[item.id];

      // Prevent concurrent duplicate runs per item
      if (processingRef.current[item.id]) return;
      processingRef.current[item.id] = true;

      try {
        // 🔥 REMOVE FLOW
        if (qty === undefined) {
          const variantId = variantIdMap[item.id];

          // remove from local using VARIANT ID (not slug)
          if (variantId) {
            removeLocalItem(variantId);

            if (customer) {
              const orderLineId =
                getOrderLineIdByVariantId(variantId);
              if (orderLineId) {
                await removeFromCartMutation(orderLineId);
              }
            }
          }

          // cleanup maps
          setVariantIdMap((prev) => {
            const copy = { ...prev };
            delete copy[item.id];
            return copy;
          });

          autoAddedRef.current[item.id] = false;
          return;
        }

        // 🔥 Load variant once
        let variantId = variantIdMap[item.id];

        if (!variantId) {
          const { data: pd } = await loadDetails({
            variables: { slug: item.slug },
          });

          const variant = pd?.product?.variants?.[0];
          if (!variant) return;

          variantId = variant.id;

          setVariantIdMap((prev) => ({
            ...prev,
            [item.id]: variant.id,
          }));
        }

        // 🔥 Get image fallback
        const { data: pd } = await loadDetails({
          variables: { slug: item.slug },
        });

        const variant = pd?.product?.variants?.[0];
        if (!variant) return;

        const image =
          item.image ??
          pd?.product?.featuredAsset?.preview ??
          pd?.product?.assets?.[0]?.preview ??
          undefined;

        // 🔥 FIRST ADD
        if (!autoAddedRef.current[item.id]) {
          autoAddedRef.current[item.id] = true;

          addLocalItem({
            id: variantId,
            name: item.name,
            slug: item.slug,
            priceWithTax: variant.priceWithTax,
            currencyCode: variant.currencyCode,
            brand: item.brand ?? undefined,
            image,
            quantity: qty,
          });

          if (customer) {
            await addToCartMutation({
              productVariantId: variantId,
              quantity: qty,
            });
          }

          toast.success("Added to Cart");
          return;
        }

        // 🔥 UPDATE (no duplicate add)
        updateLocalQuantity(variantId, qty);

        if (customer) {
          const orderLineId =
            getOrderLineIdByVariantId(variantId);
          if (orderLineId) {
            await handleAdjustQuantity(orderLineId, qty);
          }
        }
      } catch (e) {
        console.error("Cart sync error:", e);
      } finally {
        processingRef.current[item.id] = false;
      }
    };

    items.forEach((item) => {
      void syncItem(item);
    });
  }, [
    quantityMap,
    items,
    customer,
    loadDetails,
    addToCartMutation,
    handleAdjustQuantity,
    removeFromCartMutation,
    getOrderLineIdByVariantId,
    removeLocalItem,
    addLocalItem,
    updateLocalQuantity,
    variantIdMap,
  ]);

  if (loading) return <div>Loading products…</div>;
  if (error) return <div>Failed to load products.</div>;

  return (
    <div className="w-full grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {items.map((item) => {
        const qty = quantityMap[item.id];

        return (
          <div key={item.id} className="rounded-xl p-1 shadow-sm bg-white">
            <div className="bg-[#F3F5F7] p-3 pb-1 rounded-t-md">
              <Link href={`/products/${item.slug}`}>
                <img
                  src={item.image || "/placeholder.png"}
                  className="w-full h-40 object-contain rounded-md"
                  alt={item.name}
                />
              </Link>

              {qty === undefined ? (
                <button
                  className="w-full bg-black text-white py-2 rounded-md mt-3"
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
                  <button
                    className="text-lg font-bold bg-black rounded-md text-white px-2"
                    onClick={() => adjustQuantity(item.id, -1)}
                  >
                    –
                  </button>

                  <span className="font-semibold">{qty}</span>

                  <button
                    className="text-lg font-bold bg-black rounded-md text-white px-2"
                    onClick={() => adjustQuantity(item.id, +1)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="p-2">
              <p className="text-sm text-gray-500 mt-2">{item.brand}</p>
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-md font-bold mt-4">
                {item.currencyCode} {item.priceRaw.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
