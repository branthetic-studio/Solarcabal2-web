"use client";
import React, { useState, Dispatch, SetStateAction } from "react";
import { useBrandFacetIds } from "@/data/useBrandFacetsIds";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Suscribe from "@/Components/Suscribe/Suscribe";
// import "./Product.css";
import CartItems from "@/Components/CartItems";



const Page = () => {
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>("panels");
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("relevance");
  const facetValueIds = useBrandFacetIds(selectedBrand);
  // New filters
  const [condition, setCondition] = useState<string>("ANY"); // ANY | NEW | USED
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]); // min, max

  // Temporary mock values for required props
  const categoriesFromApi = [
    { slug: "panels", name: "Solar Panels", brands: ["Jinko", "JA", "Longi"] },
    {
      slug: "inverters",
      name: "Inverters",
      brands: ["Huawei", "SMA", "Fronius"],
    },
    {
      slug: "batteries",
      name: "Batteries",
      brands: ["LG Chem", "BYD", "Pylontech"],
    },
  ];

  const minPrice = 0;
  const maxPrice = 10000;



  return (

    <div>
      <Navbar />
      <Topbar
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      <div className="flex flex-col lg:flex-row bg-[#f5f5f5] px-3 sm:px-6 md:px-10 lg:px-8 pb-10">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 h-full mb-6 md:mb-0">
          <Sidebar
            selectedCategorySlug={selectedCategorySlug}
            onCategorySelect={(slug: string, brand?: string) => {
              setSelectedCategorySlug(slug);
              setSelectedBrand(brand ? [brand] : []);
            }}
            condition={condition}
            setCondition={setCondition}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            brand={selectedBrand}
            setBrand={setSelectedBrand}
            sort={sortOrder}
            setSort={setSortOrder}
            categoriesFromApi={categoriesFromApi}
            minPrice={minPrice}
            maxPrice={maxPrice}

          />
        </div>

        {/* Main content */}
        <div className="flex w-full h-full items-center gap-8 p-4">
          <ProductGrid
            categorySlug={selectedCategorySlug}
            brand={selectedBrand.length === 0 ? null : selectedBrand}
            facetValueIds={facetValueIds}
            sort={sortOrder}
            condition={condition}
            priceRange={priceRange}
          />
        </div>
        <div className="w-2/5 product-cart hidden lg:block">
          <CartItems />
        </div>
      </div>

      <div className="">
        <Suscribe />
      </div>

      <Footer />
    </div>
  );
};

export default Page;
