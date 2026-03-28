"use client";

import React, { useState, useRef, useCallback, Dispatch, SetStateAction } from "react";
import {
  Search,
  PackageSearch,
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

// ─── Dual Range Slider ────────────────────────────────────────────────────────
type DualRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
};

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  currency = "NGN",
}) => {
  const rangeRef = useRef<HTMLDivElement>(null);

  const clamp = (val: number, lo: number, hi: number) =>
    Math.min(Math.max(val, lo), hi);

  // Convert a pixel offset inside the track → a value in [min, max]
  const pxToVal = useCallback(
    (px: number): number => {
      const track = rangeRef.current;
      if (!track) return min;
      const { left, width } = track.getBoundingClientRect();
      const ratio = clamp((px - left) / width, 0, 1);
      return Math.round(min + ratio * (max - min));
    },
    [min, max]
  );

  // Percentage helpers for the filled track
  const leftPct = ((value[0] - min) / (max - min)) * 100;
  const rightPct = 100 - ((value[1] - min) / (max - min)) * 100;

  // ── pointer-based drag for min thumb ──
  const startDragMin = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const newMin = clamp(pxToVal(ev.clientX), min, value[1] - 1);
      onChange([newMin, value[1]]);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // ── pointer-based drag for max thumb ──
  const startDragMax = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const newMax = clamp(pxToVal(ev.clientX), value[0] + 1, max);
      onChange([value[0], newMax]);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // ── number input handlers ──
  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clamp(+e.target.value, min, value[1] - 1);
    onChange([v, value[1]]);
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clamp(+e.target.value, value[0] + 1, max);
    onChange([value[0], v]);
  };

  return (
    <div className="space-y-4">
      {/* Number inputs */}
      <div className="flex gap-2">
        <div className="flex items-center border border-neutral-300 rounded px-2 w-1/2 focus-within:border-red-500 transition-colors">
          <input
            type="number"
            value={value[0]}
            min={min}
            max={value[1] - 1}
            onChange={handleMinInput}
            className="w-full py-1.5 outline-none text-sm text-neutral-700"
          />
          <span className="ml-1 text-neutral-400 text-xs shrink-0">{currency}</span>
        </div>

        <div className="flex items-center border border-neutral-300 rounded px-2 w-1/2 focus-within:border-red-500 transition-colors">
          <input
            type="number"
            value={value[1]}
            min={value[0] + 1}
            max={max}
            onChange={handleMaxInput}
            className="w-full py-1.5 outline-none text-sm text-neutral-700"
          />
          <span className="ml-1 text-neutral-400 text-xs shrink-0">{currency}</span>
        </div>
      </div>

      {/* Visual track */}
      <div className="relative h-5 flex items-center" ref={rangeRef}>
        {/* Grey base track */}
        <div className="absolute inset-x-0 h-1.5 bg-neutral-200 rounded-full" />

        {/* Red filled region */}
        <div
          className="absolute h-1.5 bg-red-500 rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />

        {/* Min thumb */}
        <div
          role="slider"
          aria-valuenow={value[0]}
          aria-valuemin={min}
          aria-valuemax={value[1]}
          onPointerDown={startDragMin}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-red-500 shadow cursor-grab active:cursor-grabbing touch-none z-20 -translate-x-1/2"
          style={{ left: `${leftPct}%` }}
        />

        {/* Max thumb */}
        <div
          role="slider"
          aria-valuenow={value[1]}
          aria-valuemin={value[0]}
          aria-valuemax={max}
          onPointerDown={startDragMax}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-red-500 shadow cursor-grab active:cursor-grabbing touch-none z-20 -translate-x-1/2"
          style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{min.toLocaleString()} {currency}</span>
        <span>{max.toLocaleString()} {currency}</span>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
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
  const [isOpen, setIsOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const toggleCategory = (slug: string) => {
    setOpenCategory(openCategory === slug ? null : slug);
    onCategorySelect(slug);
  };

  const handleBrandToggle = (b: string) => {
    setBrand(brand.includes(b) ? brand.filter((br) => br !== b) : [...brand, b]);
  };

  const filteredCategories = categoriesFromApi.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <aside className="w-full md:w-64 border-r border-neutral-200 bg-white">
      {/* Mobile toggle */}
      <div className="flex items-center justify-between p-4 md:hidden border-b border-neutral-200">
        <h3 className="text-sm font-bold text-neutral-800">Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-neutral-700"
          aria-label="Toggle filters"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Content */}
      <div
        className={`
          ${isOpen ? "block" : "hidden"}
          md:block
          p-4
          space-y-6
        `}
      >
        {/* Category header */}
        <h3 className="text-xs font-bold text-neutral-800 tracking-widest uppercase hidden md:block">
          Category
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search for categories"
            className="w-full rounded-full border border-neutral-300 py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Category list */}
        <ul className="space-y-1">
          {filteredCategories.map((cat) => (
            <li key={cat.slug} className="border-b border-neutral-100 pb-2">
              <div
                className="flex items-center justify-between cursor-pointer py-1.5 rounded-md px-1 hover:bg-neutral-50 transition-colors"
                onClick={() => toggleCategory(cat.slug)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      selectedCategorySlug === cat.slug
                        ? "text-red-600"
                        : "text-neutral-500"
                    }
                  >
                    {cat.icon ?? <PackageSearch size={16} />}
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
                <span className="text-neutral-400">
                  {openCategory === cat.slug ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </div>

              {/* Brand checkboxes */}
              {openCategory === cat.slug && cat.brands.length > 0 && (
                <div className="mt-2 ml-6 space-y-2 pb-1">
                  {cat.brands.map((b) => (
                    <label
                      key={b}
                      className="flex items-center gap-2 text-sm cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={brand.includes(b)}
                        onChange={() => handleBrandToggle(b)}
                        className="h-3.5 w-3.5 accent-red-600 cursor-pointer"
                      />
                      <span className="text-neutral-600 group-hover:text-neutral-900 transition-colors">
                        {b}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </li>
          ))}

          {filteredCategories.length === 0 && (
            <li className="text-sm text-neutral-400 py-2 text-center">
              No categories found
            </li>
          )}
        </ul>

        {/* Divider */}
        <div className="border-t border-neutral-100" />

        {/* Price filter */}
        <div>
          <h3 className="text-xs font-bold text-neutral-800 tracking-widest uppercase mb-4">
            Price Range
          </h3>
          <DualRangeSlider
            min={minPrice}
            max={maxPrice}
            value={priceRange}
            onChange={setPriceRange}
            currency={currency}
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;