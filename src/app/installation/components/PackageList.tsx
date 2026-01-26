"use client";
import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import PackageCard from "./PackageCard";
import { Search } from "lucide-react";
import {
  GetTopLevelCollectionsResponse,
  GetCollectionProductsResponse,
} from "@/types/catalog";
import CartItems from "@/Components/CartItems";
import { ChevronRight } from "lucide-react";

// ================== QUERIES ==================

// Fetch top-level categories (collections)
const GET_TOP_LEVEL_COLLECTIONS = gql`
  query GetTopLevelCollections {
    collections(options: { topLevelOnly: true }) {
      items {
        id
        slug
        name
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

// Fetch products in a given category (collection)
const GET_CATEGORIES_PRODUCTS = gql`
  query GetCollectionProducts($slug: String!, $skip: Int, $take: Int) {
    search(
      input: {
        collectionSlug: $slug
        groupByProduct: true
        skip: $skip
        take: $take
      }
    ) {
      totalItems
      items {
        productName
        slug
        productAsset {
          id
          preview
        }
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        currencyCode
      }
    }
  }
`;

// ================== COMPONENT ==================

const PackageList: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState("panels");

  // Fetch categories
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery<GetTopLevelCollectionsResponse>(GET_TOP_LEVEL_COLLECTIONS);

  // Fetch products when category is selected
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<GetCollectionProductsResponse>(GET_CATEGORIES_PRODUCTS, {
    variables: { slug: selectedSlug ?? "", take: 6 },
    skip: !selectedSlug, // don't run until category is chosen
  });

  if (categoriesLoading) return <p>Loading categories...</p>;
  if (categoriesError) return <p>Error loading categories.</p>;

  const categories = categoriesData?.collections.items ?? [];

  return (
    <div className="package-container flex">
      {/* Sidebar Categories */}
      <div className="package-sidebar">
        <h1 className="text-lg font-semibold">Installation Package</h1>
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

        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedSlug(cat.slug)}
            className={`
        w-full flex items-center justify-between border-b border-[#f5f5f5]
        px-4 py-2 text-left text-sm
        transition
        ${selectedSlug === cat.slug
                ? " text-red-600 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
              }
      `}
          >
            <span>{cat.name}</span>

            <ChevronRight size={20} />
          </button>
        ))}
      </div>


      {/* Products */}
      <div className="package-main">

        {/* Header */}
        {selectedSlug && (
          <h2 className="text-md font-semibold mb-6 text-red-600 border-b pb-2 border-[#e0e0e0]">
            {selectedSlug.replace("-", " ")} package
          </h2>
        )}

        {!selectedSlug && (
          <p className="text-gray-500">
            Select a category to view available products.
          </p>
        )}

        {productsLoading && <p>Loading products...</p>}
        {productsError && <p>Error loading products.</p>}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {productsData?.search.items.map((product: any, idx: number) => {
            const price =
              product.priceWithTax.__typename === "SinglePrice"
                ? `${product.priceWithTax.value}`
                : `${product.priceWithTax.min} - ${product.priceWithTax.max}`;

            return (
              <PackageCard
                key={idx}
                option={{
                  title: product.productName,
                  price,
                  features: [product.currencyCode],
                  items: [
                    {
                      name: product.productName,
                      desc: product.slug,
                      img: product.productAsset?.preview ?? "",
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
