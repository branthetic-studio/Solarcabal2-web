// ===== Core shared types =====
export type Asset = {
  id: string;
  preview: string; // absolute URL
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  featuredAsset: Asset | null;
};

export type CurrencyCode = "NGN" | "USD" | "EUR"; // extend as needed
export type StockLevel = "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";

// ===== Price unions (match Vendure Search API)
export type SinglePrice = { __typename: "SinglePrice"; value: number };
export type PriceRange = { __typename: "PriceRange"; min: number; max: number };
export type PriceWithTax = SinglePrice | PriceRange;

// ===== Product variant
export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  stockLevel: StockLevel;
  currencyCode: CurrencyCode;
  price: number;
  priceWithTax: number;
  featuredAsset: Asset | null;
  assets: Asset[];
};

// ===== Product custom fields (adjust to your backend)
export type ProductCustomFields = {
  powerOutput: number; // watts
  efficiency: number; // percentage
  voltage: number; // volts
  dimensions: string; // e.g., "22x23"
  weight: number; // kg
  frameMaterial: string; // e.g., "Steel"
  surfaceMaterial: string; // e.g., "Steel"
  relatedProducts: RelatedProduct[];
};

export type RelatedProductVariant = {
  id: string;
  name: string;
  featuredAsset: Asset | null;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
    assets: Asset[];
    featuredAsset: Asset | null;
  };
};

export type RelatedProduct = {
  variants: RelatedProductVariant[];
};

// ===== Full product details (GetProductDetail)
export type Product = {
  id: string;
  name: string;
  description: string; // HTML content
  collections: Collection[];
  customFields: ProductCustomFields;
  featuredAsset: Asset | null;
  assets: Asset[];
  variants: ProductVariant[];
};

// ===== Search item used in collection/grid pages
export type CollectionSearchItem = {
  productId: string;
  productName: string;
  slug: string;

  // IMPORTANT: exactly Asset | null (no undefined)
  productAsset: Asset | null;
  productVariantAsset: Asset | null;

  // Present when search input uses groupByProduct: false
  productVariantId?: string;
  productVariantName?: string;

  currencyCode: CurrencyCode;
  priceWithTax: PriceWithTax;

  // for brand/grouping
  facetValueIds: string[];
};

// If other parts of the code expect SearchResultItem, make it an alias:
export type SearchResultItem = CollectionSearchItem;

// ===== Search response wrappers
export type SearchResponse = {
  totalItems: number;
  items: SearchResultItem[];
};

export type GetCollectionProductsResponse = {
  search: SearchResponse;
};

// (Alternative name used by some helpers)
export interface GetCollectionProductsData {
  search: {
    totalItems: number;
    items: CollectionSearchItem[];
  };
}

// ===== Product details response
export type GetProductDetailResponse = {
  product: Product;
};

// ===== Facet types (for useFacet)
export interface FlatFacet {
  __typename?: "FacetValue";
  id: string;
  name: string;
  facetId: string;
  facet: {
    __typename?: "Facet";
    id: string;
    name: string;
  };
}

export interface FacetBrand {
  [facetValueId: string]: FlatFacet;
}

export interface GetFacetsData {
  facets: {
    items: Array<{
      values: FlatFacet[];
    }>;
  };
}

// ===== Collections (if/when you need them elsewhere)
export type GetTopLevelCollectionsResponse = {
  collections: {
    items: Collection[];
  };
};

export type BrandGroup<T = SearchResultItem> = {
  brandId: string;
  brandName: string;
  items: T[];
};

export interface GetTopLevelCollectionsData {
  collections: {
    items: Array<{
      id: string;
      slug: string;
      name: string;
      featuredAsset: { id: string; preview: string } | null;
    }>;
  };
}
