"use client";

import React, { useState, useEffect } from "react";

type Category = {
  name: string;
  slug: string;
  brands: string[];
};

type SidebarProps = {
  selectedCategorySlug: string;
  onCategorySelect: (slug: string, brand?: string) => void;
  condition: string;
  setCondition: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  brand: string[];
  setBrand: (b: string[]) => void;
  categoriesFromApi: Category[];
  currency?: string; // default to USD
  minPrice: number;
  maxPrice: number;
   sort: string;
  setSort: React.Dispatch<React.SetStateAction<string>>;
};

const Sidebar: React.FC<SidebarProps> = ({
  selectedCategorySlug,
  onCategorySelect,
  brand,
  setBrand,
  condition,
  setCondition,
  priceRange,
  setPriceRange,
  categoriesFromApi = [],
  currency = "USD",
  minPrice,
  maxPrice,
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    setOpenCategory(openCategory === slug ? null : slug);
    onCategorySelect(slug);
  };

  const handleBrandToggle = (b: string) => {
    if (brand.includes(b)) {
      setBrand(brand.filter((br) => br !== b));
    } else {
      setBrand([...brand, b]);
    }
  };

  return (
    <aside className="w-64 p-4 border-r border-gray-200 space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold mb-2">Category</h3>
        <ul className="space-y-2">
          {categoriesFromApi.map((cat) => (
            <li key={cat.slug}>
              <div
                className="flex justify-between items-center cursor-pointer font-medium"
                onClick={() => toggleCategory(cat.slug)}
              >
                <span
                  className={`${
                    selectedCategorySlug === cat.slug ? "text-red-500" : ""
                  }`}
                >
                  {cat.name}
                </span>
                <span>{openCategory === cat.slug ? "−" : "+"}</span>
              </div>

              {/* Brand checkboxes */}
              {openCategory === cat.slug && cat.brands.length > 0 && (
                <div className="ml-4 mt-2 space-y-1">
                  {cat.brands.map((b) => (
                    <label
                      key={b}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={brand.includes(b)}
                        onChange={() => handleBrandToggle(b)}
                        className="accent-red-500"
                      />
                      {b}
                    </label>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Condition Section */}
      <div>
        <h3 className="font-bold mb-2">Conditions</h3>
        <div className="space-y-2">
          {["Any", "New", "Used"].map((c) => (
            <label
              key={c}
              className={`flex items-center gap-2 cursor-pointer ${
                condition === c ? "text-[#FF0000]" : ""
              }`}
            >
              <input
                type="radio"
                checked={condition === c}
                onChange={() => setCondition(c)}
                className={`accent-[#FF0000]`}
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div>
        <h3 className="font-bold mb-2">Prices</h3>
        <div className="flex gap-2 mb-3">
          <div className="flex items-center border rounded px-2 w-1/2">
            <input
              type="number"
              value={priceRange[0]}
              min={minPrice}
              max={priceRange[1]}
              onChange={(e) =>
                setPriceRange([+e.target.value, priceRange[1]])
              }
              className="w-full p-1 outline-none"
            />
            <span className="ml-1 text-gray-500 text-sm">{currency}</span>
          </div>
          <div className="flex items-center border rounded px-2 w-1/2">
            <input
              type="number"
              value={priceRange[1]}
              min={priceRange[0]}
              max={maxPrice}
              onChange={(e) =>
                setPriceRange([priceRange[0], +e.target.value])
              }
              className="w-full p-1 outline-none"
            />
            <span className="ml-1 text-gray-500 text-sm">{currency}</span>
          </div>
        </div>

        {/* Dual range slider */}
        <div className="relative w-full h-2 bg-gray-200 rounded">
          <div
            className="absolute h-2 bg-red-500 rounded"
            style={{
              left: `${
                ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100
              }%`,
              right: `${
                100 -
                ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100
              }%`,
            }}
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none accent-[#FF0000]"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none accent-[#FF0000]"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
