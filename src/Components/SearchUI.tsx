"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { SEARCH_PRODUCTS } from "@/graphql/queries";

interface SearchUIProps {
  onClose: () => void;
}

interface PriceSingle {
  __typename: "SinglePrice";
  value: number;
}

interface PriceRange {
  __typename: "PriceRange";
  min: number;
  max: number;
}

interface ProductResult {
  productName: string;
  slug: string;
  description: string;
  productAsset?: {
    preview: string;
  };
  priceWithTax: PriceSingle | PriceRange;
}

// ✅ This is what tells TypeScript the shape of data returned by the query
interface SearchData {
  search: {
    totalItems: number;
    items: ProductResult[];
  };
}

const truncateDescription = (text: string, wordLimit = 15): string => {
  if (!text) return "No description";
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const formatPrice = (priceWithTax: ProductResult["priceWithTax"]): string => {
  if (priceWithTax.__typename === "SinglePrice") {
    return `₦${(priceWithTax.value / 100).toLocaleString()}`;
  }
  return `₦${(priceWithTax.min / 100).toLocaleString()} – ₦${(
    priceWithTax.max / 100
  ).toLocaleString()}`;
};

const SearchUI: React.FC<SearchUIProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const client = useApolloClient();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const triggerSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults([]);
        setTotalItems(0);
        return;
      }
      setLoading(true);
      try {
        // ✅ Pass SearchData as the generic so data.search is fully typed
        const { data } = await client.query<SearchData>({
          query: SEARCH_PRODUCTS,
          variables: { input: { term } },
          fetchPolicy: "network-only",
        });
        setResults(data?.search?.items ?? []);
        setTotalItems(data?.search?.totalItems ?? 0);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerSearch(value);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      triggerSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setTotalItems(0);
    inputRef.current?.focus();
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-b-xl shadow-xl flex flex-col max-h-[85vh]">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for solar products..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-10 py-3 bg-gray-100 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all duration-200 text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div className="overflow-y-auto flex-1 px-4 py-4">
          {loading && (
            <p className="text-gray-400 text-sm text-center py-6">
              Searching...
            </p>
          )}

          {!loading && searchQuery && results.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">
              No results found for &quot;{searchQuery}&quot;
            </p>
          )}

          {!searchQuery && (
            <p className="text-gray-400 text-sm text-center py-6">
              Start typing to search for products
            </p>
          )}

          {results.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-3">
                {totalItems} result{totalItems !== 1 ? "s" : ""} found
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((product: ProductResult) => (
                  <li key={product.slug}>
                    <button
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full text-left bg-gray-50 rounded-xl p-3 shadow-sm hover:shadow-md hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 cursor-pointer group"
                    >
                      <img
                        src={
                          product.productAsset?.preview || "/placeholder.png"
                        }
                        alt={product.productName}
                        className="w-full h-28 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-gray-800 text-sm group-hover:text-red-600 transition-colors line-clamp-1">
                        {product.productName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {truncateDescription(product.description, 15)}
                      </p>
                      <p className="text-red-600 font-bold mt-2 text-sm">
                        {formatPrice(product.priceWithTax)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchUI;