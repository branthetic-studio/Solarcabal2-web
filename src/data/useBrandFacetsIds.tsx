"use client";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { GET_ALL_FACETS } from "@/graphql/queries";

type FacetValue = {
  id: string;
  name: string;
  facet: { id: string; name: string };
};

type GetAllFacetsData = {
  facets: {
    items: Array<{
      values: FacetValue[];
    }>;
  };
};

export function useBrandFacetIds(
  selectedBrands: string[]
): string[] | undefined {
  const { data } = useQuery<GetAllFacetsData>(GET_ALL_FACETS, {
    // 👈 add the type here
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (!data || selectedBrands.length === 0) return undefined;

    const allValues = data.facets.items.flatMap((item) => item.values);

    const ids = selectedBrands
      .map(
        (brand) =>
          allValues.find((v) => v.name.toLowerCase() === brand.toLowerCase())
            ?.id
      )
      .filter((id): id is string => Boolean(id));

    return ids.length > 0 ? ids : undefined;
  }, [data, selectedBrands]);
}