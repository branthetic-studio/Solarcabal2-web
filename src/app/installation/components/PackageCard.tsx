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
  /** Pass the actual collection/category slug from the parent (PackageList) */
  collectionSlug?: string;
}

const PackageCard: React.FC<Props> = ({ option, collectionSlug }) => {
  const fallbackSlug = option.title.replace(/\s+/g, "-").toLowerCase();
  const href = `/installation/${encodeURIComponent(
    collectionSlug || fallbackSlug
  )}`;

  return (
    <div className="bg-white p-6">
      <div className="package-header">
        {/* <div className="">
          <h3 className="text-sm">{option.title}</h3>
          <p className="bg-[#ff0000] text-white px-4 py-1 rounded-md text-sm w-full"><span className="text-xs">{option.features.join(", ")}</span> {option.price}</p>
        </div> */}

        {/* ✅ Use collection slug, not product/title slug */}

      </div>

      

      <div className="items">
        {option.items.map((item, i) => (
          <ItemCard key={i} item={item} />
        ))}
      </div>
      <button className="text-sm bg-[#000000] text-white py-3 rounded-lg w-full mt-6">
        <Link href={href} >
          View
        </Link>
      </button>

    </div>
  );
};

export default PackageCard;
