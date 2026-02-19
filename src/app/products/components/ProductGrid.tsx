"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
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
        facet?: {
          id: string;
          name: string;
        } | null;
      }>;
    }>;
  };
}

type GridItem = {
  id: string;
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
  const [openBrand, setOpenBrand] = useState<string | null>(null);


  const autoAddedRef = useRef<Record<string, boolean>>({});
  const processingRef = useRef<Record<string, boolean>>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        facetValueIds: brand ?? undefined,
      },
    }
  );

  const { data: facetsData } =
    useQuery<GetAllFacetsResponse>(GET_ALL_FACETS);

  const brandBuckets = useMemo(() => {
    const items = data?.search?.items ?? [];
    const facetItems = facetsData?.facets?.items ?? [];

    if (!items.length || !facetItems.length) return [];

    const facetValueMap: Record<
      string,
      { name: string; facetName: string }
    > = {};

    facetItems.forEach((facet) => {
      facet.values.forEach((val) => {
        facetValueMap[val.id] = {
          name: val.name,
          facetName: val.facet?.name ?? facet.name,
        };
      });
    });

    const buckets: Record<
      string,
      {
        brandId: string;
        brandName: string;
        items: GridItem[];
      }
    > = {};

    items.forEach((it) => {
      let brandName = "Others";

      if (it.facetValueIds?.length) {
        for (const id of it.facetValueIds) {
          const facetInfo = facetValueMap[id];
          if (
            facetInfo &&
            facetInfo.facetName.toLowerCase().includes("brand")
          ) {
            brandName = facetInfo.name;
            break;
          }
        }
      }

      if (!buckets[brandName]) {
        buckets[brandName] = {
          brandId: brandName,
          brandName,
          items: [],
        };
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

    return Object.values(buckets);
  }, [data, facetsData]);

  // Open the first brand by default once brandBuckets are loaded
useEffect(() => {
  if (openBrand === null && brandBuckets.length > 0) {
    setOpenBrand(brandBuckets[0].brandId);
  }
}, [brandBuckets, openBrand]);



  const handleAddToCart = (itemId: string) => {
    setQuantityMap((prev) => ({ ...prev, [itemId]: 1 }));
  };

  const adjustQuantity = (itemId: string, change: number) => {
    setQuantityMap((prev) => {
      const current = prev[itemId] ?? 0;
      const newQty = current + change;

      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }

      return { ...prev, [itemId]: newQty };
    });
  };

  useEffect(() => {
    if (!brandBuckets.length) return;

    const flatItems = brandBuckets.flatMap((b) => b.items);

    const runSync = async () => {
      for (const item of flatItems) {
        if (!isMountedRef.current) return;

        const qty = quantityMap[item.id];
        if (processingRef.current[item.id]) continue;

        processingRef.current[item.id] = true;

        try {
          if (qty === undefined) {
            const existingVariantId = variantIdMap[item.id];

            if (existingVariantId) {
              removeLocalItem(existingVariantId);

              if (customer) {
                const orderLineId =
                  getOrderLineIdByVariantId(existingVariantId);
                if (orderLineId) {
                  await removeFromCartMutation(orderLineId);
                }
              }

              setVariantIdMap((prev) => {
                if (!prev[item.id]) return prev;
                const copy = { ...prev };
                delete copy[item.id];
                return copy;
              });
            }

            autoAddedRef.current[item.id] = false;
            continue;
          }

          let variantId = variantIdMap[item.id];

          if (!variantId) {
            const { data: pd } = await loadDetails({
              variables: { slug: item.slug },
            });

            const variant = pd?.product?.variants?.[0];
            if (!variant) continue;

            variantId = variant.id;

            setVariantIdMap((prev) => {
              if (prev[item.id] === variant!.id) return prev;
              return { ...prev, [item.id]: variant!.id };
            });
          }

          const { data: pd } = await loadDetails({
            variables: { slug: item.slug },
          });

          const variant = pd?.product?.variants?.[0];
          if (!variant) continue;

          const image =
            item.image ??
            pd?.product?.featuredAsset?.preview ??
            pd?.product?.assets?.[0]?.preview ??
            undefined;

          if (!autoAddedRef.current[item.id]) {
            autoAddedRef.current[item.id] = true;

            addLocalItem({
              id: variantId!,
              name: item.name,
              slug: item.slug,
              priceWithTax: variant.priceWithTax,
              currencyCode: variant.currencyCode,
              brand: item.brand,
              image,
              quantity: qty,
            });

            if (customer) {
              await addToCartMutation({
                productVariantId: variantId!,
                quantity: qty,
              });
            }

            toast.success("Added to Cart");
            continue;
          }

          updateLocalQuantity(variantId!, qty);

          if (customer) {
            const orderLineId =
              getOrderLineIdByVariantId(variantId!);
            if (orderLineId) {
              await handleAdjustQuantity(orderLineId, qty);
            }
          }
        } catch (e) {
          console.error("Cart sync error:", e);
        } finally {
          processingRef.current[item.id] = false;
        }
      }
    };

    void runSync();
  }, [
    quantityMap,
    brandBuckets,
    customer,
    loadDetails,
    addToCartMutation,
    handleAdjustQuantity,
    removeFromCartMutation,
    getOrderLineIdByVariantId,
    removeLocalItem,
    addLocalItem,
    updateLocalQuantity,
  ]);

  if (loading) return <div>Loading products…</div>;
  if (error) return <div>Failed to load products.</div>;

  return (
    <div className="w-full space-y-4">
      {brandBuckets.map((brandGroup) => {
        const isOpen = openBrand === brandGroup.brandId;

        return (
          <div
            key={brandGroup.brandId}
            className="w-full bg-white"
          >
            {/* Accordion Header */}
            <button
              onClick={() =>
                setOpenBrand((prev) =>
                  prev === brandGroup.brandId
                    ? null
                    : brandGroup.brandId
                )
              }
              className="w-210 flex items-center justify-between px-4 py-4 text-left"
            >
              <h2 className="text-sm font-semibold">
                {brandGroup.brandName}
              </h2>

              <span
                className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
                  }`}
              >
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
                      <div
                        key={item.id}
                        className="rounded-xl p-1 shadow-sm bg-white"
                      >
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
                              onClick={() =>
                                handleAddToCart(item.id)
                              }
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() =>
                                  adjustQuantity(item.id, -1)
                                }
                              >
                                –
                              </button>

                              <span className="font-semibold">
                                {qty}
                              </span>

                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() =>
                                  adjustQuantity(item.id, +1)
                                }
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          <p className="text-sm text-gray-500 mt-2">
                            {item.brand}
                          </p>
                          <p className="font-semibold text-sm">
                            {item.name}
                          </p>
                          <p className="text-md font-bold mt-4">
                            {item.currencyCode}{" "}
                            {item.priceRaw?.toLocaleString()}
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
