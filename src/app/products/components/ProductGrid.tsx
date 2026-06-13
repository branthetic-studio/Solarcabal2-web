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

// type Props = {
//   categorySlug: string;
//   brand: string[] | null;
//   facetValueIds?: string[];
//   sort: string;
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
//   id: string;       // slug — stable key used everywhere
//   name: string;
//   slug: string;
//   image?: string;
//   brand: string;
//   priceRaw?: number;
//   currencyCode: string;
// };

// export default function ProductGrid({
//   categorySlug,
//   brand,
//   facetValueIds,
//   sort,
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

//   // variantIdMap: slug → variantId (populated lazily on first add-to-cart,
//   // AND eagerly from cart data on mount so refresh restores quantities)
//   const variantIdMap = useRef<Record<string, string>>({});

//   // reverse map: variantId → slug (built from cart on every render)
//   const variantToSlug = useRef<Record<string, string>>({});

//   const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});

//   const [loadDetails] = useLazyQuery<GetProductDetailsResponse>(
//     GET_PRODUCT_DETAILS,
//     { fetchPolicy: "cache-first" }
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

//   // ─── Build reverse map from live cart data ────────────────────────────────
//   // This runs on every render so variantToSlug is always up-to-date.
//   // For server cart: line.productVariant.id → line.productVariant.product.slug
//   // For local cart: item.id is variantId, item.slug is the product slug
//   useEffect(() => {
//     if (customer) {
//       (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
//         const variantId = line?.productVariant?.id;
//         const slug =
//           line?.productVariant?.product?.slug ??
//           line?.productVariant?.name; // fallback
//         if (variantId && slug) {
//           variantToSlug.current[variantId] = slug;
//           variantIdMap.current[slug] = variantId; // also populate forward map
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

//   // ─── Brand buckets with price filtering ───────────────────────────────────
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
//         facetValueMap[val.id] = {
//           name: val.name,
//           facetName: val.facet?.name ?? facet.name,
//         };
//       });
//     });

//     const buckets: Record<
//       string,
//       { brandId: string; brandName: string; items: GridItem[] }
//     > = {};

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
//         id: it.slug,       // slug as stable ID
//         name: it.productName,
//         slug: it.slug,
//         image: it.productAsset?.preview,
//         brand: brandName,
//         priceRaw,
//         currencyCode: it.currencyCode,
//       });
//     });

//     const result = Object.values(buckets);

//     result.forEach((bucket) => {
//       bucket.items.sort((a, b) => {
//         switch (sort) {
//           case "priceAsc":  return (a.priceRaw ?? 0) - (b.priceRaw ?? 0);
//           case "priceDesc": return (b.priceRaw ?? 0) - (a.priceRaw ?? 0);
//           case "nameAsc":   return a.name.localeCompare(b.name);
//           case "nameDesc":  return b.name.localeCompare(a.name);
//           default:          return 0;
//         }
//       });
//     });

//     return result.filter((bucket) => bucket.items.length > 0);
//   }, [data, facetsData, sort, priceRange]);

//   // Open all brand sections by default on first load
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

//   // ─── quantityMap keyed by SLUG (not variantId) ────────────────────────────
//   // This is the core fix: we key by slug so quantities survive refresh.
//   // On refresh, variantToSlug is rebuilt from cart data in the useEffect above,
//   // so the slug lookup always works even before any click.
//   const quantityMap = useMemo<Record<string, number>>(() => {
//     const map: Record<string, number> = {};

//     if (customer) {
//       // Server cart: look up slug from variantToSlug reverse map
//       (cart?.activeOrder?.lines ?? []).forEach((line: any) => {
//         const variantId = line?.productVariant?.id;
//         const qty = line?.quantity ?? 0;
//         if (!variantId || qty <= 0) return;

//         // Try reverse map first, then fall back to product slug on the line
//         const slug =
//           variantToSlug.current[variantId] ??
//           line?.productVariant?.product?.slug;

//         if (slug) map[slug] = qty;
//       });
//     } else {
//       // Local cart: item.slug is the product slug, item.id is variantId
//       localItems.forEach((item) => {
//         if (item.slug && item.quantity > 0) {
//           map[item.slug] = item.quantity;
//         }
//       });
//     }

//     return map;
//   }, [customer, cart, localItems]);

//   // ─── Resolve & cache variantId ─────────────────────────────────────────────
//   const resolveVariant = useCallback(
//     async (item: GridItem): Promise<string | null> => {
//       // Already cached from a previous click or from cart data on mount
//       if (variantIdMap.current[item.id]) return variantIdMap.current[item.id];

//       const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
//       const variant = pd?.product?.variants?.[0];
//       if (!variant) return null;

//       variantIdMap.current[item.id] = variant.id;
//       variantToSlug.current[variant.id] = item.slug;
//       return variant.id;
//     },
//     [loadDetails]
//   );

//   // ─── Add to cart ──────────────────────────────────────────────────────────
//   const handleAddToCart = useCallback(
//     async (item: GridItem) => {
//       try {
//         const variantId = await resolveVariant(item);
//         if (!variantId) {
//           toast.error("Could not load product details");
//           return;
//         }

//         const cached = await loadDetails({ variables: { slug: item.slug } });
//         const pd = cached?.data;

//         const image =
//           item.image ??
//           pd?.product?.featuredAsset?.preview ??
//           pd?.product?.assets?.[0]?.preview ??
//           undefined;

//         const priceInCents = item.priceRaw ?? 0;

//         addLocalItem({
//           id: variantId,
//           name: item.name,
//           slug: item.slug,   // ← always persist slug so quantityMap works on refresh
//           priceWithTax: priceInCents,
//           currencyCode: item.currencyCode,
//           brand: item.brand,
//           image,
//           quantity: 1,
//         });

//         if (customer) {
//           await addToCartMutation({ productVariantId: variantId, quantity: 1 });
//         }

//         toast.success("Added to Cart");
//       } catch (e) {
//         console.error("Add to cart error:", e);
//         toast.error("Failed to add to cart");
//       }
//     },
//     [resolveVariant, loadDetails, addLocalItem, addToCartMutation, customer]
//   );

//   // ─── Adjust / remove quantity ─────────────────────────────────────────────
//   const adjustQuantity = useCallback(
//     async (item: GridItem, change: number) => {
//       const current = quantityMap[item.id] ?? 0;
//       const newQty = current + change;

//       // Ensure variantId is resolved before adjusting
//       const variantId =
//         variantIdMap.current[item.id] ?? (await resolveVariant(item));
//       if (!variantId) return;

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
//       quantityMap,
//       resolveVariant,
//       customer,
//       removeLocalItem,
//       updateLocalQuantity,
//       getOrderLineIdByVariantId,
//       removeFromCartMutation,
//       handleAdjustQuantity,
//     ]
//   );

//   if (loading) return <div className="text-center mx-auto">Loading products…</div>;
//   if (error)   return <div>Failed to load products.</div>;

//   if (brandBuckets.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-20 text-center">
//         <p className="text-neutral-500 text-sm">No products match the selected price range.</p>
//         <p className="text-neutral-400 text-xs mt-1">Try adjusting the price filter in the sidebar.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full space-y-4">
//       {brandBuckets.map((brandGroup) => {
//         const isOpen = openBrands[brandGroup.brandId] ?? true;

//         return (
//           <div key={brandGroup.brandId} className="w-full">
//             {/* Accordion Header */}
//             <button
//               onClick={() =>
//                 setOpenBrands((prev) => ({
//                   ...prev,
//                   [brandGroup.brandId]: !prev[brandGroup.brandId],
//                 }))
//               }
//               className="w-full flex items-center justify-between py-2 text-left border-b border-[#D4D4D4] mb-5"
//               aria-label={`Toggle ${brandGroup.brandName} products`}
//             >
//               <h2 className="text-sm font-semibold">{brandGroup.brandName}</h2>
//               <span className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
//                 <ChevronDown />
//               </span>
//             </button>

//             {/* Accordion Content */}
//             {isOpen && (
//               <div className="px-2 pb-4">
//                 <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
//                   {brandGroup.items.map((item) => {
//                     const qty = quantityMap[item.id];

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
//                             <button
//                               className="w-full bg-[#141718] text-white py-2 rounded-md mt-3"
//                               onClick={() => handleAddToCart(item)}
//                             >
//                               Add to Cart
//                             </button>
//                           ) : (
//                             <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
//                               <button
//                                 className="text-lg font-bold bg-black rounded-md text-white px-2"
//                                 onClick={() => adjustQuantity(item, -1)}
//                                 aria-label="Decrease quantity"
//                               >
//                                 –
//                               </button>
//                               <span className="font-semibold">{qty}</span>
//                               <button
//                                 className="text-lg font-bold bg-black rounded-md text-white px-2"
//                                 onClick={() => adjustQuantity(item, +1)}
//                                 aria-label="Increase quantity"
//                               >
//                                 +
//                               </button>
//                             </div>
//                           )}
//                         </div>

//                         <div className="p-2">
//                           <p className="text-sm text-gray-500 mt-2">{item.brand}</p>
//                           <p className="font-semibold text-sm">{item.name}</p>
//                           <p className="text-md font-bold mt-4">
//                             {item.currencyCode}{" "}
//                             {item.priceRaw
//                               ? (item.priceRaw / 100).toLocaleString()
//                               : "0.00"}
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
//   sort: string;
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
// };

// export default function ProductGrid({
//   categorySlug,
//   brand,
//   facetValueIds,
//   sort,
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

//   // Clear cart if coming back from a successful payment
//   useCartClearOnSuccess();

//   const variantIdMap = useRef<Record<string, string>>({});
//   const variantToSlug = useRef<Record<string, string>>({});
//   const [openBrands, setOpenBrands] = useState<Record<string, boolean>>({});

//   const [loadDetails] = useLazyQuery<GetProductDetailsResponse>(
//     GET_PRODUCT_DETAILS,
//     { fetchPolicy: "cache-first" }
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
// console.log("ProductGrid data", data)
//   const { data: facetsData } = useQuery<GetAllFacetsResponse>(GET_ALL_FACETS);

//   console.log("ProductGrid render",facetsData)

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

//     result.forEach((bucket) => {
//       bucket.items.sort((a, b) => {
//         switch (sort) {
//           case "priceAsc":  return (a.priceRaw ?? 0) - (b.priceRaw ?? 0);
//           case "priceDesc": return (b.priceRaw ?? 0) - (a.priceRaw ?? 0);
//           case "nameAsc":   return a.name.localeCompare(b.name);
//           case "nameDesc":  return b.name.localeCompare(a.name);
//           default:          return 0;
//         }
//       });
//     });

//     return result.filter((bucket) => bucket.items.length > 0);
//   }, [data, facetsData, sort, priceRange]);

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

//   const resolveVariant = useCallback(
//     async (item: GridItem): Promise<string | null> => {
//       if (variantIdMap.current[item.id]) return variantIdMap.current[item.id];
//       const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
//       const variant = pd?.product?.variants?.[0];
//       if (!variant) return null;
//       variantIdMap.current[item.id] = variant.id;
//       variantToSlug.current[variant.id] = item.slug;
//       return variant.id;
//     },
//     [loadDetails]
//   );

//   const handleAddToCart = useCallback(
//     async (item: GridItem) => {
//       try {
//         const variantId = await resolveVariant(item);
//         if (!variantId) { toast.error("Could not load product details"); return; }

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

//         toast.success("Added to Cart");
//       } catch (e) {
//         console.error("Add to cart error:", e);
//         toast.error("Failed to add to cart");
//       }
//     },
//     [resolveVariant, loadDetails, addLocalItem, addToCartMutation, customer]
//   );

//   const adjustQuantity = useCallback(
//     async (item: GridItem, change: number) => {
//       const current = quantityMap[item.id] ?? 0;
//       const newQty = current + change;
//       const variantId = variantIdMap.current[item.id] ?? (await resolveVariant(item));
//       if (!variantId) return;

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
//       quantityMap, resolveVariant, customer,
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
//         <p className="text-neutral-400 text-xs mt-1">Try adjusting the price filter in the sidebar.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full space-y-4">
//       {brandBuckets.map((brandGroup) => {
//         const isOpen = openBrands[brandGroup.brandId] ?? true;

//         return (
//           <div key={brandGroup.brandId} className="w-full">
//             <button
//               onClick={() =>
//                 setOpenBrands((prev) => ({
//                   ...prev,
//                   [brandGroup.brandId]: !prev[brandGroup.brandId],
//                 }))
//               }
//               className="w-full flex items-center justify-between py-2 text-left border-b border-[#D4D4D4] mb-5"
//               aria-label={`Toggle ${brandGroup.brandName} products`}
//             >
//               <h2 className="text-sm font-semibold">{brandGroup.brandName}</h2>
//               <span className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
//                 <ChevronDown />
//               </span>
//             </button>

//             {isOpen && (
//               <div className="px-2 pb-4">
//                 <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
//                   {brandGroup.items.map((item) => {
//                     const qty = quantityMap[item.id];
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
//                             <button
//                               className="w-full bg-[#141718] text-white py-2 rounded-md mt-3"
//                               onClick={() => handleAddToCart(item)}
//                             >
//                               Add to Cart
//                             </button>
//                           ) : (
//                             <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
//                               <button
//                                 className="text-lg font-bold bg-black rounded-md text-white px-2"
//                                 onClick={() => adjustQuantity(item, -1)}
//                                 aria-label="Decrease quantity"
//                               >–</button>
//                               <span className="font-semibold">{qty}</span>
//                               <button
//                                 className="text-lg font-bold bg-black rounded-md text-white px-2"
//                                 onClick={() => adjustQuantity(item, +1)}
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
};

/**
 * Parses Vendure's stockLevel string into a numeric max quantity.
 * - "OUT_OF_STOCK"      -> 0
 * - "5_UNITS_LEFT"      -> 5  (any "X_UNITS_LEFT" pattern, 1-10)
 * - "IN_STOCK"          -> Infinity (no display limit, >10 available)
 * - anything else/empty -> Infinity (fail open, don\'t block legit purchases)
 */
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

  console.log("[stock] parseStockLevel:", { stockLevel, limit });
  return limit;
}

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

  // Clear cart if coming back from a successful payment
  useCartClearOnSuccess();

  const variantIdMap = useRef<Record<string, string>>({});
  const variantToSlug = useRef<Record<string, string>>({});
  // Cache of max purchasable quantity per item.id (slug), derived from stockLevel
  const stockLimitMap = useRef<Record<string, number>>({});
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

    result.forEach((bucket) => {
      bucket.items.sort((a, b) => {
        switch (sort) {
          case "priceAsc":  return (a.priceRaw ?? 0) - (b.priceRaw ?? 0);
          case "priceDesc": return (b.priceRaw ?? 0) - (a.priceRaw ?? 0);
          case "nameAsc":   return a.name.localeCompare(b.name);
          case "nameDesc":  return b.name.localeCompare(a.name);
          default:          return 0;
        }
      });
    });

    return result.filter((bucket) => bucket.items.length > 0);
  }, [data, facetsData, sort, priceRange]);

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

  const resolveVariant = useCallback(
    async (item: GridItem): Promise<string | null> => {
      if (variantIdMap.current[item.id]) {
        // Refresh stock limit even if variantId is cached — stock can change
        if (stockLimitMap.current[item.id] === undefined) {
          const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
          const variant = pd?.product?.variants?.[0];
          if (variant) {
            stockLimitMap.current[item.id] = parseStockLevel(variant.stockLevel);
          }
        }
        return variantIdMap.current[item.id];
      }
      const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
      const variant = pd?.product?.variants?.[0];
      if (!variant) return null;
      variantIdMap.current[item.id] = variant.id;
      variantToSlug.current[variant.id] = item.slug;
      stockLimitMap.current[item.id] = parseStockLevel(variant.stockLevel);
      return variant.id;
    },
    [loadDetails]
  );

  /** Returns the cached stock limit for an item, fetching it if not yet known. */
  const getStockLimit = useCallback(
    async (item: GridItem): Promise<number> => {
      if (stockLimitMap.current[item.id] !== undefined) {
        console.log("[stock] getStockLimit (cached):", {
          item: item.name,
          slug: item.slug,
          limit: stockLimitMap.current[item.id],
        });
        return stockLimitMap.current[item.id];
      }
      const { data: pd } = await loadDetails({ variables: { slug: item.slug } });
      const variant = pd?.product?.variants?.[0];
      const limit = parseStockLevel(variant?.stockLevel);
      stockLimitMap.current[item.id] = limit;
      console.log("[stock] getStockLimit (fetched):", {
        item: item.name,
        slug: item.slug,
        stockLevel: variant?.stockLevel,
        limit,
      });
      return limit;
    },
    [loadDetails]
  );

  const handleAddToCart = useCallback(
    async (item: GridItem) => {
      try {
        const variantId = await resolveVariant(item);
        if (!variantId) { toast.error("Could not load product details"); return; }

        // ── Stock check: don\'t add if out of stock ──
        const stockLimit = await getStockLimit(item);
        console.log("[stock] handleAddToCart check:", {
          item: item.name,
          currentQty: quantityMap[item.id] ?? 0,
          stockLimit,
        });
        if (stockLimit <= 0) {
          toast.error("This item is out of stock");
          return;
        }
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

      // ── Stock check: don\'t allow increasing beyond available stock ──
      if (change > 0) {
        const stockLimit = await getStockLimit(item);
        console.log("[stock] adjustQuantity check:", {
          item: item.name,
          current,
          newQty,
          stockLimit,
        });
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
        <p className="text-neutral-400 text-xs mt-1">Try adjusting the price filter in the sidebar.</p>
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
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                  {brandGroup.items.map((item) => {
                    const qty = quantityMap[item.id];
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
                            <button
                              className="w-full bg-[#141718] text-white py-2 rounded-md mt-3"
                              onClick={() => handleAddToCart(item)}
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <div className="flex items-center justify-between mt-3 bg-gray-100 rounded-md px-3 py-2">
                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() => adjustQuantity(item, -1)}
                                aria-label="Decrease quantity"
                              >–</button>
                              <span className="font-semibold">{qty}</span>
                              <button
                                className="text-lg font-bold bg-black rounded-md text-white px-2"
                                onClick={() => adjustQuantity(item, +1)}
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