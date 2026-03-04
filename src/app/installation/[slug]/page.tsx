"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import Suscribe from "@/Components/Suscribe/Suscribe";
import solarPanelImage from "../../../Assets/sunvec (1).png";
import hardwarelImage from "../../../Assets/Vector (1).png";
import systemImage from "../../../Assets/Vector (2).png";
import safetyImage from "../../../Assets/Vector (3).png";
import "../Installation.css";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";

/* ===================== QUERIES ===================== */

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

const GET_PRODUCT_VARIANT = gql`
  query GetProductVariant($slug: String!) {
    product(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      variants {
        id
        name
        priceWithTax
        featuredAsset {
          id
          preview
        }
        customFields {
          packageCapacity
          packageComponents {
            id
            name
            slug
            featuredAsset {
              id
              preview
            }
          }
        }
      }
    }
  }
`;

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
  currencyCode: string;
  productAsset: { id: string; preview: string } | null;
  priceWithTax: PriceWithTax;
};

type ProductVariant = {
  id: string;
  name: string;
  priceWithTax: number;
  featuredAsset?: { id: string; preview: string } | null;
  customFields?: {
    packageCapacity?: string | null;
    packageComponents?: Array<{
      id: string;
      name: string;
      slug: string;
      featuredAsset?: { id: string; preview: string } | null;
    }> | null;
  } | null;
};

type ProductData = {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    featuredAsset?: { id: string; preview: string } | null;
    assets?: Array<{ id: string; preview: string }> | null;
    variants: ProductVariant[];
  } | null;
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
  const params = useParams() as Record<string, string | string[] | undefined> | null;
  const searchParams = useSearchParams();

  // ── Cart hooks ──────────────────────────────────────────────────────────────
  const { customer } = useUser();
  const { addToCartMutation } = useCart();
  const { addItem: addLocalItem } = useLocalCart();

  const collectionSlug = Array.isArray(params?.slug)
    ? params?.slug?.[0]
    : params?.slug;

  const variantId = searchParams?.get("variantId") ?? undefined;
  const productSlug = searchParams?.get("productSlug") ?? undefined;

  const collectionImgParam = searchParams?.get("collectionImg")
    ? decodeURIComponent(searchParams.get("collectionImg")!)
    : undefined;

  const variantImgParam = searchParams?.get("variantImg")
    ? decodeURIComponent(searchParams.get("variantImg")!)
    : undefined;

  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "related">("details");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const take = 20;

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<GetCollectionProductsResponse>(GET_COLLECTION_PRODUCTS, {
    variables: { slug: collectionSlug, skip: 0, take },
    skip: !collectionSlug,
  });

  const {
    data: productData,
    loading: productLoading,
  } = useQuery<ProductData>(GET_PRODUCT_VARIANT, {
    variables: { slug: productSlug },
    skip: !productSlug,
  });

  const { data: headerData } = useQuery<GetCollectionHeaderResponse>(
    GET_COLLECTION_HEADER,
    {
      variables: { slug: collectionSlug },
      skip: !collectionSlug,
    }
  );

  const collectionItems = productsData?.search.items ?? [];
  const product = productData?.product ?? null;

  const activeVariant = useMemo(() => {
    if (!product || !variantId) return product?.variants?.[0] ?? null;
    return product.variants.find((v) => v.id === variantId) ?? product.variants[0] ?? null;
  }, [product, variantId]);

  const galleryImages = useMemo(() => {
    const imgs: string[] = [];

    if (variantImgParam) imgs.push(variantImgParam);

    const collectionImg =
      collectionImgParam ?? headerData?.collection?.featuredAsset?.preview ?? null;
    if (collectionImg && !imgs.includes(collectionImg)) imgs.push(collectionImg);

    if (product?.featuredAsset?.preview && !imgs.includes(product.featuredAsset.preview))
      imgs.push(product.featuredAsset.preview);

    product?.assets?.forEach((a) => {
      if (a.preview && !imgs.includes(a.preview)) imgs.push(a.preview);
    });

    if (
      activeVariant?.featuredAsset?.preview &&
      !imgs.includes(activeVariant.featuredAsset.preview)
    ) {
      imgs.push(activeVariant.featuredAsset.preview);
    }

    return imgs;
  }, [product, activeVariant, collectionImgParam, variantImgParam, headerData]);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [variantId, productSlug]);

  useEffect(() => {
    if (selectedImageIdx >= galleryImages.length && galleryImages.length > 0) {
      setSelectedImageIdx(0);
    }
  }, [galleryImages.length, selectedImageIdx]);

  const activePrice = useMemo(() => {
    if (activeVariant?.priceWithTax) return activeVariant.priceWithTax / 100;
    const match = collectionItems.find((i) => i.slug === productSlug);
    if (!match) return 0;
    const p = match.priceWithTax;
    return (p.__typename === "SinglePrice" ? p.value : p.min) / 100;
  }, [activeVariant, collectionItems, productSlug]);

  const productName =
    product?.name ??
    collectionItems.find((i) => i.slug === productSlug)?.productName ??
    "";

  const packageTitle = useMemo(() => {
    try {
      const s = decodeURIComponent(String(collectionSlug ?? ""));
      if (!s) return "Package";
      return s
        .replace(/-/g, " ")
        .replace(/\b[a-z]/g, (c) => c.toUpperCase())
        .replace(/\bKva\b/i, "KVA");
    } catch {
      return "Package";
    }
  }, [collectionSlug]);

  const buildVariantHref = (v: ProductVariant) => {
    const variantImg = v.featuredAsset?.preview ?? "";
    const p = new URLSearchParams();
    if (productSlug) p.set("productSlug", productSlug);
    p.set("variantId", v.id);
    if (collectionImgParam) p.set("collectionImg", collectionImgParam);
    if (variantImg) p.set("variantImg", variantImg);
    return `/installation/${collectionSlug}?${p.toString()}`;
  };

  // ── Add to cart handler ─────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    if (!activeVariant) {
      toast.error("Please select a variant first");
      return;
    }

    setAddingToCart(true);

    try {
      const image =
        galleryImages[0] ??
        product?.featuredAsset?.preview ??
        undefined;

      // Always add to local cart first (instant, optimistic)
      addLocalItem({
        id: activeVariant.id,
        name: productName || packageTitle,
        slug: productSlug ?? collectionSlug ?? "",
        priceWithTax: activeVariant.priceWithTax,
        currencyCode: "NGN",
        image,
        quantity: 1,
      });

      // If logged in, also push to server
      if (customer) {
        await addToCartMutation({
          productVariantId: activeVariant.id,
          quantity: 1,
        });
      }

      toast.success("Added to cart!");
    } catch (e) {
      console.error("[InstallationPage] Add to cart error:", e);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }, [
    activeVariant,
    galleryImages,
    product,
    productName,
    packageTitle,
    productSlug,
    collectionSlug,
    customer,
    addLocalItem,
    addToCartMutation,
  ]);

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    router.push("/checkout");
  }, [handleAddToCart, router]);

  // ── Loading / error states ──────────────────────────────────────────────────
  if (productsLoading || productLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-40 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            <div className="rounded-lg bg-neutral-100 p-6 shadow-sm">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 border-b border-neutral-200 last:border-0 animate-pulse" />
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
            Products &nbsp;&gt;&nbsp; {headerData?.collection?.name ?? packageTitle} &nbsp;&gt;&nbsp;{" "}
            <span className="text-[#141718]">{productName || packageTitle}</span>
          </p>
        </div>

        <section className="mx-auto max-w-6xl w-full">
          <div className="flex flex-col md:flex-row items-center justify-between">

            {/* LEFT: Image gallery */}
            <div className="w-full md:w-1/2">
              <div className="flex flex-col gap-3.5 h-137 mt-6">
                <div className="relative w-full h-full flex items-center justify-center bg-[#EBEEF7] rounded-md">
                  {galleryImages[selectedImageIdx] ? (
                    <Image
                      src={galleryImages[selectedImageIdx]}
                      alt={productName || packageTitle}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="text-neutral-400 text-sm">No image available</div>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="flex items-start justify-start gap-3 h-20">
                    {galleryImages.slice(0, 10).map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`shrink-0 rounded-lg border-2 ${
                          idx === selectedImageIdx
                            ? "border-[#00AAFF]"
                            : "border-neutral-200 hover:border-neutral-300"
                        } bg-white transition-all`}
                      >
                        <div className="relative w-19.5 h-19.5">
                          <Image
                            src={src}
                            alt={`${productName} image ${idx + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {galleryImages.length <= 1 && collectionItems.length > 0 && (
                  <div className="flex items-start justify-start gap-3 h-20">
                    {collectionItems.slice(0, 10).map((it, idx) => {
                      const thumb = it.productAsset?.preview;
                      return (
                        <button
                          key={it.productId}
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`shrink-0 rounded-lg border-2 ${
                            idx === selectedImageIdx
                              ? "border-[#00AAFF]"
                              : "border-neutral-200 hover:border-neutral-300"
                          } bg-white transition-all`}
                          title={it.productName}
                        >
                          <div className="relative w-19.5 h-19.5">
                            {thumb ? (
                              <Image src={thumb} alt={it.productName} fill className="object-contain" />
                            ) : (
                              <div className="w-full h-full bg-neutral-100" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Info panel */}
            <div className="w-1/2 bg-white flex items-center justify-center px-4">
              <div className="flex flex-col">
                <div className="flex flex-col gap-1 px-2">
                  <h1 className="text-4xl font-semibold w-42 text-black leading-snug">
                    {productName || packageTitle}
                  </h1>
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < 4 ? "text-yellow-400" : "text-neutral-300"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">4.8</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-sm text-red-600 font-medium">1,238 Sold</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <p className="text-3xl font-bold text-neutral-900">
                    {NGN.format(activePrice)}
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    Tax included. Shipping calculated at checkout.
                  </p>
                </div>

                {product && product.variants.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Select option:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <Link
                          key={v.id}
                          href={buildVariantHref(v)}
                          className={`px-3 py-1 text-xs rounded-full border transition ${
                            v.id === variantId
                              ? "border-red-600 text-red-600 font-semibold"
                              : "border-gray-300 text-gray-600 hover:border-gray-400"
                          }`}
                        >
                          {v.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ Add to Cart / Buy Now */}
                <div className="mt-6 flex items-center justify-between w-100 gap-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !activeVariant}
                    className="w-full rounded-lg border-2 border-neutral-900 bg-white text-neutral-900 py-2 px-2 text-sm font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? "Adding…" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={addingToCart || !activeVariant}
                    className="w-full rounded-lg bg-neutral-900 text-white py-2 px-6 text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12 border-b border-neutral-200">
            <div className="flex gap-8">
              {(["details", "reviews", "related"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? "border-red-600 text-neutral-900"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {tab === "details" ? "Product Detail" : tab === "reviews" ? "Reviews" : "Related Product"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "details" && (
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  {productName || packageTitle}
                </h2>

                {product?.description && (
                  <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                    {product.description}
                  </p>
                )}

                <div className="bg-neutral-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Specification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">SKU</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {activeVariant?.id?.slice(0, 8) ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">Category</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {headerData?.collection?.name ?? packageTitle}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">Product Name</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {activeVariant?.name ?? productName ?? "-"}
                      </span>
                    </div>
                    {activeVariant?.customFields?.packageCapacity && (
                      <div className="flex justify-between py-3 border-b border-neutral-200">
                        <span className="text-sm text-neutral-600">Capacity</span>
                        <span className="text-sm w-70 font-medium text-neutral-900">
                          {activeVariant.customFields.packageCapacity}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-3 border-b border-neutral-200">
                      <span className="text-sm text-neutral-600">Price</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {NGN.format(activePrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {activeVariant?.customFields?.packageComponents &&
                  activeVariant.customFields.packageComponents.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Package Components</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {activeVariant.customFields.packageComponents.map((comp) => (
                          <div key={comp.id} className="bg-[#EBEEF7] rounded-md p-4 flex flex-col items-center text-center">
                            {comp.featuredAsset?.preview && (
                              <div className="relative w-12 h-12 mb-2">
                                <Image src={comp.featuredAsset.preview} alt={comp.name} fill className="object-contain" />
                              </div>
                            )}
                            <p className="text-sm font-medium text-neutral-900">{comp.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-6">What&apos;s Included</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-16 h-16 mb-1">
                        <Image src={solarPanelImage} alt="Solar Panels" />
                      </div>
                      <p className="text-md font-semibold text-neutral-900">Solar Panels</p>
                    </div>
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-12 h-12 mb-3">
                        <Image src={hardwarelImage} alt="Mounting Hardware" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">Mounting Hardware</p>
                    </div>
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-12 h-12 mb-3">
                        <Image src={systemImage} alt="System Testing" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">System Testing</p>
                    </div>
                    <div className="bg-[#EBEEF7] rounded-md p-6">
                      <div className="w-12 h-12 mb-3">
                        <Image src={safetyImage} alt="Safety Inspections" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900">Safety Inspections</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                <div className="bg-neutral-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Reviews Filter</h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <button key={stars} className="flex items-center justify-between w-full text-sm hover:text-red-600 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(stars)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <span className="text-neutral-600">{[320, 180, 45, 12, 5][5 - stars]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border border-neutral-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-neutral-900">Excellent product! Really satisfied</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-neutral-200" />
                          <span className="font-medium">John Doe</span>
                        </div>
                        <span>•</span>
                        <span>{i === 0 ? "2 days ago" : i === 1 ? "1 week ago" : "2 weeks ago"}</span>
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
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Related Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {collectionItems.slice(0, 8).map((it) => {
                    const img = it.productAsset?.preview;
                    const price =
                      it.priceWithTax.__typename === "SinglePrice"
                        ? it.priceWithTax.value
                        : it.priceWithTax.min;

                    return (
                      <Link
                        key={it.productId}
                        href={`/installation/${collectionSlug}?productSlug=${it.slug}${collectionImgParam ? `&collectionImg=${encodeURIComponent(collectionImgParam)}` : ""}`}
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
                            <svg key={i} className={`w-3 h-3 ${i < 4 ? "text-yellow-400" : "text-neutral-300"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-neutral-900 mb-2 line-clamp-2">{it.productName}</p>
                        <p className="text-base font-bold text-neutral-900">{NGN.format(price / 100)}</p>
                      </Link>
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