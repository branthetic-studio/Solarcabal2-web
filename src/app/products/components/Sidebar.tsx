
// "use client";

// import React, {
//   useState,
//   useRef,
//   useCallback,
//   useEffect,
//   Dispatch,
//   SetStateAction,
// } from "react";
// import {
//   Search,
//   PackageSearch,
//   ChevronUp,
//   ChevronDown,
//   SlidersHorizontal,
//   X,
// } from "lucide-react";

// type Category = {
//   name: string;
//   slug: string;
//   brands: string[];
//   image?: string | null;
//   icon?: React.ReactNode;
// };

// type SidebarProps = {
//   selectedCategorySlug: string;
//   onCategorySelect: (slug: string, brand?: string) => void;
//   condition: string;
//   setCondition: Dispatch<SetStateAction<string>>;
//   priceRange: [number, number];
//   setPriceRange: Dispatch<SetStateAction<[number, number]>>;
//   brand: string[];
//   setBrand: Dispatch<SetStateAction<string[]>>;
//   categoriesFromApi: Category[];
//   currency?: string;
//   minPrice: number;
//   maxPrice: number;
//   priceStep?: number;
// };

// /* ─── Category icon (collection featuredAsset, with PackageSearch fallback) ─── */
// function CategoryIcon({
//   image,
//   active,
//   size = 16,
// }: {
//   image?: string | null;
//   active?: boolean;
//   size?: number;
// }) {
//   if (image) {
//     // eslint-disable-next-line @next/next/no-img-element
//     return (
//       <img
//         src={image}
//         alt=""
//         className="object-contain"
//         style={{ width: size, height: size }}
//       />
//     );
//   }
//   return (
//     <PackageSearch
//       size={size}
//       className={active ? "text-red-600" : "text-neutral-500"}
//     />
//   );
// }

// // ─── Dual Range Slider ──────────────────────────────────────────────────────
// type DualRangeSliderProps = {
//   min: number;
//   max: number;
//   step?: number;
//   value: [number, number];
//   onChange: (value: [number, number]) => void;
//   currency?: string;
// };

// const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
//   min,
//   max,
//   step = 5000,
//   value,
//   onChange,
//   currency = "NGN",
// }) => {
//   const rangeRef = useRef<HTMLDivElement>(null);

//   const [minInput, setMinInput] = useState(String(value[0]));
//   const [maxInput, setMaxInput] = useState(String(value[1]));

//   useEffect(() => {
//     setMinInput(String(value[0]));
//   }, [value[0]]);

//   useEffect(() => {
//     setMaxInput(String(value[1]));
//   }, [value[1]]);

//   const clamp = (val: number, lo: number, hi: number) =>
//     Math.min(Math.max(val, lo), hi);

//   const snapToStep = useCallback(
//     (val: number): number => Math.round(val / step) * step,
//     [step]
//   );

//   const pxToVal = useCallback(
//     (px: number): number => {
//       const track = rangeRef.current;
//       if (!track) return min;
//       const { left, width } = track.getBoundingClientRect();
//       const ratio = clamp((px - left) / width, 0, 1);
//       const raw = min + ratio * (max - min);
//       return snapToStep(raw);
//     },
//     [min, max, snapToStep]
//   );

//   const leftPct = ((value[0] - min) / (max - min)) * 100;
//   const rightPct = 100 - ((value[1] - min) / (max - min)) * 100;

//   const startDragMin = (e: React.PointerEvent) => {
//     e.preventDefault();
//     e.currentTarget.setPointerCapture(e.pointerId);
//     const move = (ev: PointerEvent) => {
//       const newMin = clamp(pxToVal(ev.clientX), min, value[1] - step);
//       onChange([newMin, value[1]]);
//     };
//     const up = () => {
//       window.removeEventListener("pointermove", move);
//       window.removeEventListener("pointerup", up);
//     };
//     window.addEventListener("pointermove", move);
//     window.addEventListener("pointerup", up);
//   };

//   const startDragMax = (e: React.PointerEvent) => {
//     e.preventDefault();
//     e.currentTarget.setPointerCapture(e.pointerId);
//     const move = (ev: PointerEvent) => {
//       const newMax = clamp(pxToVal(ev.clientX), value[0] + step, max);
//       onChange([value[0], newMax]);
//     };
//     const up = () => {
//       window.removeEventListener("pointermove", move);
//       window.removeEventListener("pointerup", up);
//     };
//     window.addEventListener("pointermove", move);
//     window.addEventListener("pointerup", up);
//   };

//   const commitMin = () => {
//     const parsed = parseInt(minInput.replace(/[^0-9]/g, ""), 10);
//     if (isNaN(parsed)) {
//       setMinInput(String(value[0]));
//       return;
//     }
//     const snapped = clamp(snapToStep(parsed), min, value[1] - step);
//     setMinInput(String(snapped));
//     onChange([snapped, value[1]]);
//   };

//   const commitMax = () => {
//     const parsed = parseInt(maxInput.replace(/[^0-9]/g, ""), 10);
//     if (isNaN(parsed)) {
//       setMaxInput(String(value[1]));
//       return;
//     }
//     const snapped = clamp(snapToStep(parsed), value[0] + step, max);
//     setMaxInput(String(snapped));
//     onChange([value[0], snapped]);
//   };

//   const handleMinKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") commitMin();
//   };
//   const handleMaxKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") commitMax();
//   };

//   const formatLabel = (val: number): string => {
//     if (val >= 1_000_000)
//       return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
//     if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
//     return val.toLocaleString();
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2">
//         <div className="flex flex-col gap-1 w-1/2">
//           <label className="text-xs text-neutral-400">Min</label>
//           <div className="flex items-center border border-neutral-300 rounded px-2 focus-within:border-red-500 transition-colors">
//             <input
//               type="text"
//               inputMode="numeric"
//               value={minInput}
//               onChange={(e) => setMinInput(e.target.value)}
//               onBlur={commitMin}
//               onKeyDown={handleMinKeyDown}
//               className="w-full py-1.5 outline-none text-sm text-neutral-700 bg-transparent"
//             />
//             <span className="ml-1 text-neutral-400 text-xs shrink-0">
//               {currency}
//             </span>
//           </div>
//         </div>

//         <div className="flex flex-col gap-1 w-1/2">
//           <label className="text-xs text-neutral-400">Max</label>
//           <div className="flex items-center border border-neutral-300 rounded px-2 focus-within:border-red-500 transition-colors">
//             <input
//               type="text"
//               inputMode="numeric"
//               value={maxInput}
//               onChange={(e) => setMaxInput(e.target.value)}
//               onBlur={commitMax}
//               onKeyDown={handleMaxKeyDown}
//               className="w-full py-1.5 outline-none text-sm text-neutral-700 bg-transparent"
//             />
//             <span className="ml-1 text-neutral-400 text-xs shrink-0">
//               {currency}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="relative h-6 flex items-center select-none" ref={rangeRef}>
//         <div className="absolute inset-x-0 h-1.5 bg-neutral-200 rounded-full" />
//         <div
//           className="absolute h-1.5 bg-red-500 rounded-full pointer-events-none"
//           style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
//         />
//         <div
//           role="slider"
//           aria-label="Minimum price"
//           aria-valuenow={value[0]}
//           aria-valuemin={min}
//           aria-valuemax={value[1]}
//           onPointerDown={startDragMin}
//           className="absolute w-5 h-5 rounded-full bg-white border-2 border-red-500 shadow-md cursor-grab active:cursor-grabbing touch-none z-20 -translate-x-1/2 hover:scale-110 transition-transform"
//           style={{ left: `${leftPct}%` }}
//         />
//         <div
//           role="slider"
//           aria-label="Maximum price"
//           aria-valuenow={value[1]}
//           aria-valuemin={value[0]}
//           aria-valuemax={max}
//           onPointerDown={startDragMax}
//           className="absolute w-5 h-5 rounded-full bg-white border-2 border-red-500 shadow-md cursor-grab active:cursor-grabbing touch-none z-20 -translate-x-1/2 hover:scale-110 transition-transform"
//           style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
//         />
//       </div>

//       <div className="flex justify-between text-xs text-neutral-400">
//         <span>₦{formatLabel(min)}</span>
//         <span>₦{formatLabel(max)}</span>
//       </div>

//       <div className="text-xs text-center text-neutral-500 bg-neutral-50 rounded-lg py-1.5">
//         ₦{formatLabel(value[0])} &nbsp;–&nbsp; ₦{formatLabel(value[1])}
//       </div>
//     </div>
//   );
// };

// // ─── Sidebar ─────────────────────────────────────────────────────────────────
// const Sidebar: React.FC<SidebarProps> = ({
//   selectedCategorySlug,
//   onCategorySelect,
//   brand,
//   setBrand,
//   priceRange,
//   setPriceRange,
//   categoriesFromApi = [],
//   currency = "NGN",
//   minPrice,
//   maxPrice,
//   priceStep = 10_000,
// }) => {
//   const [openCategory, setOpenCategory] = useState<string | null>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [categorySearch, setCategorySearch] = useState("");
//   const [priceModalOpen, setPriceModalOpen] = useState(false);

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const [localPriceRange, setLocalPriceRange] =
//     useState<[number, number]>(priceRange);

//   useEffect(() => {
//     setLocalPriceRange(priceRange);
//   }, [priceRange]);

//   const handlePriceChange = (newRange: [number, number]) => {
//     setLocalPriceRange(newRange);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => {
//       setPriceRange(newRange);
//     }, 300);
//   };

//   const toggleCategory = (slug: string) => {
//     setOpenCategory(openCategory === slug ? null : slug);
//     onCategorySelect(slug);
//   };

//   const handleBrandToggle = (b: string) => {
//     setBrand(brand.includes(b) ? brand.filter((br) => br !== b) : [...brand, b]);
//   };

//   const filteredCategories = categoriesFromApi.filter((cat) =>
//     cat.name.toLowerCase().includes(categorySearch.toLowerCase())
//   );

//   return (
//     <>
//       {/* ════════ MOBILE: vertical icon rail ════════ */}
//       <div className="lg:hidden">
//         <div className="flex flex-col items-center gap-5 py-4">
//           {categoriesFromApi.map((cat) => {
//             const active = selectedCategorySlug === cat.slug;
//             return (
//               <button
//                 key={cat.slug}
//                 onClick={() => onCategorySelect(cat.slug)}
//                 className="flex flex-col items-center gap-1.5 w-[72px]"
//                 aria-label={cat.name}
//                 aria-pressed={active}
//               >
//                 <span
//                   className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
//                     active
//                       ? "bg-red-50 border-red-200"
//                       : "bg-neutral-100 border-transparent"
//                   }`}
//                 >
//                   <CategoryIcon image={cat.image} active={active} size={28} />
//                 </span>
//                 <span
//                   className={`text-[11px] leading-tight text-center ${
//                     active ? "text-red-600 font-semibold" : "text-neutral-600"
//                   }`}
//                 >
//                   {cat.name}
//                 </span>
//               </button>
//             );
//           })}
//         </div>

//         {/* Mobile filter trigger → opens price modal */}
//         <button
//           onClick={() => setPriceModalOpen(true)}
//           className="mx-auto mb-4 flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700"
//         >
//           <SlidersHorizontal className="h-4 w-4" />
//           Price filter
//         </button>
//       </div>

//       {/* ════════ DESKTOP: full sidebar ════════ */}
//       <aside className="hidden lg:block w-full md:w-64 border-r border-neutral-200 bg-white">
//         <div className="block p-4 space-y-6">
//           <h3 className="text-xs font-bold text-neutral-800 tracking-widest uppercase">
//             Category
//           </h3>

//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
//             <input
//               type="text"
//               value={categorySearch}
//               onChange={(e) => setCategorySearch(e.target.value)}
//               placeholder="Search for categories"
//               className="w-full rounded-full border border-neutral-300 py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-red-500 transition-colors"
//             />
//           </div>

//           {/* Category list */}
//           <ul className="space-y-1">
//             {filteredCategories.map((cat) => (
//               <li key={cat.slug} className="border-b border-neutral-100 pb-2">
//                 <div
//                   className="flex items-center justify-between cursor-pointer py-1.5 rounded-md px-1 hover:bg-neutral-50 transition-colors"
//                   onClick={() => toggleCategory(cat.slug)}
//                 >
//                   <div className="flex items-center gap-2">
//                     <span
//                       className={
//                         selectedCategorySlug === cat.slug
//                           ? "text-red-600"
//                           : "text-neutral-500"
//                       }
//                     >
//                       <CategoryIcon
//                         image={cat.image}
//                         active={selectedCategorySlug === cat.slug}
//                         size={16}
//                       />
//                     </span>
//                     <span
//                       className={`text-sm font-medium ${
//                         selectedCategorySlug === cat.slug
//                           ? "text-red-600"
//                           : "text-neutral-700"
//                       }`}
//                     >
//                       {cat.name}
//                     </span>
//                   </div>
//                   <span className="text-neutral-400">
//                     {openCategory === cat.slug ? (
//                       <ChevronUp className="h-3.5 w-3.5" />
//                     ) : (
//                       <ChevronDown className="h-3.5 w-3.5" />
//                     )}
//                   </span>
//                 </div>

//                 {openCategory === cat.slug && cat.brands.length > 0 && (
//                   <div className="mt-2 ml-6 space-y-2 pb-1">
//                     {cat.brands.map((b) => (
//                       <label
//                         key={b}
//                         className="flex items-center gap-2 text-sm cursor-pointer group"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={brand.includes(b)}
//                           onChange={() => handleBrandToggle(b)}
//                           className="h-3.5 w-3.5 accent-red-600 cursor-pointer"
//                         />
//                         <span className="text-neutral-600 group-hover:text-neutral-900 transition-colors">
//                           {b}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </li>
//             ))}

//             {filteredCategories.length === 0 && (
//               <li className="text-sm text-neutral-400 py-2 text-center">
//                 No categories found
//               </li>
//             )}
//           </ul>

//           <div className="border-t border-neutral-100" />

//           {/* Price filter (desktop inline) */}
//           <div>
//             <h3 className="text-xs font-bold text-neutral-800 tracking-widest uppercase mb-4">
//               Price Range
//             </h3>
//             <DualRangeSlider
//               min={minPrice}
//               max={maxPrice}
//               step={priceStep}
//               value={localPriceRange}
//               onChange={handlePriceChange}
//               currency={currency}
//             />
//           </div>
//         </div>
//       </aside>

//       {/* ════════ MOBILE PRICE MODAL ════════ */}
//       {priceModalOpen && (
//         <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/50"
//             onClick={() => setPriceModalOpen(false)}
//           />
//           <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 z-10">
//             <div className="flex items-center justify-between mb-5">
//               <h3 className="text-base font-bold text-neutral-800">
//                 Price Range
//               </h3>
//               <button
//                 onClick={() => setPriceModalOpen(false)}
//                 aria-label="Close price filter"
//                 className="text-neutral-500"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <DualRangeSlider
//               min={minPrice}
//               max={maxPrice}
//               step={priceStep}
//               value={localPriceRange}
//               onChange={handlePriceChange}
//               currency={currency}
//             />

//             <button
//               onClick={() => setPriceModalOpen(false)}
//               className="mt-6 w-full bg-red-600 text-white rounded-full py-3 text-sm font-semibold hover:bg-red-700 transition-colors"
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Sidebar;



"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import {
  Search,
  PackageSearch,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

type Category = {
  name: string;
  slug: string;
  brands: string[];
  image?: string | null;
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
  categoriesFromApi: Category[];
  currency?: string;
  minPrice: number;
  maxPrice: number;
  priceStep?: number;
};

/* ─── Category icon (collection featuredAsset, with PackageSearch fallback) ─── */
function CategoryIcon({
  image,
  active,
  size = 16,
}: {
  image?: string | null;
  active?: boolean;
  size?: number;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt=""
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <PackageSearch
      size={size}
      className={active ? "text-red-600" : "text-neutral-500"}
    />
  );
}

// ─── Dual Range Slider ──────────────────────────────────────────────────────
type DualRangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
};

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  step = 5000,
  value,
  onChange,
  currency = "NGN",
}) => {
  const rangeRef = useRef<HTMLDivElement>(null);

  const [minInput, setMinInput] = useState(String(value[0]));
  const [maxInput, setMaxInput] = useState(String(value[1]));

  useEffect(() => {
    setMinInput(String(value[0]));
  }, [value[0]]);

  useEffect(() => {
    setMaxInput(String(value[1]));
  }, [value[1]]);

  const clamp = (val: number, lo: number, hi: number) =>
    Math.min(Math.max(val, lo), hi);

  const snapToStep = useCallback(
    (val: number): number => Math.round(val / step) * step,
    [step]
  );

  const pxToVal = useCallback(
    (px: number): number => {
      const track = rangeRef.current;
      if (!track) return min;
      const { left, width } = track.getBoundingClientRect();
      const ratio = clamp((px - left) / width, 0, 1);
      const raw = min + ratio * (max - min);
      return snapToStep(raw);
    },
    [min, max, snapToStep]
  );

  const leftPct = ((value[0] - min) / (max - min)) * 100;
  const rightPct = 100 - ((value[1] - min) / (max - min)) * 100;

  const startDragMin = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const newMin = clamp(pxToVal(ev.clientX), min, value[1] - step);
      onChange([newMin, value[1]]);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startDragMax = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const newMax = clamp(pxToVal(ev.clientX), value[0] + step, max);
      onChange([value[0], newMax]);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const commitMin = () => {
    const parsed = parseInt(minInput.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsed)) {
      setMinInput(String(value[0]));
      return;
    }
    const snapped = clamp(snapToStep(parsed), min, value[1] - step);
    setMinInput(String(snapped));
    onChange([snapped, value[1]]);
  };

  const commitMax = () => {
    const parsed = parseInt(maxInput.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsed)) {
      setMaxInput(String(value[1]));
      return;
    }
    const snapped = clamp(snapToStep(parsed), value[0] + step, max);
    setMaxInput(String(snapped));
    onChange([value[0], snapped]);
  };

  const handleMinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitMin();
  };
  const handleMaxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitMax();
  };

  const formatLabel = (val: number): string => {
    if (val >= 1_000_000)
      return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 w-1/2">
          <label className="text-xs text-neutral-400">Min</label>
          <div className="flex items-center border border-neutral-300 rounded px-2 focus-within:border-red-500 transition-colors">
            <input
              type="text"
              inputMode="numeric"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitMin}
              onKeyDown={handleMinKeyDown}
              className="w-full py-1.5 outline-none text-sm text-neutral-700 bg-transparent"
            />
            <span className="ml-1 text-neutral-400 text-xs shrink-0">
              {currency}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-1/2">
          <label className="text-xs text-neutral-400">Max</label>
          <div className="flex items-center border border-neutral-300 rounded px-2 focus-within:border-red-500 transition-colors">
            <input
              type="text"
              inputMode="numeric"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitMax}
              onKeyDown={handleMaxKeyDown}
              className="w-full py-1.5 outline-none text-sm text-neutral-700 bg-transparent"
            />
            <span className="ml-1 text-neutral-400 text-xs shrink-0">
              {currency}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-6 flex items-center select-none" ref={rangeRef}>
        <div className="absolute inset-x-0 h-1.5 bg-neutral-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-red-500 rounded-full pointer-events-none"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <div
          role="slider"
          aria-label="Minimum price"
          aria-valuenow={value[0]}
          aria-valuemin={min}
          aria-valuemax={value[1]}
          onPointerDown={startDragMin}
          className="absolute w-5 h-5 rounded-full bg-white border-2 border-red-500 shadow-md cursor-grab active:cursor-grabbing touch-none z-20 -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${leftPct}%` }}
        />
        <div
          role="slider"
          aria-label="Maximum price"
          aria-valuenow={value[1]}
          aria-valuemin={value[0]}
          aria-valuemax={max}
          onPointerDown={startDragMax}
          className="absolute w-5 h-5 rounded-full bg-white border-2 border-red-500 shadow-md cursor-grab active:cursor-grabbing touch-none z-20 -translate-x-1/2 hover:scale-110 transition-transform"
          style={{ left: `${((value[1] - min) / (max - min)) * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-neutral-400">
        <span>₦{formatLabel(min)}</span>
        <span>₦{formatLabel(max)}</span>
      </div>

      <div className="text-xs text-center text-neutral-500 bg-neutral-50 rounded-lg py-1.5">
        ₦{formatLabel(value[0])} &nbsp;–&nbsp; ₦{formatLabel(value[1])}
      </div>
    </div>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({
  selectedCategorySlug,
  onCategorySelect,
  brand,
  setBrand,
  priceRange,
  setPriceRange,
  categoriesFromApi = [],
  currency = "NGN",
  minPrice,
  maxPrice,
  priceStep = 10_000,
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localPriceRange, setLocalPriceRange] =
    useState<[number, number]>(priceRange);

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handlePriceChange = (newRange: [number, number]) => {
    setLocalPriceRange(newRange);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPriceRange(newRange);
    }, 300);
  };

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
    <>
      {/* ════════ MOBILE: vertical icon rail ════════ */}
      <div className="lg:hidden max-h-screen overflow-y-auto">
        <div className="flex flex-col items-center gap-5 py-4">
          {categoriesFromApi.map((cat) => {
            const active = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onCategorySelect(cat.slug)}
                className="flex flex-col items-center gap-1.5 w-[72px]"
                aria-label={cat.name}
                aria-pressed={active}
              >
                <span
                  className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
                    active
                      ? "bg-red-50 border-red-200"
                      : "bg-neutral-100 border-transparent"
                  }`}
                >
                  <CategoryIcon image={cat.image} active={active} size={28} />
                </span>
                <span
                  className={`text-[11px] leading-tight text-center ${
                    active ? "text-red-600 font-semibold" : "text-neutral-600"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile filter trigger → opens price modal */}
        <button
          onClick={() => setPriceModalOpen(true)}
          className="mx-auto mb-4 block text-sm font-medium text-neutral-700 hover:text-red-600 transition-colors"
        >
          Price Filter
        </button>
      </div>

      {/* ════════ DESKTOP: full sidebar ════════ */}
      <aside className="hidden lg:block w-full md:w-64 border-r border-neutral-200 bg-white">
        <div className="block p-4 space-y-6">
          <h3 className="text-xs font-bold text-neutral-800 tracking-widest uppercase">
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
                      <CategoryIcon
                        image={cat.image}
                        active={selectedCategorySlug === cat.slug}
                        size={16}
                      />
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

          <div className="border-t border-neutral-100" />

          {/* Price filter (desktop inline) */}
          <div>
            <h3 className="text-xs font-bold text-neutral-800 tracking-widest uppercase mb-4">
              Price Range
            </h3>
            <DualRangeSlider
              min={minPrice}
              max={maxPrice}
              step={priceStep}
              value={localPriceRange}
              onChange={handlePriceChange}
              currency={currency}
            />
          </div>
        </div>
      </aside>

      {/* ════════ MOBILE PRICE MODAL ════════ */}
      {priceModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPriceModalOpen(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-neutral-800">
                Price Range
              </h3>
              <button
                onClick={() => setPriceModalOpen(false)}
                aria-label="Close price filter"
                className="text-neutral-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <DualRangeSlider
              min={minPrice}
              max={maxPrice}
              step={priceStep}
              value={localPriceRange}
              onChange={handlePriceChange}
              currency={currency}
            />

            <button
              onClick={() => setPriceModalOpen(false)}
              className="mt-6 w-full bg-red-600 text-white rounded-full py-3 text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;