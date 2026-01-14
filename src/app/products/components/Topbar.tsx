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
  const brands = ["All", "Jinko", "JA", "Longi", "Exulted"];

  const handleBrandClick = (brand: string) => {
    if (brand === "All") {
      // Reset to only "All"
      onBrandChange([]);
    } else {
      if (selectedBrand.includes(brand)) {
        // Remove brand
        onBrandChange(selectedBrand.filter((b) => b !== brand));
      } else {
        // Add brand
        onBrandChange([...selectedBrand, brand]);
      }
    }
  };

  return (
    <div className="w-full bg-[#f5f5f5] px-16">
      {/* Header Section */}
      <div className="flex justify-between items-center py-4 px-0">
        <h1 className="text-2xl font-bold text-black mb-1">Solar Panel</h1>


        {/* Brand filter */}
        <div className="flex gap-8 pb-4">
          {brands.map((brand) => {
            const isSelected =
              brand === "All"
                ? selectedBrand.length === 0
                : selectedBrand.includes(brand);

            return (
              <button
                key={brand}
                onClick={() => handleBrandClick(brand)}
                className={`px-6 py-3 rounded-md text-sm font-medium border transition-colors ${isSelected
                  ? "bg-none border-none text-black"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {brand}
              </button>
            );
          })}
        </div>


        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-sm font-medium">Sort By:</span>
          <select
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white min-w-[160px] focus:outline-none focus:border-gray-400"
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
