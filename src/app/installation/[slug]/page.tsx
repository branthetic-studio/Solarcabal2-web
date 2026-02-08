"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import Suscribe from "@/Components/Suscribe/Suscribe";
import InstallProduct from "../components/PackageList";
import solarPanelImage from "../../../Assets/sunvec (1).png";
import hardwarelImage from "../../../Assets/Vector (1).png";
import systemImage from "../../../Assets/Vector (2).png";
import safetyImage from "../../../Assets/Vector (3).png";
import "../Installation.css";
import AddressModal from "@/Components/AddressModal";

// If you already have a query in queries.ts, you can delete this and import yours.
// This returns products in a collection/category by slug.
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

  const { data, loading, error } = useQuery<GetCollectionProductsResponse>(
    GET_COLLECTION_PRODUCTS,
    { variables: { slug, skip, take }, skip: !slug }
  );

  const items = data?.search.items ?? [];

  // Derive a display title from the slug (e.g., "3kva-package" -> "3KVA package")
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

  // Compute an estimated “starting total” (sum of min prices) just to mirror the UI
  const estimatedTotalNGN = useMemo(() => {
    const sum = items.reduce((acc, it) => {
      const p = it.priceWithTax;
      if (p.__typename === "SinglePrice") return acc + p.value;
      return acc + p.min; // PriceRange → take minimum as “from”
    }, 0);
    return NGN.format(sum / 100);
  }, [items]);

  // Left list rows
  const renderRow = (it: SearchItem) => {
    const price =
      it.priceWithTax.__typename === "SinglePrice"
        ? it.priceWithTax.value
        : it.priceWithTax.min;

    const img =
      it.productAsset?.preview ??
      "https://via.placeholder.com/160x160.png?text=No+Image";

    return (
      <div
        key={it.productId}
        className="flex items-center gap-4 py-4 border-b border-neutral-200"
      >
        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={it.productName}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900">
            {it.productName}
          </p>
          <p className="text-xs text-neutral-500">/{it.slug}</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-neutral-900">
            {NGN.format(price / 100)}
          </p>
          <button
            onClick={() => router.push(`/products/${it.slug}`)}
            className="mt-1 inline-flex items-center rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50"
          >
            View
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="h-40 rounded-2xl bg-neutral-200 animate-pulse" />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 border-b border-neutral-200 last:border-0 animate-pulse"
                />
              ))}
            </div>
            <aside className="rounded-2xl bg-white p-6 shadow-sm h-64 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-sm text-red-600">
            Failed to load products for “{packageTitle}”
          </p>
        </div>
      </main>
    );
  }


  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50">
        {/* Hero banner */}
        <section className="mx-auto max-w-6xl px-4 pt-6">
          <div className="relative overflow-hidden rounded-2xl bg-[url('/assets/installation-hero.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative p-6 md:p-10">
              <div className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 backdrop-blur">
                {items.length} Products
              </div>

              <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-white">
                {packageTitle}
              </h1>

              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-lg bg-red-600 px-3 py-1 text-white text-sm font-semibold">
                  {estimatedTotalNGN}
                </span>
                <span className="text-white/90 text-sm">
                  Appliances: AC, Washing Machine, Fan, TV, Sats
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left: products list */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-6 shadow-sm">
              {items.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No products found in this package yet.
                </div>
              ) : (
                <div>{items.map(renderRow)}</div>
              )}
            </div>

            {/* Right: summary / selector */}
            <aside className="lg:sticky lg:top-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                {/* Delivery Location */}
                <div className="mb-6">
                  <div className="flex flex-col gap-2 mb-2">
                    <AddressModal
                      trigger={
                        <button className="cursor-pointer">
                          <Image src="/edit-rectangle.png" alt="Location" width={20} height={20} className="fill" />
                        </button>
                      }
                      onSubmit={handleSubmit}
                    />

                    <p className="text-sm font-semibold text-neutral-800">Delivery Location</p>
                  </div>
                  <p className="text-sm font-medium">Home Address</p>
                  <p className="text-xs text-neutral-500">+234 85 678 4321</p>
                  <p className="text-xs text-neutral-500">
                    Adeola Odeku St, Victoria Island, Lagos
                  </p>
                </div>



                {/* Payment Methods */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-neutral-800 mb-1">Payment Method</p>
                  <p className="text-xs text-neutral-500 mb-2">List of all credit cards you saved</p>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center w-8 h-8 rounded border">
                      <span className="text-xs font-bold">+</span>
                    </button>
                    <img src="/icons/mastercard.png" className="w-8 h-8" />
                    <img src="/icons/paypal.png" className="w-8 h-8" />
                    <img src="/icons/applepay.png" className="w-8 h-8" />
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-neutral-800 mb-3">Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-xs text-[#808D9E]">
                      <span className="">Sub total products</span>
                      <span className="font-medium ">₦201,100</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#808D9E]">
                      <span className="">Delivery fee</span>
                      <span className="font-medium ">₦1,100</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#808D9E]">
                      <span className="">Tax</span>
                      <span className="font-medium ">₦249</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t font-semibold text-neutral-900">
                      <span>Total</span>
                      <span>₦202,349</span>
                    </div>
                  </div>
                  <button className="mt-5 w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:opacity-95" onClick={() => router.push("/checkout")} > Checkout </button>
                </div>

                {/* Delivery & Products */}
                <div className="space-y-4 text-sm text-neutral-700">
                  <h3>Delivery & Products</h3>
                  <div className="flex items-start gap-3">
                    <Image src="/truck.png" alt="Warranty" width={20} height={20} className="fill mt-1" />
                    <div>
                      <p className="text-sm">Delivery</p>
                      <p className="text-xs text-neutral-500">Estimated delivery time 1-9 business days</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Image src="/repeat.png" alt="Warranty" width={20} height={20} className="fill mt-1" />
                    <div>
                      <p className="text-sm">Return Policy</p>
                      <p className="text-xs text-neutral-500">Guaranteed 7-Day Return Policy</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Image src="/shield.png" alt="Warranty" width={20} height={20} className="fill mt-1" />
                    <div>
                      <p className="text-sm">Warranty</p>
                      <p className="text-xs text-neutral-500">Warranty information unavailable for this item.</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </section>

        {/* What's included */}
        <div className="installation-info">
          <h3>What&apos;s Included</h3>
          <div className="included-items">
            <div className="item">
              <Image src={solarPanelImage} alt="" />
              <h4>Solar Panels</h4>
            </div>
            <div className="item">
              <Image src={hardwarelImage} alt="" />
              <h4>Mounting Hardware</h4>
            </div>
            <div className="item">
              <Image src={systemImage} alt="" />
              <h4>System Testing</h4>
            </div>
            <div className="item">
              <Image src={safetyImage} alt="" />
              <h4>Safety Inspections</h4>
            </div>
          </div>
        </div>

        {/* CTA */}
        {/* <section className="bg-neutral-900">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14 text-center">
            <h2 className="text-white text-xl md:text-2xl font-semibold">
              Ready to Go Solar?
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout
              </button>
              <button
                className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-neutral-800"
                onClick={() => router.push("/contact")}
              >
                Contact Installer
              </button>
            </div>
          </div>
        </section> */}
{/* test */}
        <Suscribe />

        {/* Footer space handled by your global layout/footer */}
      </main>
      <Footer />
    </>
  );
}