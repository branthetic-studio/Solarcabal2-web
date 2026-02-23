"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import PackageCard from "./PackageCard";
import { Search, ChevronRight } from "lucide-react";
import CartItems from "@/Components/CartItems";
import Image from "next/image";
import { GET_CATEGORIES_BY_FACET, SEARCH_PACKAGES } from "@/graphql/queries";
import { useFacet } from "@/context/useFacet";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import Link from "next/link";

/* ---------------- Types ---------------- */
type FlatFacet = {
  id: string;
  name: string;
  facetId?: string;
  facet?: { id: string; name: string };
};

type FacetCollectionsData = {
  search: {
    collections: Array<{
      collection: {
        id: string;
        name: string;
        slug: string;
        featuredAsset?: { id: string; preview?: string | null } | null;
      };
    }>;
  };
};

type FacetCollectionsVars = {
  facetValues: { and?: string };
};

type Variant = {
  id: string;
  name: string;
  priceWithTax?: number | null;
  product?: {
    slug?: string | null;
    featuredAsset?: { id: string; preview?: string | null } | null;
  } | null;
  featuredAsset?: { id: string; preview?: string | null } | null;
  customFields?: {
    packageCapacity?: string | null;
    packageComponents?: Array<{
      id: string;
      name: string;
      slug: string;
      featuredAsset?: { id: string; preview?: string | null } | null;
    }> | null;
  } | null;
};

type SearchPackagesData = {
  search: {
    totalItems: number;
    collections: Array<{
      collection: {
        id: string;
        name: string;
        slug: string;
        productVariants: {
          items: Variant[];
        };
      };
    }>;
  };
};

type SearchPackagesVars = {
  input: { collectionSlug: string };
};

/* ---------------- Price formatter ---------------- */
const formatPrice = (priceWithTax?: number | null): string => {
  if (!priceWithTax) return "₦0";
  return (priceWithTax / 100).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });
};

const PackageList: React.FC = () => {
  const { storeFacets } = useFacet();
  const { cart } = useCart();
  const { items: localItems } = useLocalCart();
  const { customer } = useUser();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /* ---------------------------------------------------------------
   * LEVEL 1 — Sidebar: Battery, Panels, Inverter
   * Source: storeFacets where facet.name === "Category"
   * --------------------------------------------------------------- */
  const categoryFacets = useMemo(() => {
    return storeFacets.filter(
      (f: FlatFacet) => f.facet?.name?.toLowerCase() === "category"
    );
  }, [storeFacets]);

  const [selectedCategoryFacet, setSelectedCategoryFacet] = useState<
    FlatFacet | undefined
  >(undefined);

  useEffect(() => {
    if (!selectedCategoryFacet && categoryFacets.length > 0) {
      setSelectedCategoryFacet(categoryFacets[0]);
    }
  }, [categoryFacets, selectedCategoryFacet]);

  /* ---------------------------------------------------------------
   * Fetch the category collection to get its slug and featuredAsset
   * --------------------------------------------------------------- */
  const {
    data: categoryCollectionData,
    loading: categoryLoading,
  } = useQuery<FacetCollectionsData, FacetCollectionsVars>(
    GET_CATEGORIES_BY_FACET,
    {
      variables: { facetValues: { and: selectedCategoryFacet?.id } },
      skip: selectedCategoryFacet === undefined,
    }
  );

  const categoryCollection = useMemo(() => {
    const list = categoryCollectionData?.search?.collections ?? [];
    return list.find(
      (x) =>
        x.collection.name.toLowerCase() ===
        selectedCategoryFacet?.name?.toLowerCase()
    )?.collection;
  }, [categoryCollectionData, selectedCategoryFacet]);

  /* ---------------------------------------------------------------
   * LEVEL 2 — Brands from storeFacets where facet.name === "Brand"
   * No extra query needed — already in storeFacets
   * --------------------------------------------------------------- */
  const brandFacets = useMemo(() => {
    return storeFacets.filter(
      (f: FlatFacet) => f.facet?.name?.toLowerCase() === "brand"
    );
  }, [storeFacets]);

  /* ---------------------------------------------------------------
   * LEVEL 3 — Fetch all variants for the selected category collection
   * --------------------------------------------------------------- */
  const {
    data: packagesData,
    loading: packagesLoading,
    error: packagesError,
  } = useQuery<SearchPackagesData, SearchPackagesVars>(SEARCH_PACKAGES, {
    variables: {
      input: { collectionSlug: categoryCollection?.slug ?? "" },
    },
    skip: !categoryCollection?.slug,
  });

  const selectedCollection = useMemo(() => {
    if (!packagesData || !categoryCollection) return undefined;
    return packagesData.search.collections.find(
      (item) => item.collection.slug === categoryCollection.slug
    )?.collection;
  }, [packagesData, categoryCollection]);

  const allVariants = selectedCollection?.productVariants?.items ?? [];

  /* ---------------------------------------------------------------
   * Group variants by brand name.
   * Each brand facet name (e.g. "Coleman") is matched against the
   * variant name. Variants that don't match any brand go into "Other".
   * --------------------------------------------------------------- */
  const variantsByBrand = useMemo(() => {
    const groups: Array<{ brandName: string; variants: Variant[] }> = [];

    brandFacets.forEach((brand: FlatFacet) => {
      const matched = allVariants.filter((v) =>
        v.name.toLowerCase().includes(brand.name.toLowerCase())
      );
      if (matched.length > 0) {
        groups.push({ brandName: brand.name, variants: matched });
      }
    });

    // Catch any variants not matched by any brand
    const matchedIds = new Set(
      groups.flatMap((g) => g.variants.map((v) => v.id))
    );
    const others = allVariants.filter((v) => !matchedIds.has(v.id));
    if (others.length > 0) {
      groups.push({ brandName: "Other", variants: others });
    }

    return groups;
  }, [allVariants, brandFacets]);

  /* ---------------- Cart count ---------------- */
  const cartCount = useMemo(() => {
    if (!mounted) return 0;
    if (customer) return cart?.activeOrder?.lines?.length ?? 0;
    return localItems.length;
  }, [mounted, customer, cart, localItems]);

  return (
    <div className="package-container flex">
      {/* ── Sidebar ── */}
      <div className="package-sidebar">
        <div className="flex justify-between">
          <h1 className="text-lg font-semibold">Installation Package</h1>
          <Link
            href="/cart"
            aria-label="Cart"
            className="flex gap-2 border border-[#E4E9EE] text-sm relative px-5 py-3 md:hidden sm:block hover:bg-gray-100 rounded-lg transition-colors items-center"
          >
            Cart
            <Image src="/shop-cart.png" alt="Cart" width={20} height={20} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute top-[50%] left-3 transform -translate-y-1/2">
            <Search className="text-[#e0e0e0]" />
          </div>
          <input
            type="text"
            placeholder="Search for categories"
            className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-full px-12 py-2 text-sm focus:outline-none"
          />
        </div>

        <h1>Select Package</h1>

        {/* Mobile: Category dropdown */}
        <div className="block md:hidden mb-4">
          <select
            value={selectedCategoryFacet?.id ?? ""}
            onChange={(e) => {
              const found = categoryFacets.find(
                (f: FlatFacet) => f.id === e.target.value
              );
              setSelectedCategoryFacet(found);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {categoryFacets.map((f: FlatFacet) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop: Category list with icon */}
        <div className="hidden md:block">
          {categoryFacets.map((f: FlatFacet) => {
            const isSelected = selectedCategoryFacet?.id === f.id;
            const imgUrl = isSelected
              ? categoryCollection?.featuredAsset?.preview
              : undefined;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedCategoryFacet(f)}
                className={`
                  w-full flex items-center justify-between
                  border-b border-[#f5f5f5]
                  px-4 py-2 text-left text-sm transition
                  ${isSelected
                    ? "text-red-600 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={f.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100" />
                  )}
                  <span>{f.name}</span>
                </div>
                <ChevronRight size={20} />
              </button>
            );
          })}
        </div>

        {categoryLoading && (
          <p className="text-sm text-gray-400 mt-2">Loading...</p>
        )}
      </div>

      {/* ── Products: grouped by brand ── */}
      <div className="package-main">
        {categoryCollection && (
          <h2 className="text-md font-semibold mb-6 text-red-600 border-b pb-2 border-[#e0e0e0]">
            {categoryCollection.name}
          </h2>
        )}

        {!categoryCollection && !categoryLoading && (
          <p className="text-gray-500">Select a category to view products.</p>
        )}

        {packagesLoading && <p>Loading products...</p>}
        {packagesError && <p>Error loading products.</p>}

        {/* ✅ One section per brand, rendered in order */}
        {variantsByBrand.map(({ brandName, variants }) => (
          <div key={brandName} className="mb-10">
            {/* Brand heading */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">{brandName}</h3>
              <span className="text-xs text-gray-400">{variants.length} product{variants.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
              {variants.map((variant, idx) => {
                const imgUrl =
                  variant.product?.featuredAsset?.preview ??
                  variant.featuredAsset?.preview ??
                  "";

                return (
                  <PackageCard
                    key={variant.id ?? idx}
                    option={{
                      title: variant.name,
                      price: formatPrice(variant.priceWithTax),
                      features: [
                        variant.customFields?.packageCapacity
                          ? `Capacity: ${variant.customFields.packageCapacity}`
                          : "Package",
                      ],
                      items: [
                        {
                          name: variant.name,
                          desc: variant.product?.slug ?? "",
                          img: imgUrl,
                        },
                      ],
                    }}
                    collectionSlug={categoryCollection?.slug}
                    variantId={variant.id}
                    productSlug={variant.product?.slug ?? undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-2 package-cart">
        <CartItems />
      </div>
    </div>
  );
};

export default PackageList;