"use client";

import React from "react";

type Props = {
  selectedBrand: string[];
  onBrandChange: (brands: string[]) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
};

const Topbar: React.FC<Props> = ({
  sortOrder,
  onSortChange,
  selectedBrand,
  onBrandChange,
}) => {
  const brands = ["Coleman", "Jinko", "Colar", "C Worth"]; // real brands from facets

  const handleBrandClick = (brand: string) => {
    // If already selected, deselect it (revert to default "All")
    if (selectedBrand.includes(brand)) {
      onBrandChange([]);
    } else {
      // Single select — replace whatever was selected before
      onBrandChange([brand]);
    }
  };

  return (
    <div className="w-full bg-[#f5f5f5] px-4 sm:px-8 lg:px-16">
      {/* Header Section */}
      <div
        className="
          flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
          py-4
        "
      >
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-black">
          Our Products
        </h1>

        {/* Brand Filter (Scrollable on Mobile) */}
        <div
          className="
            flex gap-3
            overflow-x-auto
            pb-2
            md:pb-0
            md:overflow-visible
            scrollbar-hide
          "
        >
          {/* All button */}
          <button
            onClick={() => onBrandChange([])}
            className={`
              whitespace-nowrap
              px-4 sm:px-5
              py-2
              rounded-md
              text-xs sm:text-sm
              font-medium
              border
              transition-colors
              ${selectedBrand.length === 0
                ? "text-[#ff0000] border-0"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            All
          </button>

          {brands.map((brand) => {
            const isSelected = selectedBrand.includes(brand);

            return (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`
                  whitespace-nowrap
                  px-4 sm:px-5
                  py-2
                  rounded-md
                  text-xs sm:text-sm
                  font-medium
                  border
                  transition-colors
                  ${isSelected
                    ? "text-[#ff0000] border-0"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {brand}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 justify-between sm:justify-start">
          <span className="text-gray-700 text-sm font-medium whitespace-nowrap">
            Sort By:
          </span>

          <select
            className="
              border border-gray-300
              rounded
              px-3 sm:px-4
              py-2
              text-sm
              bg-white
              w-full sm:w-auto sm:min-w-40
              focus:outline-none
              focus:border-gray-400
            "
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="relevance">Relevant Products</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A–Z</option>
            <option value="nameDesc">Name: Z–A</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Topbar;