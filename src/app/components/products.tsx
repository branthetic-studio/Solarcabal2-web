"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import Rating from "../../Assets/Star Icon.png";
import Link from "next/link";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useFacet } from "@/context/useFacet";
import { FlatFacet } from "@/types/catalog";

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
      items {
        productName
        slug
        productVariantId
        description
        productAsset {
          id
          preview
        }
        productVariantName
        inStock
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
      }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (priceWithTax: any): string => {
  if (!priceWithTax) return "₦—";
  if ("value" in priceWithTax && typeof priceWithTax.value === "number") {
    return `₦${(priceWithTax.value / 100).toLocaleString()}`;
  }
  if (
    "min" in priceWithTax &&
    "max" in priceWithTax &&
    typeof priceWithTax.min === "number" &&
    typeof priceWithTax.max === "number"
  ) {
    return `₦${(priceWithTax.min / 100).toLocaleString()} – ₦${(
      priceWithTax.max / 100
    ).toLocaleString()}`;
  }
  return "₦—";
};

const Rate = ({ rating = 4 }: { rating?: number }) => (
  <div style={{ display: "flex", gap: "5px" }}>
    {[...Array(5)].map((_, index) => (
      <Image
        key={index}
        src={Rating}
        alt="Star"
        style={{
          width: "20px",
          height: "20px",
          margin: "5px 0",
          opacity: index < rating ? 1 : 0.2,
        }}
        className="bg-[#ffffff]"
      />
    ))}
  </div>
);

// ─── Query response type ─────────────────────────────────────────────────────

interface SearchItem {
  productName: string;
  slug: string;
  productVariantId: string;
  description: string;
  productAsset?: { id: string; preview: string } | null;
  productVariantName: string;
  inStock: boolean;
  priceWithTax: { __typename?: string; value?: number; min?: number; max?: number };
}

interface SearchProductsResponse {
  search: {
    totalItems: number;
    items: SearchItem[];
  };
}

// ─── Skeleton card shown while loading ───────────────────────────────────────

const SkeletonCard = () => (
  <div className="product relative animate-pulse">
    <div className="product-img bg-gray-200 rounded-md h-40 w-full" />
    <div className="product-detail mt-2 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const Products = () => {
  const { storeFacets } = useFacet();
  const [popularFacet, setPopularFacet] = useState<FlatFacet | undefined>();

  // Find the "popular" facet value from the context once storeFacets are ready
  useEffect(() => {
    const popular = storeFacets.find(
      (facet) => facet.name.toLowerCase() === "popular"
    );
    if (popular) setPopularFacet(popular);
  }, [storeFacets]);

  const { data, loading, error } = useQuery<SearchProductsResponse>(SEARCH_PRODUCTS, {
    variables: {
      input: {
        facetValueFilters: [{ and: popularFacet?.id }],
      },
    },
    skip: popularFacet === undefined, // don't fire until we have the facet id
  });

  const items: any[] = data?.search?.items ?? [];

  return (
    <div className="products-container bg-[#ffffff] my-6">
      <div className="products-header">
        <h3>Popular Products</h3>
        <Link
          className="text-lg flex gap-2 items-center cursor-pointer"
          href="/products"
          passHref
        >
          <span className="text-[#FF0000] font-medium">More Products</span>
          <FaArrowRight className="text-[#ff0000] font-medium" />
        </Link>
      </div>

      <div className="product-grid">
        {/* Loading skeletons */}
        {(loading || popularFacet === undefined) &&
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}

        {/* Error state */}
        {error && !loading && (
          <p className="text-sm text-red-500 col-span-full py-4">
            Failed to load products.
          </p>
        )}

        {/* Real products */}
        {!loading &&
          !error &&
          items.slice(0, 4).map((item, index) => (
            <Link
              href={`/products/${item.slug}`}
              key={item.productVariantId ?? index}
              className="product relative"
            >
              {/* Badge for first item */}
              {index === 0 && (
                <div className="absolute top-2 left-2 flex w-full pr-6 justify-between items-center">
                  <span className="bg-[#ff0000] text-white text-sm px-3 py-2 rounded-xl">
                    Best Seller
                  </span>
                  <div className="bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
                    <Image
                      src="/fav icon.png"
                      alt="add to favourites"
                      width={25}
                      height={25}
                    />
                  </div>
                </div>
              )}

              {/* Badge for second item */}
              {index === 1 && (
                <div className="absolute top-2 left-2 flex w-full pr-6 justify-between items-center">
                  <span className="bg-[#000000] text-white text-sm px-3 py-2 rounded-xl">
                    New
                  </span>
                  <div className="bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
                    <Image
                      src="/fav icon.png"
                      alt="add to favourites"
                      width={25}
                      height={25}
                    />
                  </div>
                </div>
              )}

              {/* Fav icon only for remaining items */}
              {index >= 2 && (
                <div className="absolute top-2 right-2 bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
                  <Image
                    src="/fav icon.png"
                    alt="add to favourites"
                    width={25}
                    height={25}
                  />
                </div>
              )}

              {/* Product image */}
              <div className="product-img">
                {item.productAsset?.preview ? (
                  <Image
                    src={item.productAsset.preview}
                    unoptimized
                    alt={item.productName}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="product-detail">
                <h6>{formatPrice(item.priceWithTax)}</h6>
                <Rate />
                <h5>{item.productName}</h5>
              </div>
            </Link>
          ))}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && popularFacet !== undefined && (
          <p className="text-sm text-neutral-500 col-span-full py-4 text-center">
            No popular products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Products;