"use client";
import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import PackageCard from "./PackageCard";
import {
  GetTopLevelCollectionsResponse,
  GetCollectionProductsResponse,
} from "@/types/catalog";

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
      <div className="package-sidebar w-1/4 ">
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            className={`
            relative py-10
            bg-[url('/btnpanel.png')] bg-no-repeat bg-cover bg-center
            text-left font-semibold text-xl block px-8 rounded-[6px]
            transition-[opacity,transform] hover:opacity-90 active:scale-[0.99]
            ${
              selectedSlug === cat.slug
                ? ""
                : "ring-1 ring-gray-200"
            }
          `}
            onClick={() => setSelectedSlug(cat.slug)}
          >
            <span
              className={`
              absolute inset-0 rounded-[6px]
              ${
                selectedSlug === cat.slug
                  ? "bg-linear-to-b from-red-900/60 to-red-500/80"
                  : "bg-linear-to-t from-black/100 to-black-500/80"
              }
            `}
            />
            <span className="relative z-10 text-white">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="package-main">
        {!selectedSlug && (
          <p className="text-gray-500">
            Select a category to view available products.
          </p>
        )}

        {productsLoading && <p>Loading products...</p>}
        {productsError && <p>Error loading products.</p>}

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
  );
};

export default PackageList;
