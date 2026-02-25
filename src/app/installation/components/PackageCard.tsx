"use client";

import React from "react";
import ItemCard from "./ItemCard";
import Link from "next/link";

interface Item {
  name: string;
  desc: string;
  img: string;
}

interface PackageOption {
  title: string;
  price: string;
  features: string[];
  items: Item[];
}

interface Props {
  option: PackageOption;
  collectionSlug?: string;
  variantId?: string;
  productSlug?: string;
  collectionImg?: string; // ← add here
}

const PackageCard: React.FC<Props> = ({ option, collectionSlug, variantId, productSlug, collectionImg }) => {
  const fallbackSlug = option.title.replace(/\s+/g, "-").toLowerCase();
  const slug = collectionSlug || fallbackSlug;

  const params = new URLSearchParams();
  if (productSlug) params.set("productSlug", productSlug);
  if (variantId) params.set("variantId", variantId);
  const href = `/installation/${encodeURIComponent(slug)}${params.toString() ? `?${params.toString()}` : ""}`;

  return (
    <div className="bg-white p-2 md:p-4 rounded-lg border border-[#f0f0f0]">
      {/* Product image */}
      <div className="items">
        {option.items.map((item, i) => (
          <ItemCard key={i} item={item} collectionImg={collectionImg} /> // ← pass it here
        ))}
      </div>

      {/* Name and price shown under image */}
      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-gray-600 line-clamp-2 leading-snug">
          {option.title}
        </p>
        <p className="text-sm font-bold mt-1">{option.price}</p>
      </div>

      <button className="text-sm bg-[#000000] text-white py-3 rounded-lg w-full mt-4">
        <Link href={href}>
          View
        </Link>
      </button>
    </div>
  );
};

export default PackageCard;