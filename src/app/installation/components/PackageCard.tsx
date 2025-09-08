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
    <div className="package-card">
      <div className="package-header">
        <div className="package-name">
          <h3>{option.title}</h3>
          <span className="price">{option.price}</span>
        </div>

        {/* ✅ Use collection slug, not product/title slug */}
        <Link href={href} className="view-all">
          View All
        </Link>
      </div>

      <p>{option.features.join(", ")}</p>

      <div className="items">
        {option.items.map((item, i) => (
          <ItemCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
};

export default PackageCard;
