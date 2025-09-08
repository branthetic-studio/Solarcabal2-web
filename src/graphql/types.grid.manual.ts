export type Money = number;

export type GridVariant = {
  id: string;
  name: string;
  priceWithTax: Money;
  stockLevel: string;
  featuredAsset?: { preview?: string | null } | null;
};

export type GridProduct = {
  id: string;
  name: string;
  slug: string;
  featuredAsset?: { preview?: string | null } | null;
  variants: GridVariant[];
};

export type GetProductsForGridData = {
  products: {
    items: GridProduct[];
    totalItems: number;
  };
};

export type GetProductsForGridVars = {
  take: number;
  skip: number;
};
