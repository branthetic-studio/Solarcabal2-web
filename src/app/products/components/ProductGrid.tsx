"use client";

import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";
import { ChevronDown } from "lucide-react";
import {
  GET_COLLECTION_PRODUCTS,
  GET_PRODUCT_DETAILS,
  GET_ALL_FACETS,
} from "@/graphql/queries";

type Props = {
  categorySlug: string;
  brand: string[] | null;
  facetValueIds?: string[];
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
      facetValueIds: string[];
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

interface GetAllFacetsResponse {
  facets: {
    items: Array<{
      id: string;
      name: string;
      values: Array<{
        id: string;
        name: string;
        facet?: { id: string; name: string } | null;
      }>;
    }>;
  };
}

type GridItem = {
  id: string; // slug — stable key
  name: string;
  slug: string;
  image?: string;
  brand: string;
  priceRaw?: number;
  currencyCode: string;
};

export default function ProductGrid({
  categorySlug,
  brand,
  facetValueIds,
  sort,
  condition,
  priceRange,
}: Props) {
  const { customer } = useUser();
  const {
    cart,
    addToCartMutation,
    handleAdjustQuantity,
    removeFromCartMutation,
    getOrderLineIdByVariantId,
  } = useCart();

  const {
    items: localItems,
    addItem: addLocalItem,
    removeItem: removeLocalItem,
    updateQuantity: updateLocalQuantity,
  } = useLocalCart();

  // Cached slug → variantId. A ref so it never triggers re-renders.
  const variantIdMap = useRef<Record<string, string>>({});

  const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});

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
        facetValueIds,
      },
    }
  );

  const { data: facetsData } = useQuery<GetAllFacetsResponse>(GET_ALL_FACETS);

  // ─── Brand buckets ──────────────────────────────────────────────────────────
  const brandBuckets = useMemo(() => {
    const items = data?.search?.items ?? [];
    const facetItems = facetsData?.facets?.items ?? [];
    if (!items.length) return [];

    const facetValueMap: Record<string, { name: string; facetName: string }> = {};
    facetItems.forEach((facet) => {
      facet.values.forEach((val) => {
        facetValueMap[val.id] = {
          name: val.name,
          facetName: val.facet?.name ?? facet.name,
        };
      });
    });

    const buckets: Record<string, { brandId: string; brandName: string; items: GridItem[] }> = {};

    items.forEach((it) => {
      let brandName = "Others";
      if (it.facetValueIds?.length) {
        for (const id of it.facetValueIds) {
          const fi = facetValueMap[id];
          if (fi && fi.facetName.toLowerCase().includes("brand")) {
            brandName = fi.name;
            break;
          }
        }
      }

      if (!buckets[brandName]) {
        buckets[brandName] = { brandId: brandName, brandName, items: [] };
      }

      buckets[brandName].items.push({
        id: it.slug,
        name: it.productName,
        slug: it.slug,
        image: it.productAsset?.preview,
        brand: brandName,
        priceRaw:
          it.priceWithTax.__typename === "SinglePrice"
            ? it.priceWithTax.value
            : it.priceWithTax.min,
        currencyCode: it.currencyCode,
      });
    });

    const result = Object.values(buckets);
    result.forEach((bucket) => {
      bucket.items.sort((a, b) => {
        switch (sort) {
          case "priceAsc": return (a.priceRaw ?? 0) - (b.priceRaw ?? 0);
          case "priceDesc": return (b.priceRaw ?? 0) - (a.priceRaw ?? 0);
          case "nameAsc": return a.name.localeCompare(b.name);
          case "nameDesc": return b.name.localeCompare(a.name);
          default: return 0;
        }
      });
    });

    return result;
  }, [data, facetsData, sort]);

  // Open all brand sections by default on first load
  useEffect(() => {
    if (brandBuckets.length > 0) {
      setOpenBrands((prev) => {
        const next = { ...prev };
        brandBuckets.forEach((b) => {
          if (next[b.brandId] === undefined) next[b.brandId] = true;
        });
        return next;
      });
    }
  }, [brandBuckets]);

  // ─── quantityMap derived from live cart contexts ─────────────────────────────
  // KEY FIX: no longer local state — computed from useCart / useLocalCart.
  // When CartItems or CartPage removes an item, those contexts update,
  // this memo re-runs, and the "Add to Cart" button reappears automatically.
  const quantityMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    const slugToVariant = variantIdMap.current;

    if (customer) {
      // variantId → qty from the live server order
      const serverQty: Record<string, number> = {};
      (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
        const vid = line?.productVariant?.id;
        if (vid) serverQty[vid] = line.quantity ?? 0;
      });

      // Translate back to slug keys
      Object.entries(slugToVariant).forEach(([slug, variantId]) => {
        const qty = serverQty[variantId];
        if (qty && qty > 0) map[slug] = qty;
      });
    } else {
      // Guest: match localItems by their stored id (which is variantId)
      const localQty: Record<string, number> = {};
      localItems.forEach((it) => { localQty[it.id] = it.quantity; });

      Object.entries(slugToVariant).forEach(([slug, variantId]) => {
        const qty = localQty[variantId];
        if (qty && qty > 0) map[slug] = qty;
      });
    }

    return map;
  }, [customer, cart, localItems]);

  // ─── Resolve & cache variantId for an item ─────────────────────────────────
  const resolveVariant = useCallback(
    async (item: GridItem): Promise<string | null> => {
      if (variantIdMap.current[item.id]) return variantIdMap.current[item.id];
      const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
      const variant = pd?.product?.variants?.[0];
      if (!variant) return null;
      variantIdMap.current[item.id] = variant.id;
      return variant.id;
    },
    [loadDetails]
  );

  // ─── Add to cart ─────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    async (item: GridItem) => {
      try {
        const variantId = await resolveVariant(item);
        if (!variantId) {
          toast.error("Could not load product details");
          return;
        }

        const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
        const variant = pd?.product?.variants?.[0];
        if (!variant) return;

        const image =
          item.image ??
          pd?.product?.featuredAsset?.preview ??
          pd?.product?.assets?.[0]?.preview ??
          undefined;

        // Add to local cart → triggers quantityMap recompute via useMemo
        addLocalItem({
          id: variantId,
          name: item.name,
          slug: item.slug,
          priceWithTax: variant.priceWithTax,
          currencyCode: variant.currencyCode,
          brand: item.brand,
          image,
          quantity: 1,
        });

        if (customer) {
          await addToCartMutation({ productVariantId: variantId, quantity: 1 });
        }

        toast.success("Added to Cart");
      } catch (e) {
        console.error("Add to cart error:", e);
        toast.error("Failed to add to cart");
      }
    },
    [resolveVariant, loadDetails, addLocalItem, addToCartMutation, customer]
  );

  // ─── Adjust / remove quantity ─────────────────────────────────────────────
  const adjustQuantity = useCallback(
    async (item: GridItem, change: number) => {
      const current = quantityMap[item.id] ?? 0;
      const newQty = current + change;
      const variantId = variantIdMap.current[item.id];
      if (!variantId) return;

      if (newQty <= 0) {
        // Remove → quantityMap drops this entry on next render
        removeLocalItem(variantId);
        if (customer) {
          const orderLineId = getOrderLineIdByVariantId(variantId);
          if (orderLineId) {
            try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
          }
        }
        return;
      }

      // Update → quantityMap reflects new value on next render
      updateLocalQuantity(variantId, newQty);
      if (customer) {
        const orderLineId = getOrderLineIdByVariantId(variantId);
        if (orderLineId) {
          try { await handleAdjustQuantity(orderLineId, newQty); } catch (e) { console.error(e); }
        }
      }
    },
    [
      quantityMap,
      customer,
      removeLocalItem,
      updateLocalQuantity,
      getOrderLineIdByVariantId,
      removeFromCartMutation,
      handleAdjustQuantity,
    ]
  );

  if (loading) return <div className="text-center mx-auto">Loading products…</div>;
  if (error) return <div>Failed to load products.</div>;
  if (brandBuckets.length === 0) return <div className="text-center mx-auto">No products found.</div>;

  return (
    <div className="w-full space-y-4">
      {brandBuckets.map((brandGroup) => {
        const isOpen = openBrands[brandGroup.brandId] ?? true;

        return (
          <div key={brandGroup.brandId} className="w-full bg-white">
            {/* Accordion Header */}
            <button
              onClick={() =>
                setOpenBrands((prev) => ({
                  ...prev,
                  [brandGroup.brandId]: !prev[brandGroup.brandId],
                }))
              }
              className="w-full flex items-center justify-between px-4 py-4 text-left"
            >
              <h2 className="text-sm font-semibold">{brandGroup.brandName}</h2>
              <span className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                <ChevronDown />
              </span>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="px-4 pb-4">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                  {brandGroup.items.map((item) => {
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

                          {!qty ? (
                            <button
                              className="w-full bg-black text-white py-2 rounded-md mt-3"
                              onClick={() => handleAddToCart(item)}
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() => adjustQuantity(item, -1)}
                              >
                                –
                              </button>
                              <span className="font-semibold">{qty}</span>
                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() => adjustQuantity(item, +1)}
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
                            {item.currencyCode} {item.priceRaw ? (item.priceRaw / 100).toLocaleString() : '0.0'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}