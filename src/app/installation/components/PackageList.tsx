"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import PackageCard from "./PackageCard";
import { Search, ChevronRight, ChevronUp } from "lucide-react";
import CartItems from "@/Components/CartItems";

import { GET_CATEGORIES_BY_FACET, SEARCH_PACKAGES } from "@/graphql/queries";
import { useFacet } from "@/context/useFacet";

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

  const [installationFacet, setInstallationFacet] = useState<
    FlatFacet | undefined
  >(undefined);

  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(
    undefined
  );

  /* ---------------- Find "installation" facet ---------------- */
  useEffect(() => {
    const installation = storeFacets.find(
      (f: FlatFacet) => f.name?.toLowerCase() === "installation"
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
    }
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

  return (
    <div className="package-container flex">
      {/* Sidebar Categories */}
      <div className="max-w-58.25 w-full flex flex-col gap-4.5 bg-white border-r-[0.44px] border-[EBEEF7] p-[21.08px]">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-sm font-semibold leading-5 text-[#191F33]">
            Installation Package
          </h1>
          <ChevronUp size={20} color="#636A80" />
        </div>

        {/* Search (UI unchanged; not wired) */}
        <div className="relative w-full">
          <div className="absolute top-[50%] left-1.5 transform -translate-y-1/2">
            <Search size={17.57} className="text-[#e0e0e0]" />
          </div>
          <input
            type="text"
            placeholder="Search for categories"
            className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-full px-7.5 py-2 text-xs focus:outline-none"
          />
        </div>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedSlug(cat.slug)}
            className={`
              w-full flex items-center justify-between border-b-2 border-[#f5f5f5]
              px-1.5 py-1 text-left text-sm
              transition
              ${
                selectedSlug === cat.slug
                  ? " text-[#FF0000] font-semibold"
                  : "hover:bg-gray-100 text-[#464D61]"
              }
            `}
          >
            <span>{cat.name}</span>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>

      {/* Products (tiers) */}
      <div className="max-w-172 w-full py-3 px-2 bg-[#FAFAFA] flex flex-col gap-5">
        {/* Header (UI unchanged; now uses selected package NAME to match UI) */}
        {selectedSlug && (
          <h2 className="text-xs font-semibold pl-2.5 text-[#FF0000] border-b pb-2 border-[#e0e0e0]">
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
        <div className="w-full">
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