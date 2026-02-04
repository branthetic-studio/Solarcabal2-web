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

type UseCartContext = {
  removeFromCartMutation: (options: {
    variables: { productVariantId: string };
  }) => Promise<void>;
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
    getOrderLineIdByVariantId, // ✅ Get helper
  } = useCart();
  const { addItem: addLocalItem, removeItem: removeLocalItem } = useLocalCart();

  const [quantityMap, setQuantityMap] = useState<
    Record<string, number | undefined>
  >({});
  const [variantIdMap, setVariantIdMap] = useState<Record<string, string>>({}); // ✅ Track variantId by itemId
  const autoAddedRef = useRef<Record<string, boolean>>({});

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

  const handleAddToCart = async (itemId: string) => {
    setQuantityMap((prev) => ({ ...prev, [itemId]: 1 }));
  };

  const adjustQuantity = (itemId: string, change: number) => {
    setQuantityMap((prev) => {
      const newQty = (prev[itemId] || 1) + change;
      if (newQty <= 0) {
        return { ...prev, [itemId]: undefined };
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  // ✅ FIXED: Auto sync with proper orderLineId tracking
  useEffect(() => {
    items.forEach(async (item) => {
      const qty = quantityMap[item.id];

      if (qty === undefined) {
        // ✅ Remove using orderLineId, not item.id
        removeLocalItem(item.id);

        if (customer) {
          const variantId = variantIdMap[item.id];
          if (variantId) {
            const orderLineId = getOrderLineIdByVariantId(variantId);
            if (orderLineId) {
              await removeFromCartMutation(orderLineId);
            }
          }
        }

        // Clean up tracking
        setVariantIdMap((prev) => {
          const newMap = { ...prev };
          delete newMap[item.id];
          return newMap;
        });
        autoAddedRef.current[item.id] = false;
        return;
      }

      // Fetch variant details
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

      // ✅ Track variantId for this item
      setVariantIdMap((prev) => ({ ...prev, [item.id]: variant.id }));

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

        if (customer) {
          await addToCartMutation({
            productVariantId: variant.id,
            quantity: qty,
          });
        }

        toast.success("Added to Cart");
        return;
      }

      // ✅ Update using orderLineId, not variantId
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

      if (customer) {
        const orderLineId = getOrderLineIdByVariantId(variant.id);
        if (orderLineId) {
          await handleAdjustQuantity(orderLineId, qty);
        }
      }
    });
  }, [quantityMap, items]);

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