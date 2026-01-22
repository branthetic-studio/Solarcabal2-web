"use client";
import React, { useState, Dispatch, SetStateAction } from "react";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Suscribe from "@/Components/Suscribe/Suscribe";
import "./Product.css";
import CartItems from "@/Components/CartItems";



const Page = () => {
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>("panels");
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("relevance");

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
      <div className="products-page px-3 sm:px-6 md:px-10 lg:px-12 pb-10">
        {/* Sidebar */}
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

        {/* Main content */}
        <div className="main">


          <ProductGrid
            categorySlug={selectedCategorySlug}
            brand={selectedBrand.length === 0 ? null : selectedBrand}
            sort={sortOrder}
            condition={condition}
            priceRange={priceRange}
          />
        </div>
        <CartItems />
      </div>
      {/* <Refer /> */}
      <Suscribe />
      <Footer />
    </div>
  );
};

export default Page;
