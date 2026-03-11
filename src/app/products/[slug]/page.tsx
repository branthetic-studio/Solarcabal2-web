"use client";

import { useParams } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCT_DETAILS } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useCart } from "@/context/CartContext";
import Suscribe from "@/Components/Suscribe/Suscribe";
import { Star } from "lucide-react";
import Image from "next/image";
import StarRating from "../components/StarRating";
import { useRouter } from "next/navigation";

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

const ratingData = [
  { stars: 5, count: 2823 },
  { stars: 4, count: 38 },
  { stars: 3, count: 3 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
];

const reviews = [
  {
    id: 1,
    name: "Daniel Stevens",
    date: "July 6, 2020 • 03:29 PM",
    rating: 5,
    text: "This is amazing product I have.",
    likes: 128,
    dislikes: 2,
    image: "/reviewimg.png",
  },
  {
    id: 2,
    name: "Darlene Robertson",
    date: "July 6, 2020 • 03:29 PM",
    rating: 5,
    text: "This is amazing product I have.",
    likes: 82,
    dislikes: 2,
    image: "/reviewimg.png",
  },
  {
    id: 3,
    name: "Kathryn Murphy",
    date: "June 6, 2020 • 07:39 PM",
    rating: 5,
    text: "This is amazing product I have.",
    likes: 74,
    dislikes: 2,
    image: "/reviewimg.png",
  },
];


/* ===================== Page ===================== */

const ProductDetailsPage = () => {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCartMutation } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }
    setIsAdding(true);
    try {
      await addToCartMutation({
        productVariantId: selectedVariant.id,
        quantity,
      });
    } catch (e) {
      console.error(e);
      alert("Could not add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }
    setIsAdding(true);
    try {
      await addToCartMutation({
        productVariantId: selectedVariant.id,
        quantity,
      });
      router.push("/checkout");
    } catch (e) {
      console.error(e);
      alert("Could not process Buy Now");
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ Pay Later: adds to cart then navigates to /checkout?method=installment
  // The checkout page reads this param and pre-selects the installment payment option
  const handlePayLater = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }
    setIsAdding(true);
    try {
      await addToCartMutation({
        productVariantId: selectedVariant.id,
        quantity,
      });
      router.push("/checkout?method=installment");
    } catch (e) {
      console.error(e);
      alert("Could not process Pay Later");
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

  /* ---------- Price formatting ---------- */
  const currentPrice =
    selectedVariant?.priceWithTax ?? variants[0]?.priceWithTax ?? 0;
  const currency =
    selectedVariant?.currencyCode ?? variants[0]?.currencyCode ?? "NGN";
  const currencySymbol =
    currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
  const priceInNaira = currentPrice / 100;
  const formattedPrice = priceInNaira.toLocaleString();

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

      <div className="mx-auto px-6 py-">
        {/* Product Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Product Images */}
            <div className="space-y-8">
              {/* Main Image */}
              <div className="w-full bg-gray-100 rounded-lg p-4 aspect-square flex items-center justify-center">
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
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 p-2 ${
                      selectedImage === index
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
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          selectedVariant?.id === variant.id
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

              <p>{product.description}</p>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !selectedVariant}
                    className="flex-1 border-2 border-[#242425] text-[#242425] py-3 px-6 rounded-lg font-medium cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isAdding || !selectedVariant}
                    className="flex-1 px-6 py-3 bg-[#242425] text-[#ffffff] rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isAdding ? "Processing..." : "Buy Now"}
                  </button>

                  {/* ✅ FIXED: calls handlePayLater → /checkout?method=installment */}
                  <button
                    onClick={handlePayLater}
                    disabled={isAdding || !selectedVariant}
                    className="flex-1 bg-[#ff0000] text-white py-3 rounded-lg font-medium hover:bg-[#751c1c] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAdding ? "Processing..." : "Pay Later"}
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
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
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

          <div className="w-full p-4 text-justify pb-12">
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
    const totalReviews = ratingData.reduce((a, b) => a + b.count, 0);
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="space-y-8">

        {/* ===== Rating Summary ===== */}
        <div className="flex gap-10 border border-[#E4E9EE] rounded-xl p-6">
          <div className="flex gap-3 items-center min-w-40">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#FFA133"
                  strokeWidth="6"
                />
              </svg>
              <span className="text-3xl font-semibold text-gray-800">4.8</span>
            </div>
            <div>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                from {totalReviews.toLocaleString()} reviews
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {ratingData.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="flex gap-1 w-8 text-sm">
                  {r.stars}.0
                  <Star className="w-5 h-5 fill-[#FFA133] text-[#FFA133]" />
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-black rounded"
                    style={{ width: `${(r.count / totalReviews) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-right text-gray-500">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Reviews Section ===== */}
        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-2 space-y-6 text-[#818B9C]">
            <div>
              <h3 className="mb-3 text-black">Rating</h3>
              {[5, 4, 3, 2, 1].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  <Star className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" /> {r} Star
                </label>
              ))}
            </div>
            <div>
              <h3 className="text-black mb-3">Review Topics</h3>
              {["Product Quality", "Product Price", "Shipment"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  {t}
                </label>
              ))}
            </div>
          </aside>

          <div className="col-span-10 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review Lists</h2>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
                    All Reviews
                  </button>
                  <button className="px-4 py-2 border rounded-lg">
                    With Photo & Video
                  </button>
                  <button className="px-4 py-2 border rounded-lg">
                    With Description
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
              >
                <Image src="/Edit Square.png" alt="Write a review" width={18} height={18} />
                Write a review
              </button>
            </div>

            {isOpen && <ReviewModal onClose={() => setIsOpen(false)} />}

            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-[#E4E9EE] flex justify-between pb-6 space-y-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= review.rating
                            ? "fill-[#FFA133] text-[#FFA133]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{review.text}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-8 h-8 object-cover rounded-full"
                    />
                    <p className="font-semibold">{review.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="text-sm hover:bg-gray-100">
                    <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
                      <Image src="/like.png" alt="Like" width={18} height={18} />
                      {review.likes}
                    </div>
                  </button>
                  <button className="text-sm hover:bg-gray-100">
                    <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
                      <Image src="/dislike.png" alt="Dislike" width={18} height={18} />
                      {review.dislikes}
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      {product.description && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-[#818B9C] leading-relaxed">{product.description}</p>
        </div>
      )}

      {specs.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Specifications
          </h3>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pr-60">
            {specs.map((s, idx) => (
              <div
                key={idx}
                className="w-80 flex flex-2 items-center mr-8 justify-between"
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

type ReviewModalProps = {
  onClose: () => void;
};

function ReviewModal({ onClose }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [submitted, onClose]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!submitted ? onClose : undefined}
      />
      <div className="relative bg-white rounded-xl p-4 w-full max-w-md z-10">
        {!submitted ? (
          <>
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-semibold">Review</h3>
              <button onClick={onClose}>
                <Image src="/close-circle.png" alt="Close" width={22} height={22} />
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-xs mb-1">Rating</h3>
              <StarRating value={rating} onChange={(value) => setRating(value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-[#15171C]">
                Leave your comments here for other customers
              </label>
              <textarea
                className="w-full border border-[#E3EFFC] bg-[#FCFCFD] rounded-lg p-3 text-sm"
                rows={4}
                placeholder="Comment"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Image src="/tick-circle.png" alt="Success" width={80} height={80} />
            <p className="text-sm font-medium text-gray-700">Successful</p>
          </div>
        )}
      </div>
    </div>
  );
}