"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT_DETAILS } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useCart } from "@/context/CartContext";
import Suscribe from "@/Components/Suscribe/Suscribe";

/* ===================== Types ===================== */

type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  stockLevel: string;
  currencyCode: string;
  price: number;
  priceWithTax: number;
  featuredAsset?: {
    id: string;
    preview: string;
  };
  assets: {
    id: string;
    preview: string;
  }[];
};

type ProductDetails = {
  id: string;
  name: string;
  description: string;
  collections: {
    name: string;
    id: string;
    slug: string;
  }[];
  customFields?: {
    powerOutput?: string;
    efficiency?: string;
    voltage?: string;
    dimensions?: string;
    weight?: string;
    frameMaterial?: string;
    surfaceMaterial?: string;
    relatedProducts?: {
      variants: Array<{
        id: string;
        name: string;
        featuredAsset?: {
          preview: string;
        };
        price: number;
        product: {
          id: string;
          name: string;
          slug: string;
          enabled: boolean;
          assets: {
            preview: string;
          }[];
          featuredAsset?: {
            id: string;
            preview: string;
          };
        };
      }>;
    };
  };
  featuredAsset?: {
    id: string;
    preview: string;
  };
  assets: {
    id: string;
    preview: string;
  }[];
  variants: ProductVariant[];
};

type GetProductDetailsData = {
  product: ProductDetails | null;
};

/* ===================== Page ===================== */

const ProductDetailsPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCartMutation } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }
    setIsAdding(true);
    try {
      await addToCartMutation({
        variables: {
          productVariantId: selectedVariant.id, // <-- real Vendure variant id
          quantity, // <-- your current quantity state
        },
      });
      // optional: show toast / open mini-cart
      // toast.success("Added to cart");
    } catch (e) {
      console.error(e);
      alert("Could not add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "Product Detail" | "Reviews" | "Related Product"
  >("Product Detail");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const { data, loading, error } = useQuery<GetProductDetailsData>(
    GET_PRODUCT_DETAILS,
    {
      variables: { slug },
      skip: !slug,
    }
  );

  // initialize selectedVariant when data arrives
  React.useEffect(() => {
    if (
      data?.product?.variants &&
      data.product.variants.length > 0 &&
      !selectedVariant
    ) {
      setSelectedVariant(data.product.variants[0] as ProductVariant);
    }
  }, [data, selectedVariant]);

  const product = data?.product ?? null;

  /* ---------- Images (guarded) ---------- */
  const productImages = useMemo(() => {
    if (!product) return ["/api/placeholder/400/400"];
    const images: string[] = [];
    const featured = product.featuredAsset?.preview;
    if (featured) images.push(featured);
    for (const a of product.assets ?? []) {
      if (a?.preview && a.preview !== featured) {
        images.push(a.preview);
      }
    }
    return images.length > 0 ? images : ["/api/placeholder/400/400"];
  }, [product]);
  const mainImageSrc =
    productImages[selectedImage] ?? "/api/placeholder/400/400";

  /* ---------- Safe variants list ---------- */
  const variants: ProductVariant[] = useMemo(
    () =>
      (product?.variants ?? []).filter((v): v is ProductVariant =>
        Boolean(v && v.id)
      ),
    [product]
  );

  /* ---------- Related products (guarded) ---------- */
  const relatedProducts = useMemo(() => {
    const relatedVariants =
      product?.customFields?.relatedProducts?.variants ?? [];
    return relatedVariants
      .filter((variant) => variant && variant.product?.enabled)
      .slice(0, 4)
      .map((variant) => ({
        id: variant!.id,
        name: variant!.product!.name,
        price: `₦${variant!.price.toLocaleString()}`,
        image:
          variant!.featuredAsset?.preview ||
          variant!.product!.featuredAsset?.preview ||
          "/api/placeholder/200/200",
        rating: 4.5,
        slug: variant!.product!.slug,
      }));
  }, [product]);

  /* ---------- Quantity helpers ---------- */
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  /* ---------- Price formatting ---------- */
  const currentPrice =
    selectedVariant?.priceWithTax ?? variants[0]?.priceWithTax ?? 0;
  const currency =
    selectedVariant?.currencyCode ?? variants[0]?.currencyCode ?? "NGN";
  const currencySymbol =
    currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
  const formattedPrice = (currentPrice / 100).toLocaleString();

  /* ---------- Loading / Error states ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-gray-200 rounded-lg aspect-square"></div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="w-16 h-16 bg-gray-200 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Product Images */}
            <div className="space-y-4 ">
              {/* Main Image */}
              <div className="bg-gray-100 rounded-lg p-4 aspect-square flex items-center align-center">
                <img
                  src={mainImageSrc}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 p-2 ${selectedImage === index
                      ? "border-[#00AAFF]"
                      : "border-gray-200"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Product Info */}
            <div className="space-y-6 align-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 fill-yellow-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-600 ml-2">(1,250 reviews)</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  {currencySymbol}
                  {formattedPrice}
                </div>
              </div>

              {/* Variant Selection */}
              {variants.length > 1 && (
                <div className="space-y-3">
                  <label className="text-gray-700 font-medium">Variant:</label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedVariant?.id === variant.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Level */}
              {selectedVariant && (
                <div className="text-sm text-gray-600">
                  Stock: {selectedVariant.stockLevel}
                </div>
              )}

              <p>
                Introducing the SKE 3.5KVA Inverter, a cutting-edge solution designed for maximum energy efficiency. With a robust 25-year warranty, this inverter is perfect for powering your home or office.
              </p>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {/* <div className="flex items-center gap-4">
                  <label className="text-gray-700 font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={decreaseQuantity}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                </div> */}

                <div className="flex gap-4">

                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !selectedVariant}
                    className="flex-1 border-2 border-[#242425] text-[#242425] py-3 px-6 rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </button>

                  <button className=" flex-1 px-6 py-3 bg-[#242425] text-[#ffffff] rounded-lg cursor-pointer transition-colors">
                    Buy Now
                  </button>


                  <button className=" flex-1 bg-[#ff0000] text-white py-3 rounded-lg font-medium hover:bg-[#751c1c] transition-colors cursor-pointer">
                    Pay Later
                  </button>
                </div>


              </div>


            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {(["Product Detail", "Reviews", "Related Product"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "Related Product" ? (
              <div>
                <h3 className="text-xl font-bold mb-6">Related Products</h3>
                {relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                      <div
                        key={relatedProduct.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="bg-gray-100 p-4 aspect-square flex items-center justify-center">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {relatedProduct.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {relatedProduct.price}
                            </span>
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 fill-yellow-400"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm text-gray-600 ml-1">
                                {relatedProduct.rating}
                              </span>
                            </div>
                          </div>
                          <button className="w-full mt-3 bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No related products found
                  </p>
                )}
              </div>
            ) : (
              <LocalProductCard status={activeTab} product={product} />
            )}
          </div>
        </div>
      </div>
      <Suscribe />
      <Footer />
    </div>
  );
};

/* ===================== Local Product Card ===================== */

function LocalProductCard({
  status,
  product,
}: {
  status: "Product Detail" | "Reviews";
  product: ProductDetails;
}) {
  if (status === "Reviews") {
    // Simple placeholder reviews section (keeps UI light)
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <span className="font-medium text-gray-900">Customer {i}</span>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-4 h-4 fill-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-700">
              Great product! Solid build and performance. Delivery was quick.
            </p>
          </div>
        ))}
      </div>
    );
  }

  // Product Detail
  const cf = product.customFields ?? {};
  const specs: Array<{ label: string; value?: string }> = [
    { label: "Power Output", value: cf.powerOutput },
    { label: "Efficiency", value: cf.efficiency },
    { label: "Voltage", value: cf.voltage },
    { label: "Dimensions", value: cf.dimensions },
    { label: "Weight", value: cf.weight },
    { label: "Frame Material", value: cf.frameMaterial },
    { label: "Surface Material", value: cf.surfaceMaterial },
  ].filter((s) => Boolean(s.value));

  return (
    <div className="space-y-6">
      {/* Description */}
      {product.description && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-[#818B9C] leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pr-60">
            {specs.map((s, idx) => (
              <div
                key={idx}
                className="flex flex-2 items-center mr-8 justify-between"
              >
                <span className="text-[#818B9C]">{s.label}</span>
                <span className="font-medium text-[#141718]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsPage;
