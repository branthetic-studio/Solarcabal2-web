"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { GET_COLLECTION_PRODUCTS } from "@/graphql/queries";

type Props = {
  categorySlug: string;
  brand: string[] | null; // ✅ multiple brands supported
  sort: string;
  condition: string;
  priceRange: [number, number];
};

type ProductCardItem = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  priceText?: string;
  brand?: string | null;
};

type PriceSingle = { __typename: "SinglePrice"; value: number };
type PriceRange = { __typename: "PriceRange"; min: number; max: number };
type PriceWithTax = PriceSingle | PriceRange;

type SearchItem = {
  productName: string;
  slug: string;
  facetValueIds: string[];
  productAsset?: { id: string; preview: string } | null;
  priceWithTax: PriceWithTax;
  currencyCode: string;
  brand?: string | null; // ✅ optional brand field
};

type GetCollectionProductsData = {
  search: {
    totalItems: number;
    items: SearchItem[];
  };
};

type GetCollectionProductsVars = {
  collectionSlug: string;
  groupByProduct?: boolean;
  skip?: number;
  take?: number;
  facetValueIds?: string[];
  sort?: Record<string, "ASC" | "DESC">;
  filter?: any;
};

// If you have facet IDs for brands, map them here
const brandFacetIdMap: Record<string, string> = {
  // Example:
  // Jinko: "fv_123",
  // JA: "fv_456",
  // Longi: "fv_789",
};

function formatPrice(p: PriceWithTax, currency: string): string {
  if (p.__typename === "SinglePrice") {
    return `${currency} ${p.value.toLocaleString()}`;
  }
  return `${currency} ${p.min.toLocaleString()} – ${p.max.toLocaleString()}`;
}

const ProductGrid: React.FC<Props> = ({
  categorySlug,
  brand,
  sort,
  condition,
  priceRange,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

  // ✅ Build facetValueIds for multiple brands
  const facetValueIds = useMemo(() => {
    if (!brand || brand.length === 0) return undefined;
    const ids = brand
      .map((b) => brandFacetIdMap[b])
      .filter((id): id is string => Boolean(id));
    return ids.length > 0 ? ids : undefined;
  }, [brand]);

  // ✅ Sort mapping
  const sortMap: Record<string, Record<string, "ASC" | "DESC"> | undefined> = {
    relevance: undefined,
    priceAsc: { price: "ASC" },
    priceDesc: { price: "DESC" },
    nameAsc: { name: "ASC" },
    nameDesc: { name: "DESC" },
  };

  // ✅ Build filters
  const filters: any = {
    price: { between: { start: priceRange[0], end: priceRange[1] } },
  };

  if (condition && condition !== "ANY") {
    filters.condition = { eq: condition.toLowerCase() };
  }

  const { data, loading, error } = useQuery<
    GetCollectionProductsData,
    GetCollectionProductsVars
  >(GET_COLLECTION_PRODUCTS, {
    variables: {
      collectionSlug: categorySlug,
      groupByProduct: true,
      skip: 0,
      take: 20,
      facetValueIds,
      sort: sortMap[sort],
      filter: filters,
    },
    fetchPolicy: "cache-and-network",
  });

  const items: ProductCardItem[] = useMemo(() => {
    const raw = data?.search?.items ?? [];
    return raw.map((it) => ({
      id: it.slug,
      name: it.productName,
      slug: it.slug,
      image: it.productAsset?.preview ?? null,
      priceText: formatPrice(it.priceWithTax, it.currencyCode),
      brand: it.brand ?? null,
    }));
  }, [data]);

  const inc = (id: string) =>
    setQuantities((q) => ({ ...q, [id]: (q[id] || 1) + 1 }));
  const dec = (id: string) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(1, (q[id] || 1) - 1) }));

  const addToCart = async (id: string, quantity: number) => {
    setAddingToCart((prev) => ({ ...prev, [id]: true }));

    try {
      // Your add-to-cart logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log(`Added ${quantity} of product ${id} to cart`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return <div className="product-grid">Loading products…</div>;
  if (error) return <div className="product-grid">Failed to load products.</div>;

  return (
    <div className="product-grid">
      {items.length === 0 ? (
        <p>No products found</p>
      ) : (
        <section key={brand ? brand.join("-") : "all"}>
          <h2>{brand && brand.length > 0 ? brand.join(", ") : "All Brands"}</h2>
          <div className="grid">
            {items.map((item, index) => {
              const qty = quantities[item.id] || 1;
              const isAddingToCart = addingToCart[item.id] || false;
              return (
                <div className="product-card" key={item.id ?? index}>
                  <div className="product-header">
                    <Link href={`/products/${item.slug}`} className="block">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                      />
                    </Link>
                    <div className="actions">
                      <div className="qty-control">
                        <button onClick={() => dec(item.id)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => inc(item.id)}>+</button>
                      </div>
                      <button
                        onClick={() => addToCart(item.id, qty)}
                        disabled={isAddingToCart}
                        className="add-to-cart-btn"
                      >
                        {isAddingToCart ? "Adding..." : `Add ${qty} to Cart`}
                      </button>
                    </div>
                  </div>
                  <div className="product-details">
                    <Link href={`/products/${item.slug}`} className="block">
                      <p className="desc">
                        ⚙ {item.brand ?? "Unknown Brand"}
                      </p>
                      <p className="title">{item.name}</p>
                      {item.priceText && (
                        <p className="price">{item.priceText}</p>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductGrid;
