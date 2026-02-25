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
   * STEP 1 — Find the "Installation" Tag facet from storeFacets
   * storeFacets log confirmed: { name: "Installation", facet: { name: "Tag" } }
   * This is the correct facet per the docs — NOT the Category facets
   * --------------------------------------------------------------- */
  const [installationFacet, setInstallationFacet] = useState<FlatFacet | undefined>(undefined);

  useEffect(() => {
    if (installationFacet) return;
    const found = storeFacets.find(
      (f: FlatFacet) => f.name?.toLowerCase() === "installation"
    );
    if (found) setInstallationFacet(found);
  }, [storeFacets]);

  /* ---------------------------------------------------------------
   * STEP 2 — GET_CATEGORIES_BY_FACET with Installation facet ID
   * Returns KVA package collections — these are the sidebar items
   * Each collection has its own featuredAsset (the icon/image)
   * Docs: skip: facet === undefined (strict check)
   * --------------------------------------------------------------- */
  const {
    data: collectionsData,
    loading: collectionsLoading,
  } = useQuery<FacetCollectionsData, FacetCollectionsVars>(
    GET_CATEGORIES_BY_FACET,
    {
      variables: { facetValues: { and: installationFacet?.id } },
      skip: installationFacet === undefined,
    }
  );

  /* De-dupe collections */
  const collections = useMemo(() => {
    const raw = collectionsData?.search?.collections?.map((x) => x.collection) ?? [];
    return Array.from(new Map(raw.map((c) => [c.slug, c])).values());
  }, [collectionsData]);

  /* ---------------------------------------------------------------
   * STEP 3 — Track selected slug, auto-select first on load
   * --------------------------------------------------------------- */
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!selectedSlug && collections.length > 0) {
      setSelectedSlug(collections[0].slug);
    }
  }, [collections, selectedSlug]);

  const selectedCategory = useMemo(
    () => collections.find((c) => c.slug === selectedSlug),
    [collections, selectedSlug]
  );

  /* ---------------------------------------------------------------
   * STEP 4 — SEARCH_PACKAGES for selected collection
   * Docs: find collection where item.collection.slug === selected
   * --------------------------------------------------------------- */
  const {
    data: packagesData,
    loading: packagesLoading,
    error: packagesError,
  } = useQuery<SearchPackagesData, SearchPackagesVars>(SEARCH_PACKAGES, {
    variables: { input: { collectionSlug: selectedSlug ?? "" } },
    skip: !selectedSlug,
  });

  const selectedCollection = useMemo(() => {
    if (!packagesData) return undefined;
    return packagesData.search.collections.find(
      (item) => item.collection.slug === selectedSlug
    )?.collection;
  }, [packagesData, selectedSlug]);

  const allVariants = selectedCollection?.productVariants?.items ?? [];

  /* ---------------------------------------------------------------
   * Group variants by Brand facet name — same logic as before
   * --------------------------------------------------------------- */
  const brandFacets = useMemo(() => {
    return storeFacets.filter(
      (f: FlatFacet) => f.facet?.name?.toLowerCase() === "brand"
    );
  }, [storeFacets]);

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

    const matchedIds = new Set(groups.flatMap((g) => g.variants.map((v) => v.id)));
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

        {/* Mobile dropdown */}
        <div className="block md:hidden mb-4">
          <select
            value={selectedSlug ?? ""}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="" disabled>Select Package</option>
            {collections.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Desktop: KVA package list with each collection's own featuredAsset icon */}
        <div className="hidden md:block">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedSlug(c.slug)}
              className={`
                w-full flex items-center justify-between
                border-b border-[#f5f5f5]
                px-4 py-2 text-left text-sm transition
                ${selectedSlug === c.slug
                  ? "text-red-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                }
              `}
            >
              <div className="flex items-center gap-2">
                {/* ✅ Each collection's own featuredAsset — shows for ALL items */}
                {c.featuredAsset?.preview ? (
                  <img
                    src={c.featuredAsset.preview}
                    alt={c.name}
                    className="w-6 h-6 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0" />
                )}
                <span>{c.name}</span>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>

        {collectionsLoading && (
          <p className="text-sm text-gray-400 mt-2">Loading...</p>
        )}
      </div>

      {/* ── Products: grouped by brand — same UI as before ── */}
      <div className="package-main">
        {selectedCategory && (
          <h2 className="text-md font-semibold mb-6 text-red-600 border-b pb-2 border-[#e0e0e0]">
            {selectedCategory.name}
          </h2>
        )}

        {!selectedCategory && !collectionsLoading && (
          <p className="text-gray-500">Select a package to view products.</p>
        )}

        {packagesLoading && <p>Loading products...</p>}
        {packagesError && <p>Error loading products.</p>}

        {/* One section per brand, rendered in order */}
        {variantsByBrand.map(({ brandName, variants }) => (
          <div key={brandName} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">{brandName}</h3>
              <span className="text-xs text-gray-400">
                {variants.length} product{variants.length !== 1 ? "s" : ""}
              </span>
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
                    collectionSlug={selectedSlug ?? undefined}
                    variantId={variant.id}
                    productSlug={variant.product?.slug ?? undefined}
                    collectionImg={selectedCategory?.featuredAsset?.preview ?? undefined} // ← add this
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