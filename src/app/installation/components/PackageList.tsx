"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Search, ChevronRight } from "lucide-react";

import {
  GET_TOP_LEVEL_COLLECTIONS,
  GET_COLLECTION_PRODUCTS,
} from "@/graphql/queries";

import {
  GetTopLevelCollectionsResponse,
  GetCollectionProductsResponse,
} from "@/types/catalog";

import PackageCard from "./PackageCard";
import CartItems from "@/Components/CartItems";

// ================= COMPONENT =================

const PackageList: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<string>("panels");

  /* ---------------- Categories ---------------- */

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery<GetTopLevelCollectionsResponse>(GET_TOP_LEVEL_COLLECTIONS);

  /* ---------------- Products ---------------- */

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<GetCollectionProductsResponse>(GET_COLLECTION_PRODUCTS, {
    variables: {
      collectionSlug: selectedSlug,
      take: 12,
      skip: 0,
    },
    skip: !selectedSlug,
  });

  /* ---------------- States ---------------- */

  if (categoriesLoading) return <p>Loading categories…</p>;
  if (categoriesError) return <p>Failed to load categories</p>;

  const categories = categoriesData?.collections.items ?? [];
  const products = productsData?.search.items ?? [];

  /* ================= RENDER ================= */

  return (
    <div className="package-container flex gap-6">

      {/* ========== SIDEBAR ========== */}

      <aside className="package-sidebar w-64 border-r">

        <h1 className="text-lg font-semibold mb-4">
          Installation Packages
        </h1>

        {/* Search (UI only for now) */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search categories"
            className="w-full rounded-full border px-10 py-2 text-sm"
          />
        </div>

        {/* Categories */}

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedSlug(cat.slug)}
            className={`w-full flex items-center justify-between
              border-b px-3 py-2 text-sm transition
              ${
                selectedSlug === cat.slug
                  ? "text-red-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <span>{cat.name}</span>
            <ChevronRight size={18} />
          </button>
        ))}
      </aside>

      {/* ========== MAIN ========== */}

      <main className="package-main flex-1">

        {/* Header */}

        {selectedSlug && (
          <h2 className="mb-6 border-b pb-2 text-md font-semibold text-red-600">
            {selectedSlug.replace(/-/g, " ")} packages
          </h2>
        )}

        {/* Loading / Error */}

        {productsLoading && <p>Loading packages…</p>}
        {productsError && <p>Failed to load packages</p>}

        {/* Grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {products.map((item) => {
            const price =
              item.priceWithTax.__typename === "SinglePrice"
                ? item.priceWithTax.value
                : item.priceWithTax.min;

            return (
              <PackageCard
                key={item.productVariantId}

                option={{
                  title: `${item.productName} (${item.productVariantName})`,

                  price,

                  features: [item.currencyCode],

                  items: [
                    {
                      name: item.productName,
                      desc: item.slug,
                      img: item.productAsset?.preview ?? "",
                    },
                  ],
                }}

                productSlug={item.slug}
                variantId={item.productVariantId!}
              />
            );
          })}

        </div>
      </main>

      {/* ========== CART ========== */}

      <aside className="w-80">
        <CartItems />
      </aside>

    </div>
  );
};

export default PackageList;
