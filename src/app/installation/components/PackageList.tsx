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

/* ---------------- Types (minimal, local) ---------------- */
type FlatFacet = { id: string; name: string };

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
  facetValues: {
    and?: string;
  };
};

type SearchPackagesData = {
  search: {
    collections: Array<{
      collection: {
        id: string;
        name: string;
        slug: string;
        productVariants: {
          items: Array<{
            id: string;
            name: string;
            priceWithTax?: number | null;
            product?: { slug?: string | null } | null;
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
          }>;
        };
      };
    }>;
    facetValues?: Array<{
      count: number;
      facetValue: {
        id: string;
        name: string;
        facet: { id: string; name: string };
      };
    }>;
  };
};

type SearchPackagesVars = {
  input: {
    collectionSlug: string;
  };
};

/* ---------------- ✅ CHANGED: Helpers for correct KVA ordering ---------------- */
const extractKva = (text: string) => {
  const s = (text || "").toLowerCase().replace(/\s+/g, "");
  const m = s.match(/(\d+(\.\d+)?)kva/);
  if (!m) return Number.POSITIVE_INFINITY;
  return parseFloat(m[1]);
};

const PackageList: React.FC = () => {
  const { storeFacets } = useFacet();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const [installationFacet, setInstallationFacet] = useState<
    FlatFacet | undefined
  >(undefined);

  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(
    undefined,
  );

  /* ---------------- Find "installation" facet ---------------- */
  useEffect(() => {
    const installation = storeFacets.find(
      (f: FlatFacet) => f.name?.toLowerCase() === "installation",
    );
    if (installation) setInstallationFacet(installation);
  }, [storeFacets]);

  /* ---------------- Sidebar: get installation package collections ---------------- */
  const {
    data: packagesData,
    loading: packagesLoading,
    error: packagesError,
  } = useQuery<FacetCollectionsData, FacetCollectionsVars>(
    GET_CATEGORIES_BY_FACET,
    {
      variables: {
        facetValues: {
          and: installationFacet?.id,
        },
      },
      skip: !installationFacet?.id,
    },
  );

  /* ---------------- ✅ CHANGED: Build, DEDUPE and SORT categories by KVA ---------------- */
  const categories = useMemo(() => {
    const raw =
      packagesData?.search?.collections?.map((x) => x.collection) ?? [];

    // De-dupe by slug (your UI screenshot shows repeated package rows)
    const uniq = Array.from(new Map(raw.map((c) => [c.slug, c])).values());

    // Sort low -> high by KVA (use name first, fallback to slug)
    return uniq.sort((a, b) => {
      const aKva = extractKva(a.name || a.slug);
      const bKva = extractKva(b.name || b.slug);
      if (aKva !== bKva) return aKva - bKva;
      return (a.name || a.slug).localeCompare(b.name || b.slug);
    });
  }, [packagesData]);

  /* ---------------- ✅ CHANGED: Auto-select LOWEST KVA on first load ---------------- */
  useEffect(() => {
    if (!selectedSlug && categories.length > 0) {
      setSelectedSlug(categories[0].slug); // categories is sorted => lowest KVA
    }
  }, [categories, selectedSlug]);

  /* ---------------- Grid: get tiers/variants for selected package ---------------- */
  const {
    data: tiersData,
    loading: tiersLoading,
    error: tiersError,
  } = useQuery<SearchPackagesData, SearchPackagesVars>(SEARCH_PACKAGES, {
    variables: {
      input: {
        collectionSlug: selectedSlug ?? "",
      },
    },
    skip: !selectedSlug,
  });

  /* ---------------- Selected package collection + tiers ---------------- */
  const selectedCollection = useMemo(() => {
    const list = tiersData?.search?.collections ?? [];
    return list.find((x) => x.collection.slug === selectedSlug)?.collection;
  }, [tiersData, selectedSlug]);

  const tiers = selectedCollection?.productVariants?.items ?? [];

  /* ---------------- ✅ CHANGED: Find selected category object for header ---------------- */
  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.slug === selectedSlug);
  }, [categories, selectedSlug]);

  // Sidebar loading/errors
  if (packagesLoading) return <p>Loading categories...</p>;
  if (packagesError) return <p>Error loading categories.</p>;

  const { cart } = useCart();
  const { items: localItems } = useLocalCart();
  const { customer, logout, loading } = useUser();

  const getCartCount = () => {
    if (customer) {
      const lines = cart?.activeOrder?.lines ?? [];
      return lines.length;
    } else {
      return localItems.length;
    }
  };

  const cartCount = mounted ? getCartCount() : 0;

  return (
    <div className="package-container flex">
      {/* Sidebar Categories */}
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

        {/* Search (UI unchanged; not wired) */}
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
        {/* ✅ Mobile Dropdown */}
        <div className="block w-50 md:hidden mb-4">
          <select
            value={selectedSlug ?? ""}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="
      w-75
      border
      border-gray-300
      rounded-md
      px-3
      py-2
      text-sm
      bg-white
      focus:outline-none
      focus:ring-2
      focus:ring-red-500
    "
          >
            <option value="" disabled className="text-xs w-full">
              Select Package
            </option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug} className="text-xs w-50">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Desktop Buttons */}
        <div className="hidden md:block">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSlug(cat.slug)}
              className={`
        w-full flex items-center justify-between
        border-b border-[#f5f5f5]
        px-4 py-2 text-left text-sm
        transition
        ${selectedSlug === cat.slug
                  ? "text-red-600 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                }
      `}
            >
              <span>{cat.name}</span>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Products (tiers) */}
      <div className="package-main">
        {/* Header (UI unchanged; now uses selected package NAME to match UI) */}
        {selectedSlug && (
          <h2 className="text-md font-semibold mb-6 text-red-600 border-b pb-2 border-[#e0e0e0]">
            {selectedCategory?.name ?? selectedSlug.replace("-", " ")} package
          </h2>
        )}

        {!selectedSlug && (
          <p className="text-gray-500">
            Select a category to view available products.
          </p>
        )}

        {tiersLoading && <p>Loading products...</p>}
        {tiersError && <p>Error loading products.</p>}

        {/* Grid (UI unchanged) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((variant, idx) => {
            const price = variant.priceWithTax
              ? `${variant.priceWithTax}`
              : "0";

            return (
              <PackageCard
                key={variant.id ?? idx}
                option={{
                  title: variant.name, // tier name e.g. Gold / Silver / Normal
                  price,
                  features: [
                    variant.customFields?.packageCapacity
                      ? `Capacity: ${variant.customFields.packageCapacity}`
                      : "Installation tier",
                  ],
                  items: [
                    {
                      name: variant.name,
                      desc: variant.product?.slug ?? "",
                      img: variant.featuredAsset?.preview ?? "",
                    },
                  ],
                }}
                collectionSlug={selectedSlug ?? undefined}
              />
            );
          })}
        </div>
      </div>

      <div className="flex-2 package-cart">
        <CartItems />
      </div>
    </div>
  );
};

export default PackageList;
