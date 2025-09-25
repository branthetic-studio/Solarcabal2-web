"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";
import {
  GET_COLLECTION_PRODUCTS,
  GET_PRODUCT_DETAILS,
} from "@/graphql/queries";
import { useRouter } from "next/navigation";

type Props = {
  categorySlug: string;
  brand: string[] | null;
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
  brand?: string | null;
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

// Product details type for fetching variant ID
type ProductDetailsForVariant = {
  product: {
    featuredAsset?: { preview: string } | null;
    assets?: Array<{ preview: string }>;
    variants: Array<{
      id: string;
      name: string;
      priceWithTax: number;
      currencyCode: string;
    }>;
  } | null;
};

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
  return `${currency} ${p.min.toLocaleString()} — ${p.max.toLocaleString()}`;
}

const ProductGrid: React.FC<Props> = ({
  categorySlug,
  brand,
  sort,
  condition,
  priceRange,
}) => {
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const { addToCartMutation } = useCart();
  const { addItem: addLocalItem } = useLocalCart();
  const { me, customer } = useUser();
  const router = useRouter();

  // ✅ Lazy query to fetch product details (including variant IDs) by slug
  const [getProductDetails] = useLazyQuery<ProductDetailsForVariant>(
    GET_PRODUCT_DETAILS,
    {
      fetchPolicy: "cache-first", // Cache variant IDs to avoid repeated fetches
    }
  );

  const facetValueIds = useMemo(() => {
    if (!brand || brand.length === 0) return undefined;
    const ids = brand
      .map((b) => brandFacetIdMap[b])
      .filter((id): id is string => Boolean(id));
    return ids.length > 0 ? ids : undefined;
  }, [brand]);

  const sortMap: Record<string, Record<string, "ASC" | "DESC"> | undefined> = {
    relevance: undefined,
    priceAsc: { price: "ASC" },
    priceDesc: { price: "DESC" },
    nameAsc: { name: "ASC" },
    nameDesc: { name: "DESC" },
  };

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

  const addToCart = async (item: ProductCardItem) => {
    setAddingToCart((prev) => ({ ...prev, [item.id]: true }));
    try {
      // 1) Get variant (needed for both server + local)
      const { data: productData } = await getProductDetails({
        variables: { slug: item.slug },
      });
      const firstVariant = productData?.product?.variants?.[0];
      if (!firstVariant?.id)
        throw new Error("No variant found for this product");

      // image fallbacks from product
      const image =
        item.image ??
        productData?.product?.featuredAsset?.preview ??
        productData?.product?.assets?.[0]?.preview ??
        undefined;

      // 🔧 Use the variant currencyCode; don't read product.currencyCode
      const currencyCode = firstVariant.currencyCode ?? "NGN";

      // 2) ALWAYS add locally so guests see cart immediately
      addLocalItem({
        id: firstVariant.id, // productVariantId
        name: item.name,
        slug: item.slug,
        image,
        priceWithTax: firstVariant.priceWithTax, // NOTE: if API returns minor units, divide at render
        currencyCode,
        brand: item.brand ?? undefined,
        quantity: 1,
      });

      // 3) Try server add in parallel; ok if it fails for guests
      const serverAdd = addToCartMutation({
        variables: { productVariantId: firstVariant.id, quantity: 1 },
      }).catch(() => null);

      // Don’t block the toast on server result
      toast.success("Added to cart", {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });

      await serverAdd; // optional: wait quietly so refetches settle if logged in
    } catch (err: any) {
      toast.error(err?.message || "Could not add to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  if (loading) return <div className="product-grid">Loading products…</div>;
  if (error)
    return <div className="product-grid">Failed to load products.</div>;

  return (
    <div className="product-grid">
      {items.length === 0 ? (
        <p>No products found</p>
      ) : (
        <section key={brand ? brand.join("-") : "all"}>
          <h2>{brand && brand.length > 0 ? brand.join(", ") : "All Brands"}</h2>
          <div className="grid">
            {items.map((item, index) => {
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
                      <button
                        onClick={() => addToCart(item)}
                        disabled={isAddingToCart}
                        className="add-to-cart-btn"
                      >
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                  <div className="product-details">
                    <Link href={`/products/${item.slug}`} className="block">
                      <p className="desc">⚙ {item.brand ?? "Unknown Brand"}</p>
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
