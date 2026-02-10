"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFacet } from "@/context/useFacet";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";

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

  const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
    }, []);
  

  const handleBrandClick = (brand: string) => {
    if (brand === "All") {
      onBrandChange([]);
    } else {
      if (selectedBrand.includes(brand)) {
        onBrandChange(selectedBrand.filter((b) => b !== brand));
      } else {
        onBrandChange([...selectedBrand, brand]);
      }
    }
  };

  const { cart } = useCart();
  const { items: localItems } = useLocalCart();
  const { customer, logout, loading } = useUser();

  const getCartCount = () => {
    if (customer) {
      const lines = cart?.activeOrder?.lines ?? [];
      return lines.length;
    } else {
      return localItems.length;
    }
  };

  const cartCount = mounted ? getCartCount() : 0;

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
        <div className="flex justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-black">
            Solar Panel
          </h1>

          <Link
            href="/cart"
            aria-label="Cart"
            className="flex gap-2 border border-[#E4E9EE] text-sm relative px-5 py-3 md:hidden sm:block hover:bg-gray-100 rounded-lg transition-colors items-center"
          >
            Cart
            <Image src="/shop-cart.png" alt="Cart" width={20} height={20} />

            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

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
          {brands.map((brand) => {
            const isSelected =
              brand === "All"
                ? selectedBrand.length === 0
                : selectedBrand.includes(brand);

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
                    ? " text-[#ff0000] border-0"
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
