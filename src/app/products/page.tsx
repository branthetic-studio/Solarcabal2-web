"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { useBrandFacetIds } from "@/data/useBrandFacetsIds";
import { useFacet } from "@/context/useFacet";

import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProductGrid from "./components/ProductGrid";
import Suscribe from "@/Components/Suscribe/Suscribe";
import CartItems from "@/Components/CartItems";

const GET_TOP_LEVEL_COLLECTIONS = gql`
  query GetTopLevelCollections {
    collections(options: { topLevelOnly: true }) {
      items {
        id
        slug
        name
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

const GET_COLLECTION_BRANDS = gql`
  query GetCollectionBrands($slug: String!) {
    search(
      input: {
        collectionSlug: $slug
        groupByProduct: true
        take: 100
      }
    ) {
      items {
        facetValueIds
      }
    }
  }
`;

type TopLevelCollection = {
  id: string;
  slug: string;
  name: string;
  featuredAsset?: { id: string; preview: string } | null;
};

type CategoryWithBrands = {
  slug: string;
  name: string;
  brands: string[];
};

type GetCollectionBrandsResponse = {
  search: {
    items: Array<{ facetValueIds: string[] }>;
  };
};

function BrandsLoader({
  selectedSlug,
  children,
}: {
  selectedSlug: string;
  children: (brands: string[]) => React.ReactNode;
}) {
  const { storeFacets } = useFacet();

  const { data } = useQuery<GetCollectionBrandsResponse>(GET_COLLECTION_BRANDS, {
    variables: { slug: selectedSlug },
    skip: !selectedSlug,
  });

  const brands = useMemo(() => {
    if (!data || !storeFacets.length) return [];

    const brandFacetMap: Record<string, string> = {};
    storeFacets.forEach((f: { id: string; name: string; facet?: { name: string } }) => {
      if (f.facet?.name?.toLowerCase() === "brand") {
        brandFacetMap[f.id] = f.name;
      }
    });

    const seen = new Set<string>();
    data.search.items.forEach((item) => {
      item.facetValueIds.forEach((fid) => {
        if (brandFacetMap[fid]) seen.add(brandFacetMap[fid]);
      });
    });

    return Array.from(seen).sort();
  }, [data, storeFacets]);

  return <>{children(brands)}</>;
}

function PageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    categoryParam ?? ""
  );
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("relevance");
  const facetValueIds = useBrandFacetIds(selectedBrand);
  const [condition, setCondition] = useState<string>("ANY");

  const minPrice = 0;
  const maxPrice = 100_000_000;

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  const { data: collectionsData, loading: collectionsLoading } = useQuery<{
    collections: { items: TopLevelCollection[] };
  }>(GET_TOP_LEVEL_COLLECTIONS);

  const collections = (collectionsData?.collections?.items ?? []).filter(
    (c) =>
      !c.slug.toLowerCase().includes("installation") &&
      !c.name.toLowerCase().includes("installation")
  );

  React.useEffect(() => {
    if (!selectedCategorySlug && collections.length > 0) {
      setSelectedCategorySlug(collections[0].slug);
    }
  }, [collections, selectedCategorySlug]);

  React.useEffect(() => {
    if (categoryParam) {
      setSelectedCategorySlug(categoryParam);
      setSelectedBrand([]);
    }
  }, [categoryParam]);

  if (collectionsLoading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-sm text-gray-500">Loading categories…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Topbar
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <BrandsLoader selectedSlug={selectedCategorySlug}>
        {(brandsForCategory) => {
          const categoriesFromApi: CategoryWithBrands[] = collections.map((c) => ({
            slug: c.slug,
            name: c.name,
            brands: c.slug === selectedCategorySlug ? brandsForCategory : [],
          }));

          return (
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
          );
        }}
      </BrandsLoader>

      <div>
        <Suscribe />
      </div>
      <Footer />
    </div>
  );
}

const Page = () => {
  return (
    <Suspense
      fallback={
        <div>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-sm text-gray-500">Loading…</p>
          </div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
};

export default Page;