// "use client";

// import React, { useMemo, useRef, useEffect, useCallback, useState } from "react";
// import Link from "next/link";
// import { useQuery, useLazyQuery } from "@apollo/client/react";
// import { toast } from "sonner";
// import { useCart } from "@/context/CartContext";
// import { useLocalCart } from "@/context/LocalCartContext";
// import { useUser } from "@/context/UserContext";
// import { ChevronDown } from "lucide-react";
// import {
//   GET_COLLECTION_PRODUCTS,
//   GET_PRODUCT_DETAILS,
//   GET_ALL_FACETS,
// } from "@/graphql/queries";
// import { useCartClearOnSuccess } from "@/hooks/useCartClearOnSuccess";

// type Props = {
//   categorySlug: string;
//   brand: string[] | null;
//   facetValueIds?: string[];
//   condition: string;
//   priceRange: [number, number];
// };

// type GetProductDetailsResponse = {
//   product: {
//     id: string;
//     name: string;
//     variants: {
//       id: string;
//       name: string;
//       priceWithTax: number;
//       currencyCode: string;
//       stockLevel: string;
//       featuredAsset?: { preview?: string | null } | null;
//     }[];
//     featuredAsset?: { preview?: string | null } | null;
//     assets?: { preview?: string | null }[] | null;
//   };
// };

// interface GetCollectionProductsResponse {
//   search: {
//     totalItems: number;
//     items: Array<{
//       productName: string;
//       slug: string;
//       productVariantId: string;
//       productVariantName: string;
//       facetValueIds: string[];
//       productAsset?: { preview: string };
//       priceWithTax: {
//         __typename: string;
//         value?: number;
//         min?: number;
//         max?: number;
//       };
//       currencyCode: string;
//     }>;
//   };
// }

// interface GetAllFacetsResponse {
//   facets: {
//     items: Array<{
//       id: string;
//       name: string;
//       values: Array<{
//         id: string;
//         name: string;
//         facet?: { id: string; name: string } | null;
//       }>;
//     }>;
//   };
// }

// type GridItem = {
//   id: string;
//   name: string;
//   slug: string;
//   image?: string;
//   brand: string;
//   priceRaw?: number;
//   currencyCode: string;
//   stockLevel?: string;
// };

// function parseStockLevel(stockLevel?: string | null): number {
//   let limit: number;
//   if (!stockLevel) {
//     limit = Infinity;
//   } else if (stockLevel === "OUT_OF_STOCK") {
//     limit = 0;
//   } else if (stockLevel === "IN_STOCK") {
//     limit = Infinity;
//   } else {
//     const match = stockLevel.match(/^(\d+)_UNITS_LEFT$/);
//     limit = match ? parseInt(match[1], 10) : Infinity;
//   }
//   return limit;
// }

// export default function ProductGrid({
//   categorySlug,
//   brand,
//   facetValueIds,
//   condition,
//   priceRange,
// }: Props) {
//   const { customer } = useUser();
//   const {
//     cart,
//     addToCartMutation,
//     handleAdjustQuantity,
//     removeFromCartMutation,
//     getOrderLineIdByVariantId,
//   } = useCart();

//   const {
//     items: localItems,
//     addItem: addLocalItem,
//     removeItem: removeLocalItem,
//     updateQuantity: updateLocalQuantity,
//   } = useLocalCart();

//   useCartClearOnSuccess();

//   const variantIdMap = useRef<Record<string, string>>({});
//   const variantToSlug = useRef<Record<string, string>>({});
//   const stockLimitMap = useRef<Record<string, number>>({});
//   const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});
//   const [stockLevelState, setStockLevelState] = useState<Record<string, string>>({});

//   const [loadDetails] = useLazyQuery<GetProductDetailsResponse>(
//     GET_PRODUCT_DETAILS,
//     { fetchPolicy: "network-only" }
//   );

//   const { data, loading, error } = useQuery<GetCollectionProductsResponse>(
//     GET_COLLECTION_PRODUCTS,
//     {
//       variables: {
//         collectionSlug: categorySlug,
//         groupByProduct: true,
//         skip: 0,
//         take: 20,
//         facetValueIds,
//       },
//     }
//   );

//   const { data: facetsData } = useQuery<GetAllFacetsResponse>(GET_ALL_FACETS);

//   useEffect(() => {
//     if (customer) {
//       (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
//         const variantId = line?.productVariant?.id;
//         const slug = line?.productVariant?.product?.slug ?? line?.productVariant?.name;
//         if (variantId && slug) {
//           variantToSlug.current[variantId] = slug;
//           variantIdMap.current[slug] = variantId;
//         }
//       });
//     } else {
//       localItems.forEach((item) => {
//         if (item.id && item.slug) {
//           variantToSlug.current[item.id] = item.slug;
//           variantIdMap.current[item.slug] = item.id;
//         }
//       });
//     }
//   }, [customer, cart, localItems]);

//   const brandBuckets = useMemo(() => {
//     const items = data?.search?.items ?? [];
//     const facetItems = facetsData?.facets?.items ?? [];
//     if (!items.length) return [];

//     const [minDisplay, maxDisplay] = priceRange;
//     const minCents = minDisplay * 100;
//     const maxCents = maxDisplay * 100;

//     const facetValueMap: Record<string, { name: string; facetName: string }> = {};
//     facetItems.forEach((facet) => {
//       facet.values.forEach((val) => {
//         facetValueMap[val.id] = { name: val.name, facetName: val.facet?.name ?? facet.name };
//       });
//     });

//     const buckets: Record<string, { brandId: string; brandName: string; items: GridItem[] }> = {};

//     items.forEach((it) => {
//       let brandName = "Others";
//       if (it.facetValueIds?.length) {
//         for (const id of it.facetValueIds) {
//           const fi = facetValueMap[id];
//           if (fi && fi.facetName.toLowerCase().includes("brand")) {
//             brandName = fi.name;
//             break;
//           }
//         }
//       }

//       const priceRaw =
//         it.priceWithTax.__typename === "SinglePrice"
//           ? it.priceWithTax.value
//           : it.priceWithTax.min;

//       if (priceRaw !== undefined) {
//         if (priceRaw < minCents || priceRaw > maxCents) return;
//       }

//       if (!buckets[brandName]) {
//         buckets[brandName] = { brandId: brandName, brandName, items: [] };
//       }

//       buckets[brandName].items.push({
//         id: it.slug,
//         name: it.productName,
//         slug: it.slug,
//         image: it.productAsset?.preview,
//         brand: brandName,
//         priceRaw,
//         currencyCode: it.currencyCode,
//       });
//     });

//     const result = Object.values(buckets);
//     return result.filter((bucket) => bucket.items.length > 0);
//   }, [data, facetsData, priceRange]);

//   useEffect(() => {
//     if (brandBuckets.length > 0) {
//       setOpenBrands((prev) => {
//         const next = { ...prev };
//         brandBuckets.forEach((b) => {
//           if (next[b.brandId] === undefined) next[b.brandId] = true;
//         });
//         return next;
//       });
//     }
//   }, [brandBuckets]);

//   const quantityMap = useMemo<Record<string, number>>(() => {
//     const map: Record<string, number> = {};
//     if (customer) {
//       (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
//         const variantId = line?.productVariant?.id;
//         const qty = line?.quantity ?? 0;
//         if (!variantId || qty <= 0) return;
//         const slug = variantToSlug.current[variantId] ?? line?.productVariant?.product?.slug;
//         if (slug) map[slug] = qty;
//       });
//     } else {
//       localItems.forEach((item) => {
//         if (item.slug && item.quantity > 0) map[item.slug] = item.quantity;
//       });
//     }
//     return map;
//   }, [customer, cart, localItems]);

//   const updateStockLevel = useCallback((slug: string, stockLevel: string) => {
//     const limit = parseStockLevel(stockLevel);
//     stockLimitMap.current[slug] = limit;
//     setStockLevelState((prev) => ({ ...prev, [slug]: stockLevel }));
//   }, []);

//   const resolveVariant = useCallback(
//     async (item: GridItem): Promise<string | null> => {
//       if (variantIdMap.current[item.id]) {
//         if (stockLimitMap.current[item.id] === undefined) {
//           const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
//           const variant = pd?.product?.variants?.[0];
//           if (variant) updateStockLevel(item.slug, variant.stockLevel);
//         }
//         return variantIdMap.current[item.id];
//       }
//       const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
//       const variant = pd?.product?.variants?.[0];
//       if (!variant) return null;
//       variantIdMap.current[item.id] = variant.id;
//       variantToSlug.current[variant.id] = item.slug;
//       updateStockLevel(item.slug, variant.stockLevel);
//       return variant.id;
//     },
//     [loadDetails, updateStockLevel]
//   );

//   const getStockLimit = useCallback(
//     async (item: GridItem): Promise<number> => {
//       const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
//       const variant = pd?.product?.variants?.[0];
//       const stockLevel = variant?.stockLevel ?? "OUT_OF_STOCK";
//       updateStockLevel(item.slug, stockLevel);
//       return stockLimitMap.current[item.id] ?? 0;
//     },
//     [loadDetails, updateStockLevel]
//   );

//   const handleAddToCart = useCallback(
//     async (item: GridItem) => {
//       try {
//         const variantId = await resolveVariant(item);
//         if (!variantId) { toast.error("Could not load product details"); return; }

//         const stockLimit = await getStockLimit(item);
//         if (stockLimit <= 0) { toast.error("This item is out of stock"); return; }
//         const currentQty = quantityMap[item.id] ?? 0;
//         if (currentQty + 1 > stockLimit) {
//           toast.error(`Only ${stockLimit} unit(s) available in stock`);
//           return;
//         }

//         const cached = await loadDetails({ variables: { slug: item.slug } });
//         const pd = cached?.data;

//         const image =
//           item.image ??
//           pd?.product?.featuredAsset?.preview ??
//           pd?.product?.assets?.[0]?.preview ??
//           undefined;

//         addLocalItem({
//           id: variantId,
//           name: item.name,
//           slug: item.slug,
//           priceWithTax: item.priceRaw ?? 0,
//           currencyCode: item.currencyCode,
//           brand: item.brand,
//           image,
//           quantity: 1,
//         });

//         if (customer) {
//           await addToCartMutation({ productVariantId: variantId, quantity: 1 });
//         }

//         await getStockLimit(item);
//         toast.success("Added to Cart");
//       } catch (e) {
//         console.error("Add to cart error:", e);
//         toast.error("Failed to add to cart");
//       }
//     },
//     [resolveVariant, getStockLimit, quantityMap, loadDetails, addLocalItem, addToCartMutation, customer]
//   );

//   const adjustQuantity = useCallback(
//     async (item: GridItem, change: number) => {
//       const current = quantityMap[item.id] ?? 0;
//       const newQty = current + change;
//       const variantId = variantIdMap.current[item.id] ?? (await resolveVariant(item));
//       if (!variantId) return;

//       if (change > 0) {
//         const stockLimit = await getStockLimit(item);
//         if (newQty > stockLimit) {
//           toast.error(
//             stockLimit <= 0
//               ? "This item is out of stock"
//               : `Only ${stockLimit} unit(s) available in stock`
//           );
//           return;
//         }
//       }

//       if (newQty <= 0) {
//         removeLocalItem(variantId);
//         if (customer) {
//           const orderLineId = getOrderLineIdByVariantId(variantId);
//           if (orderLineId) {
//             try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
//           }
//         }
//         return;
//       }

//       updateLocalQuantity(variantId, newQty);
//       if (customer) {
//         const orderLineId = getOrderLineIdByVariantId(variantId);
//         if (orderLineId) {
//           try { await handleAdjustQuantity(orderLineId, newQty); } catch (e) { console.error(e); }
//         }
//       }
//     },
//     [
//       quantityMap, resolveVariant, getStockLimit, customer,
//       removeLocalItem, updateLocalQuantity,
//       getOrderLineIdByVariantId, removeFromCartMutation, handleAdjustQuantity,
//     ]
//   );

//   if (loading) return <div className="text-center mx-auto">Loading products…</div>;
//   if (error)   return <div>Failed to load products.</div>;

//   if (brandBuckets.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-20 text-center">
//         <p className="text-neutral-500 text-sm">No products match the selected price range.</p>
//         <p className="text-neutral-400 text-xs mt-1">Try adjusting the price filter.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full space-y-4">
//       {brandBuckets.map((brandGroup) => {
//         const isOpen = openBrands[brandGroup.brandId] ?? true;

//         return (
//           <div key={brandGroup.brandId} className="w-full">
//             <div className="w-full flex items-center justify-between py-2 border-b border-[#D4D4D4] mb-5">
//               <button
//                 onClick={() =>
//                   setOpenBrands((prev) => ({
//                     ...prev,
//                     [brandGroup.brandId]: !prev[brandGroup.brandId],
//                   }))
//                 }
//                 className="flex items-center gap-2 text-left"
//                 aria-label={`Toggle ${brandGroup.brandName} products`}
//               >
//                 <h2 className="text-sm font-semibold">{brandGroup.brandName}</h2>
//                 <span className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
//                   <ChevronDown />
//                 </span>
//               </button>

//               {/* See all → category page filtered to this brand */}
//               <Link
//                 href={`/products?category=${encodeURIComponent(categorySlug)}&brand=${encodeURIComponent(brandGroup.brandName)}`}
//                 className="text-sm font-semibold text-red-600 hover:text-red-700"
//               >
//                 See all
//               </Link>
//             </div>

//             {isOpen && (
//               <div className="px-2 pb-4">
//                 <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
//                   {brandGroup.items.map((item) => {
//                     const qty = quantityMap[item.id];
//                     const itemStockLevel = stockLevelState[item.id];
//                     const itemIsOutOfStock = itemStockLevel === "OUT_OF_STOCK";
//                     const unitsLeftMatch = itemStockLevel?.match(/^(\d+)_UNITS_LEFT$/);
//                     const itemUnitsLeft = unitsLeftMatch ? parseInt(unitsLeftMatch[1], 10) : null;
//                     const isPlusDisabled = itemIsOutOfStock || (itemUnitsLeft !== null && (qty ?? 0) >= itemUnitsLeft);

//                     return (
//                       <div key={item.id} className="rounded-[5px] p-1 shadow-sm bg-[#FFFFFF]">
//                         <div className="bg-[#F3F5F7] p-3 pb-1 rounded-t-md">
//                           <Link href={`/products/${item.slug}`}>
//                             <img
//                               src={item.image || "/placeholder.png"}
//                               className="w-full h-full object-contain rounded-md"
//                               alt={item.name}
//                             />
//                           </Link>

//                           {!qty ? (
//                             itemIsOutOfStock ? (
//                               <button
//                                 disabled
//                                 className="w-full bg-gray-300 text-gray-500 py-2 rounded-md mt-3 cursor-not-allowed text-sm"
//                               >
//                                 Out of Stock
//                               </button>
//                             ) : (
//                               <button
//                                 className="w-full bg-[#141718] text-white py-2 rounded-md mt-3"
//                                 onClick={() => handleAddToCart(item)}
//                               >
//                                 Add to Cart
//                               </button>
//                             )
//                           ) : (
//                             <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
//                               <button
//                                 className="text-lg font-bold bg-black rounded-md text-white px-2"
//                                 onClick={() => adjustQuantity(item, -1)}
//                                 aria-label="Decrease quantity"
//                               >–</button>
//                               <span className="font-semibold">{qty}</span>
//                               <button
//                                 className={`text-lg font-bold rounded-md text-white px-2 ${
//                                   isPlusDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-black"
//                                 }`}
//                                 onClick={() => !isPlusDisabled && adjustQuantity(item, +1)}
//                                 disabled={isPlusDisabled}
//                                 aria-label="Increase quantity"
//                               >+</button>
//                             </div>
//                           )}
//                         </div>

//                         <div className="p-2">
//                           <p className="text-sm text-gray-500 mt-2">{item.brand}</p>
//                           <p className="font-semibold text-sm">{item.name}</p>
//                           <p className="text-md font-bold mt-4">
//                             {item.currencyCode}{" "}
//                             {item.priceRaw ? (item.priceRaw / 100).toLocaleString() : "0.00"}
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }



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
import { useCartClearOnSuccess } from "@/hooks/useCartClearOnSuccess";

type Props = {
  categorySlug: string;
  brand: string[] | null;
  facetValueIds?: string[];
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
      stockLevel: string;
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
  id: string;
  name: string;
  slug: string;
  image?: string;
  brand: string;
  priceRaw?: number;
  currencyCode: string;
  stockLevel?: string;
};

function parseStockLevel(stockLevel?: string | null): number {
  let limit: number;
  if (!stockLevel) {
    limit = Infinity;
  } else if (stockLevel === "OUT_OF_STOCK") {
    limit = 0;
  } else if (stockLevel === "IN_STOCK") {
    limit = Infinity;
  } else {
    const match = stockLevel.match(/^(\d+)_UNITS_LEFT$/);
    limit = match ? parseInt(match[1], 10) : Infinity;
  }
  return limit;
}

export default function ProductGrid({
  categorySlug,
  brand,
  facetValueIds,
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

  useCartClearOnSuccess();

  const variantIdMap = useRef<Record<string, string>>({});
  const variantToSlug = useRef<Record<string, string>>({});
  const stockLimitMap = useRef<Record<string, number>>({});
  const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});
  const [stockLevelState, setStockLevelState] = useState<Record<string, string>>({});

  const [loadDetails] = useLazyQuery<GetProductDetailsResponse>(
    GET_PRODUCT_DETAILS,
    { fetchPolicy: "network-only" }
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

  useEffect(() => {
    if (customer) {
      (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
        const variantId = line?.productVariant?.id;
        const slug = line?.productVariant?.product?.slug ?? line?.productVariant?.name;
        if (variantId && slug) {
          variantToSlug.current[variantId] = slug;
          variantIdMap.current[slug] = variantId;
        }
      });
    } else {
      localItems.forEach((item) => {
        if (item.id && item.slug) {
          variantToSlug.current[item.id] = item.slug;
          variantIdMap.current[item.slug] = item.id;
        }
      });
    }
  }, [customer, cart, localItems]);

  const brandBuckets = useMemo(() => {
    const items = data?.search?.items ?? [];
    const facetItems = facetsData?.facets?.items ?? [];
    if (!items.length) return [];

    const [minDisplay, maxDisplay] = priceRange;
    const minCents = minDisplay * 100;
    const maxCents = maxDisplay * 100;

    const facetValueMap: Record<string, { name: string; facetName: string }> = {};
    facetItems.forEach((facet) => {
      facet.values.forEach((val) => {
        facetValueMap[val.id] = { name: val.name, facetName: val.facet?.name ?? facet.name };
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

      const priceRaw =
        it.priceWithTax.__typename === "SinglePrice"
          ? it.priceWithTax.value
          : it.priceWithTax.min;

      if (priceRaw !== undefined) {
        if (priceRaw < minCents || priceRaw > maxCents) return;
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
        priceRaw,
        currencyCode: it.currencyCode,
      });
    });

    const result = Object.values(buckets);
    return result.filter((bucket) => bucket.items.length > 0);
  }, [data, facetsData, priceRange]);

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

  const quantityMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (customer) {
      (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
        const variantId = line?.productVariant?.id;
        const qty = line?.quantity ?? 0;
        if (!variantId || qty <= 0) return;
        const slug = variantToSlug.current[variantId] ?? line?.productVariant?.product?.slug;
        if (slug) map[slug] = qty;
      });
    } else {
      localItems.forEach((item) => {
        if (item.slug && item.quantity > 0) map[item.slug] = item.quantity;
      });
    }
    return map;
  }, [customer, cart, localItems]);

  const updateStockLevel = useCallback((slug: string, stockLevel: string) => {
    const limit = parseStockLevel(stockLevel);
    stockLimitMap.current[slug] = limit;
    setStockLevelState((prev) => ({ ...prev, [slug]: stockLevel }));
  }, []);

  const resolveVariant = useCallback(
    async (item: GridItem): Promise<string | null> => {
      if (variantIdMap.current[item.id]) {
        if (stockLimitMap.current[item.id] === undefined) {
          const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
          const variant = pd?.product?.variants?.[0];
          if (variant) updateStockLevel(item.slug, variant.stockLevel);
        }
        return variantIdMap.current[item.id];
      }
      const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
      const variant = pd?.product?.variants?.[0];
      if (!variant) return null;
      variantIdMap.current[item.id] = variant.id;
      variantToSlug.current[variant.id] = item.slug;
      updateStockLevel(item.slug, variant.stockLevel);
      return variant.id;
    },
    [loadDetails, updateStockLevel]
  );

  const getStockLimit = useCallback(
    async (item: GridItem): Promise<number> => {
      const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
      const variant = pd?.product?.variants?.[0];
      const stockLevel = variant?.stockLevel ?? "OUT_OF_STOCK";
      updateStockLevel(item.slug, stockLevel);
      return stockLimitMap.current[item.id] ?? 0;
    },
    [loadDetails, updateStockLevel]
  );

  const handleAddToCart = useCallback(
    async (item: GridItem) => {
      try {
        const variantId = await resolveVariant(item);
        if (!variantId) { toast.error("Could not load product details"); return; }

        const stockLimit = await getStockLimit(item);
        if (stockLimit <= 0) { toast.error("This item is out of stock"); return; }
        const currentQty = quantityMap[item.id] ?? 0;
        if (currentQty + 1 > stockLimit) {
          toast.error(`Only ${stockLimit} unit(s) available in stock`);
          return;
        }

        const cached = await loadDetails({ variables: { slug: item.slug } });
        const pd = cached?.data;

        const image =
          item.image ??
          pd?.product?.featuredAsset?.preview ??
          pd?.product?.assets?.[0]?.preview ??
          undefined;

        addLocalItem({
          id: variantId,
          name: item.name,
          slug: item.slug,
          priceWithTax: item.priceRaw ?? 0,
          currencyCode: item.currencyCode,
          brand: item.brand,
          image,
          quantity: 1,
        });

        if (customer) {
          await addToCartMutation({ productVariantId: variantId, quantity: 1 });
        }

        await getStockLimit(item);
        toast.success("Added to Cart");
      } catch (e) {
        console.error("Add to cart error:", e);
        toast.error("Failed to add to cart");
      }
    },
    [resolveVariant, getStockLimit, quantityMap, loadDetails, addLocalItem, addToCartMutation, customer]
  );

  const adjustQuantity = useCallback(
    async (item: GridItem, change: number) => {
      const current = quantityMap[item.id] ?? 0;
      const newQty = current + change;
      const variantId = variantIdMap.current[item.id] ?? (await resolveVariant(item));
      if (!variantId) return;

      if (change > 0) {
        const stockLimit = await getStockLimit(item);
        if (newQty > stockLimit) {
          toast.error(
            stockLimit <= 0
              ? "This item is out of stock"
              : `Only ${stockLimit} unit(s) available in stock`
          );
          return;
        }
      }

      if (newQty <= 0) {
        removeLocalItem(variantId);
        if (customer) {
          const orderLineId = getOrderLineIdByVariantId(variantId);
          if (orderLineId) {
            try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
          }
        }
        return;
      }

      updateLocalQuantity(variantId, newQty);
      if (customer) {
        const orderLineId = getOrderLineIdByVariantId(variantId);
        if (orderLineId) {
          try { await handleAdjustQuantity(orderLineId, newQty); } catch (e) { console.error(e); }
        }
      }
    },
    [
      quantityMap, resolveVariant, getStockLimit, customer,
      removeLocalItem, updateLocalQuantity,
      getOrderLineIdByVariantId, removeFromCartMutation, handleAdjustQuantity,
    ]
  );

  if (loading) return <div className="text-center mx-auto">Loading products…</div>;
  if (error)   return <div>Failed to load products.</div>;

  if (brandBuckets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-20 text-center">
        <p className="text-neutral-500 text-sm">No products match the selected price range.</p>
        <p className="text-neutral-400 text-xs mt-1">Try adjusting the price filter.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {brandBuckets.map((brandGroup) => {
        const isOpen = openBrands[brandGroup.brandId] ?? true;

        return (
          <div key={brandGroup.brandId} className="w-full">
            <button
              onClick={() =>
                setOpenBrands((prev) => ({
                  ...prev,
                  [brandGroup.brandId]: !prev[brandGroup.brandId],
                }))
              }
              className="w-full flex items-center justify-between py-2 text-left border-b border-[#D4D4D4] mb-5"
              aria-label={`Toggle ${brandGroup.brandName} products`}
            >
              <h2 className="text-sm font-semibold">{brandGroup.brandName}</h2>
              <span className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                <ChevronDown />
              </span>
            </button>

            {isOpen && (
              <div className="px-2 pb-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                  {brandGroup.items.map((item) => {
                    const qty = quantityMap[item.id];
                    const itemStockLevel = stockLevelState[item.id];
                    const itemIsOutOfStock = itemStockLevel === "OUT_OF_STOCK";
                    const unitsLeftMatch = itemStockLevel?.match(/^(\d+)_UNITS_LEFT$/);
                    const itemUnitsLeft = unitsLeftMatch ? parseInt(unitsLeftMatch[1], 10) : null;
                    const isPlusDisabled = itemIsOutOfStock || (itemUnitsLeft !== null && (qty ?? 0) >= itemUnitsLeft);

                    return (
                      <div key={item.id} className="rounded-[5px] p-1 shadow-sm bg-[#FFFFFF]">
                        <div className="bg-[#F3F5F7] p-3 pb-1 rounded-t-md">
                          <Link href={`/products/${item.slug}`}>
                            <img
                              src={item.image || "/placeholder.png"}
                              className="w-full h-full object-contain rounded-md"
                              alt={item.name}
                            />
                          </Link>

                          {!qty ? (
                            itemIsOutOfStock ? (
                              <button
                                disabled
                                className="w-full bg-gray-300 text-gray-500 py-2 rounded-md mt-3 cursor-not-allowed text-sm"
                              >
                                Out of Stock
                              </button>
                            ) : (
                              <button
                                className="w-full bg-[#141718] text-white py-2 rounded-md mt-3"
                                onClick={() => handleAddToCart(item)}
                              >
                                Add to Cart
                              </button>
                            )
                          ) : (
                            <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() => adjustQuantity(item, -1)}
                                aria-label="Decrease quantity"
                              >–</button>
                              <span className="font-semibold">{qty}</span>
                              <button
                                className={`text-lg font-bold rounded-md text-white px-2 ${
                                  isPlusDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-black"
                                }`}
                                onClick={() => !isPlusDisabled && adjustQuantity(item, +1)}
                                disabled={isPlusDisabled}
                                aria-label="Increase quantity"
                              >+</button>
                            </div>
                          )}
                        </div>

                        <div className="p-2">
                          <p className="text-sm text-gray-500 mt-2">{item.brand}</p>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-md font-bold mt-4">
                            {item.currencyCode}{" "}
                            {item.priceRaw ? (item.priceRaw / 100).toLocaleString() : "0.00"}
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