"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import {
  Search,
  PanelsTopLeft,
  Battery,
  Gauge,
  Cable,
  Wrench,
  Bolt,
  Fan,
  CableCar,
  PackageSearch,
  Circle,
  Minus,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type Category = {
  name: string;
  slug: string;
  brands: string[];
  icon?: React.ReactNode;
};

type SidebarProps = {
  selectedCategorySlug: string;
  onCategorySelect: (slug: string, brand?: string) => void;
  condition: string;
  setCondition: Dispatch<SetStateAction<string>>;
  priceRange: [number, number];
  setPriceRange: Dispatch<SetStateAction<[number, number]>>;
  brand: string[];
  setBrand: Dispatch<SetStateAction<string[]>>;
  sort: string;
  setSort: Dispatch<SetStateAction<string>>;
  categoriesFromApi: Category[];
  currency?: string;
  minPrice: number;
  maxPrice: number;
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
  currency = "NGN",
  minPrice,
  maxPrice,
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // ✅ NEW: Mobile dropdown state
  const [isOpen, setIsOpen] = useState(false);

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
    <aside className="w-full md:w-64 border-r border-neutral-200 bg-white">

      {/* ✅ MOBILE TOGGLE BUTTON */}
      <div className="flex items-center justify-between p-4 md:hidden border-b">
        <h3 className="text-sm font-bold text-neutral-800">Category</h3>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm font-medium text-neutral-700"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* ✅ DROPDOWN CONTENT */}
      <div
        className={`
          ${isOpen ? "block" : "hidden"}
          md:block
          w-64
          p-4
          space-y-6
        `}
      >
        {/* CATEGORY Header */}
        <h3 className="text-md font-bold hidden md:block text-neutral-800 tracking-wide">
          CATEGORY
        </h3>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search for categories"
            className="w-full rounded-full border border-neutral-300 py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* CATEGORY LIST */}
        <ul className="mt-3 space-y-4">
          {categoriesFromApi.map((cat) => (
            <li key={cat.slug} className="border-b border-[#f5f5f5] pb-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategory(cat.slug)}
              >
                {/* Icon + Label */}
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      selectedCategorySlug === cat.slug
                        ? "text-red-600"
                        : "text-neutral-600"
                    }`}
                  >
                    {cat.icon ?? <PackageSearch size={18} />}
                  </span>

                  <span
                    className={`text-sm font-medium ${
                      selectedCategorySlug === cat.slug
                        ? "text-red-600"
                        : "text-neutral-700"
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>

                {/* Toggle Symbol */}
                <span className="text-neutral-600">
                  {openCategory === cat.slug ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </div>

              {/* BRAND OPTIONS */}
              {openCategory === cat.slug && cat.brands.length > 0 && (
                <div className="mt-3 ml-7 space-y-2">
                  {cat.brands.map((b) => (
                    <label
                      key={b}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={brand.includes(b)}
                        onChange={() => handleBrandToggle(b)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-neutral-700">{b}</span>
                    </label>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* PRICE HEADER */}
        <h3 className="text-xs font-bold text-neutral-800 tracking-wide">
          PRICES
        </h3>

        {/* Price Inputs */}
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
              className="w-full p-1 outline-none text-sm"
            />
            <span className="ml-1 text-neutral-400 text-xs">
              {currency}
            </span>
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
              className="w-full p-1 outline-none text-sm"
            />
            <span className="ml-1 text-neutral-400 text-xs">
              {currency}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative w-full h-2 bg-neutral-200 rounded">
          <div
            className="absolute h-2 bg-red-500 rounded"
            style={{
              left: `${
                ((priceRange[0] - minPrice) /
                  (maxPrice - minPrice)) *
                100
              }%`,
              right: `${
                100 -
                ((priceRange[1] - minPrice) /
                  (maxPrice - minPrice)) *
                  100
              }%`,
            }}
          />

          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([+e.target.value, priceRange[1]])
            }
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none accent-red-600"
          />

          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], +e.target.value])
            }
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none accent-red-600"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
