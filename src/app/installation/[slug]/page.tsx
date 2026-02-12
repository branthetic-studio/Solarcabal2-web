"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import Suscribe from "@/Components/Suscribe/Suscribe";
import solarPanelImage from "../../../Assets/sunvec (1).png";
import hardwarelImage from "../../../Assets/Vector (1).png";
import systemImage from "../../../Assets/Vector (2).png";
import safetyImage from "../../../Assets/Vector (3).png";
import "../Installation.css";

/* ===================== QUERIES ===================== */

/** Existing query: returns products inside the collection (has productAsset) */
const GET_COLLECTION_PRODUCTS = gql`
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
        productId
        productName
        slug
        facetValueIds
        currencyCode
        productAsset {
          id
          preview
        }
        priceWithTax {
          __typename
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

/** ✅ NEW: collection meta (gives you featuredAsset for hero/banner) */
const GET_COLLECTION_HEADER = gql`
  query GetCollectionHeader($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
      }
    }
  }
`;

/* ===================== TYPES ===================== */

type PriceWithTax =
  | { __typename: "SinglePrice"; value: number }
  | { __typename: "PriceRange"; min: number; max: number };

type SearchItem = {
  productId: string;
  productName: string;
  slug: string;
  currencyCode: "NGN" | "USD" | "EUR";
  productAsset: { id: string; preview: string } | null;
  priceWithTax: PriceWithTax;
};

type GetCollectionProductsResponse = {
  search: { totalItems: number; items: SearchItem[] };
};

type GetCollectionHeaderResponse = {
  collection: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    featuredAsset?: { id: string; preview: string } | null;
  } | null;
};

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function InstallationListingPage() {
  const router = useRouter();

  const params = useParams() as Record<
    string,
    string | string[] | undefined
  > | null;
  const slug = Array.isArray(params?.slug) ? params?.slug?.[0] : params?.slug;

  const [page] = useState(1);
  const take = 20;
  const skip = (page - 1) * take;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "related">(
    "details"
  );

  /** ✅ Existing query (items w/ productAsset) */
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<GetCollectionProductsResponse>(GET_COLLECTION_PRODUCTS, {
    variables: { slug, skip, take },
    skip: !slug,
  });

  /** ✅ NEW query (collection featuredAsset) */
  const { data: headerData } = useQuery<GetCollectionHeaderResponse>(
    GET_COLLECTION_HEADER,
    {
      variables: { slug },
      skip: !slug,
    }
  );

  const items = productsData?.search.items ?? [];

  // Clamp selection when items change
  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndex(0);
      return;
    }
    if (selectedIndex > items.length - 1) {
      setSelectedIndex(0);
    }
  }, [items.length, selectedIndex]);

  const selected = items[selectedIndex];

  const selectedPrice = useMemo(() => {
    if (!selected) return 0;
    const p = selected.priceWithTax;
    return p.__typename === "SinglePrice" ? p.value : p.min;
  }, [selected]);

  const selectedPriceFormatted = NGN.format(selectedPrice / 100);

  // ✅ Keep your existing “selected image” behaviour (from productAsset)
  const selectedImg = selected?.productAsset?.preview;

  // ✅ NEW: collection hero image (featuredAsset)
  const heroImg = headerData?.collection?.featuredAsset?.preview ?? null;

  const packageTitle = useMemo(() => {
    try {
      const s = decodeURIComponent(String(slug));
      if (!s) return "Package";
      return s
        .replace(/-/g, " ")
        .replace(/\b[a-z]/g, (c) => c.toUpperCase())
        .replace(/\bKva\b/i, "KVA");
    } catch {
      return "Package";
    }
  }, [slug]);

  if (productsLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-40 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            <div className="rounded-lg bg-neutral-100 p-6 shadow-sm">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 border-b border-neutral-200 last:border-0 animate-pulse"
                />
              ))}
            </div>
            <aside className="rounded-lg bg-neutral-100 p-6 shadow-sm h-64 animate-pulse" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (productsError) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-sm text-red-600">
            Failed to load products for "{packageTitle}"
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white px-6 py-4.5 mb-14">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl">
          <p className="text-base font-medium leading-[160%] text-[#242425]">
            Products &nbsp;&gt;&nbsp; Installation Packages &nbsp;&gt;&nbsp;{" "}
            <span className="text-[#141718]">{packageTitle}</span>
          </p>
        </div>

        <section className="mx-auto max-w-6xl w-full">
          <div className="flex flex-row items-center justify-between">
            {/* LEFT: Gallery */}
            <div className="w-1/2 ">
              <div className="flex flex-col gap-3.5 h-137 mt-6">
                <div className="relative w-full h-full flex items-center justify-center bg-[#EBEEF7] rounded-md">

                  {selectedImg || heroImg ? (
                    <Image
                      src={selectedImg ?? heroImg!}
                      alt={selected?.productName ?? packageTitle}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="text-neutral-400 text-sm">
                      No image available
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex items-start justify-start gap-3 h-20">
                  {items.slice(0, 10).map((it, idx) => {
                    const isActive = idx === selectedIndex;
                    const thumb = it.productAsset?.preview;

                    return (
                      <button
                        key={it.productId}
                        onClick={() => setSelectedIndex(idx)}
                        className={`shrink-0 rounded-lg border-2 ${isActive
                          ? "border-[#00AAFF]"
                          : "border-neutral-200 hover:border-neutral-300"
                          } bg-white transition-all`}
                        title={it.productName}
                      >
                        <div className="relative w-19.5 h-19.5">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={it.productName}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-100" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Info panel */}
            <div className="w-1/2 bg-white flex items-center justify-center">
              <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl font-semibold w-42 text-black leading-snug">
                    {packageTitle}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < 4 ? "text-yellow-400" : "text-neutral-300"
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">4.8</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-sm text-red-600 font-medium">
                      1,238 Sold
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <p className="text-3xl font-bold text-neutral-900">
                    {selectedPriceFormatted}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Tax included. Shipping calculated at checkout.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between w-full gap-12">
                  <button className="w-full rounded-lg border-2 border-neutral-900 bg-white text-neutral-900 py-3.5 text-sm font-semibold hover:bg-neutral-50 transition-colors">
                    Add to Cart
                  </button>

                  <button className="w-full rounded-lg bg-neutral-900 text-white py-3.5 text-sm font-semibold hover:bg-neutral-800 transition-colors">
                    Buy Now
                  </button>

                  <button className="w-full rounded-lg bg-red-600 text-white py-3.5 text-sm font-semibold hover:bg-red-700 transition-colors">
                    Pay Later
                  </button>
                </div>

                
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12 border-b border-neutral-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "details"
                  ? "border-red-600 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                Product Detail
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "reviews"
                  ? "border-red-600 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("related")}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "related"
                  ? "border-red-600 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                Related Product
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "details" && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  {packageTitle}
                  {selected?.productName ? ` | ${selected.productName}` : ""}
                </h2>

                <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Specification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">SKU</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {selected?.productId?.slice(0, 8) ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">Category</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {headerData?.collection?.name ?? packageTitle}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">
                        Product Name
                      </span>
                      <span className="text-sm font-medium text-neutral-900">
                        {selected?.productName ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">Price</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {selectedPriceFormatted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                    What&apos;s Included
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-16 h-16 mb-1">
                        <Image src={solarPanelImage} alt="Solar Panels" />
                      </div>
                      <p className="text-md font-semibold text-neutral-900">
                        Solar Panels
                      </p>
                    </div>
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-12 h-12 mb-3">
                        <Image src={hardwarelImage} alt="Mounting Hardware" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">
                        Mounting Hardware
                      </p>
                    </div>
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-12 h-12 mb-3">
                        <Image src={systemImage} alt="System Testing" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">
                        System Testing
                      </p>
                    </div>
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-12 h-12 mb-3">
                        <Image src={safetyImage} alt="Safety Inspections" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">
                        Safety Inspections
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                {/* Review Filter */}
                <div className="bg-neutral-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Reviews Filter
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        className="flex items-center justify-between w-full text-sm hover:text-red-600 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(stars)].map((_, i) => (
                              <svg
                                key={i}
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <span className="text-neutral-600">
                          {stars === 5
                            ? "320"
                            : stars === 4
                              ? "180"
                              : stars === 3
                                ? "45"
                                : stars === 2
                                  ? "12"
                                  : "5"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Lists */}
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-neutral-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <svg
                                  key={j}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-neutral-900">
                            Excellent product! Really satisfied
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-neutral-100 rounded">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                          </button>
                          <button className="p-1.5 hover:bg-neutral-100 rounded">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-neutral-200" />
                          <span className="font-medium">John Doe</span>
                        </div>
                        <span>•</span>
                        <span>
                          {i === 0
                            ? "2 days ago"
                            : i === 1
                              ? "1 week ago"
                              : "2 weeks ago"}
                        </span>
                      </div>
                    </div>
                  ))}

                  <button className="w-full py-3 text-sm font-medium text-red-600 hover:text-red-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    View More Reviews
                  </button>
                </div>
              </div>
            )}

            {activeTab === "related" && (
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                  Related Products
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {items.slice(0, 8).map((it) => {
                    const img = it.productAsset?.preview;
                    const price =
                      it.priceWithTax.__typename === "SinglePrice"
                        ? it.priceWithTax.value
                        : it.priceWithTax.min;

                    return (
                      <button
                        key={it.productId}
                        onClick={() => {
                          const idx = items.findIndex(
                            (x) => x.productId === it.productId
                          );
                          if (idx >= 0) {
                            setSelectedIndex(idx);
                            setActiveTab("details");
                          }
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-white border border-neutral-200 rounded-lg p-4 text-left hover:border-red-500 hover:shadow-lg transition-all group"
                      >
                        <div className="relative w-full h-40 bg-neutral-50 rounded-lg overflow-hidden mb-3">
                          {img ? (
                            <Image
                              src={img}
                              alt={it.productName}
                              fill
                              className="object-contain p-4 group-hover:scale-105 transition-transform"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-100" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 ${i < 4 ? "text-yellow-400" : "text-neutral-300"
                                }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>

                        <p className="text-sm font-medium text-neutral-900 mb-2 line-clamp-2">
                          {it.productName}
                        </p>
                        <p className="text-base font-bold text-neutral-900">
                          {NGN.format(price / 100)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
      <Suscribe />
      <Footer />
    </>
  );
}