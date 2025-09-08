"use client";
import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useLazyQuery } from "@apollo/client/react";
import { SEARCH_PRODUCTS } from "@/graphql/queries";

interface SearchUIProps {
  onClose: () => void;
}

interface ProductResult {
  productName: string;
  slug: string;
  description: string;
  productAsset?: {
    preview: string;
  };
  priceWithTax:
    | { __typename: "SinglePrice"; value: number }
    | { __typename: "PriceRange"; min: number; max: number };
}

interface SearchProductsData {
  search: {
    totalItems: number;
    items: ProductResult[];
  };
}

interface SearchProductsVars {
  input: {
    term: string;
  };
}

const SearchUI: React.FC<SearchUIProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [searchProducts, { data, loading }] = useLazyQuery<
    SearchProductsData,
    SearchProductsVars
  >(SEARCH_PRODUCTS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    searchProducts({
      variables: { input: { term: query } },
    });
  };

  const results = data?.search?.items ?? [];

  return (
    <div className="fixed inset-0 bg-black/20 z-50">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-b-sm shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative">
         <div className="w-9/10">
           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for solar products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-gray-100 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
         </div>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results */}
        <div>
          {loading && <p className="text-gray-500">Searching...</p>}
          {!loading && results.length === 0 && searchQuery && (
            <p className="text-gray-500">No results found.</p>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {results.map((product) => (
              <li
                key={product.slug}
                className="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md transition"
              >
                <img
                  src={product.productAsset?.preview || "/placeholder.png"}
                  alt={product.productName}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <h3 className="font-semibold text-gray-800">
                  {product.productName}
                </h3>
                <p className="text-sm text-gray-500">
                  {product.description || "No description"}
                </p>
                <p className="text-red-600 font-bold mt-2">
                  {product.priceWithTax.__typename === "SinglePrice"
                    ? `₦${product.priceWithTax.value}`
                    : `₦${product.priceWithTax.min} - ₦${product.priceWithTax.max}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchUI;
