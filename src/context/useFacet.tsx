"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_FACETS } from "@/graphql/queries";
import { GET_CATEGORIES_QUERY } from "@/graphql/queries";

import type {
  FlatFacet,
  FacetBrand,
  BrandGroup,
  GetFacetsData,
  GetTopLevelCollectionsData,
  GetCollectionProductsData,
} from "@/types/catalog";
/** Public API for the Facet context */
interface IContext {
  /** All facet values flattened */
  storeFacets: FlatFacet[];

  /**
   * Group a search/collection response by its Brand facet.
   * Unknown brands go to key "unknown".
   */
  groupByBrand: (resp: GetCollectionProductsData) => Record<string, BrandGroup>;

  /** Resolve a brand facetValueId to its human name */
  getBrandName: (brandId: string) => string;

  /** Resolve a category id to its name */
  getCategory: (categoryId: string) => string | undefined;
}

const initial_data: IContext = {
  storeFacets: [],
  groupByBrand: () => ({}),
  getBrandName: () => "Unknown",
  getCategory: () => undefined,
};

const FacetsContext = createContext<IContext>(initial_data);

export const useFacet = () => useContext(FacetsContext);

const FacetsProvider = ({ children }: { children: React.ReactNode }) => {
  const [storeFacets, setStoreFacets] = useState<FlatFacet[]>([]);
  const [brandNames, setBrandNames] = useState<FacetBrand>({});
  const [brandIDs, setBrandIDs] = useState<string[]>([]);

  // Load facet values
  const {
    data: facetsData,
    error: facetsError,
    refetch: refetchFacets,
  } = useQuery<GetFacetsData>(GET_ALL_FACETS, {
    fetchPolicy: "cache-and-network",
  });

  // Load top-level collections
  const {
    data: categoriesData,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<GetTopLevelCollectionsData>(GET_CATEGORIES_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  // Build lookups once facets are in
  useEffect(() => {
    if (!facetsData?.facets?.items?.length) return;

    const allValues = facetsData.facets.items.flatMap((it) => it.values);

    // id → value
    const valueById: FacetBrand = Object.fromEntries(
      allValues.map((v) => [v.id, v])
    );
    setBrandNames(valueById);

    // Which facetValueIds are Brand values?
    const brandValueIds = allValues
      .filter((v) => v.facet?.name?.toLowerCase() === "brand")
      .map((v) => v.id);

    setBrandIDs(brandValueIds);
    setStoreFacets(allValues);
  }, [facetsData]);

  // Optionally log errors; we don't block render here
  useEffect(() => {
    if (facetsError) {
      // eslint-disable-next-line no-console
      console.error("GET_ALL_FACETS error:", facetsError);
    }
    if (categoriesError) {
      // eslint-disable-next-line no-console
      console.error("GET_CATEGORIES_QUERY error:", categoriesError);
    }
  }, [facetsError, categoriesError]);

  /** Resolve category id → name */
  const getCategory = (categoryId: string) => {
    const found = categoriesData?.collections.items.find(
      (c) => c.id === categoryId
    );
    return found?.name;
  };

  /** Resolve brand facetValueId → name (or "Unknown") */
  const getBrandName = (brandId: string) =>
    brandNames[brandId]?.name ?? "Unknown";

  /**
   * Group a Vendure search response by brand facet.
   * Anything without a brand facetValue goes into "unknown".
   */
  const groupByBrand = (resp: GetCollectionProductsData) => {
    const items = resp.search.items;

    const grouped = items.reduce<Record<string, BrandGroup>>((acc, item) => {
      const brandId =
        item.facetValueIds.find((id) => brandIDs.includes(id)) ?? "unknown";
      const brandName = getBrandName(brandId);

      if (!acc[brandId]) {
        acc[brandId] = { brandId, brandName, items: [] };
      }
      acc[brandId].items.push(item);
      return acc;
    }, {});

    return grouped;
  };

  const value = useMemo<IContext>(
    () => ({
      storeFacets,
      groupByBrand,
      getBrandName,
      getCategory,
    }),
    [storeFacets, brandIDs, brandNames, categoriesData]
  );

  return (
    <FacetsContext.Provider value={value}>{children}</FacetsContext.Provider>
  );
};

export default FacetsProvider;
