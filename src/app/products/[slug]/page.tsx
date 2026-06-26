// "use client";

// import { useParams } from "next/navigation";
// import React, { useMemo, useState, useEffect, useCallback } from "react";
// import { useQuery } from "@apollo/client/react";
// import { GET_PRODUCT_DETAILS } from "@/graphql/queries";
// import Navbar from "@/Components/Navbar/Navbar";
// import Footer from "@/Components/Footer/Footer";
// import { useCart } from "@/context/CartContext";
// import { useLocalCart } from "@/context/LocalCartContext";
// import { useUser } from "@/context/UserContext";
// import Suscribe from "@/Components/Suscribe/Suscribe";
// import { Star } from "lucide-react";
// import Image from "next/image";
// import StarRating from "../components/StarRating";
// import { useRouter } from "next/navigation";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { stripHtml } from "@/utils/stripHtml";

// /* ===================== Types ===================== */

// type ProductVariant = {
//   id: string;
//   name: string;
//   sku: string;
//   stockLevel: string;
//   currencyCode: string;
//   price: number;
//   priceWithTax: number;
//   featuredAsset?: { id: string; preview: string };
//   assets: { id: string; preview: string }[];
// };

// type ProductDetails = {
//   id: string;
//   name: string;
//   description: string;
//   collections: { name: string; id: string; slug: string }[];
//   customFields?: {
//     powerOutput?: string;
//     efficiency?: string;
//     voltage?: string;
//     dimensions?: string;
//     weight?: string;
//     frameMaterial?: string;
//     surfaceMaterial?: string;
//     relatedProducts?: {
//       variants: Array<{
//         id: string;
//         name: string;
//         featuredAsset?: { preview: string };
//         price: number;
//         product: {
//           id: string;
//           name: string;
//           slug: string;
//           enabled: boolean;
//           assets: { preview: string }[];
//           featuredAsset?: { id: string; preview: string };
//         };
//       }>;
//     };
//   };
//   featuredAsset?: { id: string; preview: string };
//   assets: { id: string; preview: string }[];
//   variants: ProductVariant[];
// };

// type GetProductDetailsData = { product: ProductDetails | null };
// type ActionKey = "cart" | "buy" | "later";

// /* ===================== Static data ===================== */

// const ratingData = [
//   { stars: 5, count: 2823 },
//   { stars: 4, count: 38 },
//   { stars: 3, count: 3 },
//   { stars: 2, count: 1 },
//   { stars: 1, count: 0 },
// ];

// const reviews = [
//   {
//     id: 1,
//     name: "Daniel Stevens",
//     date: "July 6, 2020 • 03:29 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 128,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
//   {
//     id: 2,
//     name: "Darlene Robertson",
//     date: "July 6, 2020 • 03:29 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 82,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
//   {
//     id: 3,
//     name: "Kathryn Murphy",
//     date: "June 6, 2020 • 07:39 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 74,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
// ];

// /* ===================== Page ===================== */

// const ProductDetailsPage = () => {
//   const params = useParams();
//   const slug = params?.slug as string;
//   const router = useRouter();

//   const { cart, addToCartMutation, handleAdjustQuantity, removeFromCartMutation, getOrderLineIdByVariantId } = useCart();
//   const { customer } = useUser();
//   const { items: localItems, addItem: addLocalItem, updateQuantity: updateLocalQuantity, removeItem: removeLocalItem } = useLocalCart();

//   const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState<"Product Detail" | "Reviews" | "Related Product">("Product Detail");
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

//   const { data, loading, error } = useQuery<GetProductDetailsData>(
//     GET_PRODUCT_DETAILS,
//     { variables: { slug }, skip: !slug }
//   );

//   useEffect(() => {
//     if (data?.product?.variants?.length) {
//       const first = data.product.variants.find((v) => v?.id);
//       if (first) setSelectedVariant(first as ProductVariant);
//     }
//   }, [data]);

//   const product = data?.product ?? null;

//   /* ---------- Images ---------- */
//   const productImages = useMemo(() => {
//     if (!product) return ["/api/placeholder/400/400"];
//     const imgs: string[] = [];
//     if (product.featuredAsset?.preview) imgs.push(product.featuredAsset.preview);
//     for (const a of product.assets ?? []) {
//       if (a?.preview && a.preview !== product.featuredAsset?.preview)
//         imgs.push(a.preview);
//     }
//     return imgs.length ? imgs : ["/api/placeholder/400/400"];
//   }, [product]);

//   const mainImageSrc = productImages[selectedImage] ?? "/api/placeholder/400/400";

//   /* ---------- Variants ---------- */
//   const variants: ProductVariant[] = useMemo(
//     () => (product?.variants ?? []).filter((v): v is ProductVariant => Boolean(v?.id)),
//     [product]
//   );

//   /* ---------- Related products ---------- */
//   const relatedProducts = useMemo(() => {
//     return (product?.customFields?.relatedProducts?.variants ?? [])
//       .filter((v) => v?.product?.enabled)
//       .slice(0, 4)
//       .map((v) => ({
//         id: v!.id,
//         name: v!.product!.name,
//         price: `₦${v!.price.toLocaleString()}`,
//         image:
//           v!.featuredAsset?.preview ||
//           v!.product!.featuredAsset?.preview ||
//           "/api/placeholder/200/200",
//         rating: 4.5,
//         slug: v!.product!.slug,
//       }));
//   }, [product]);

//   /* ---------- Price ---------- */
//   const currentPrice = selectedVariant?.priceWithTax ?? variants[0]?.priceWithTax ?? 0;
//   const currency = selectedVariant?.currencyCode ?? variants[0]?.currencyCode ?? "NGN";
//   const currencySymbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
//   const formattedPrice = (currentPrice / 100).toLocaleString();

//   /* ---------- Plain-text description (strips HTML tags) ---------- */
//   const plainDescription = useMemo(
//     () => stripHtml(product?.description),
//     [product?.description]
//   );

//   // ─── Quantity from cart — reads directly from cart/localItems by variantId ──
//   const cartQuantity = useMemo(() => {
//     if (!selectedVariant) return 0;

//     if (customer) {
//       const line = (cart?.activeOrder?.lines ?? []).find(
//         (l: any) =>
//           l?.productVariant?.id === selectedVariant.id ||
//           l?.productVariant?.product?.slug === slug
//       );
//       return line?.quantity ?? 0;
//     } else {
//       const item = localItems.find(
//         (it) => it.id === selectedVariant.id || it.slug === slug
//       );
//       return item?.quantity ?? 0;
//     }
//   }, [selectedVariant, customer, cart, localItems, slug]);

//   useEffect(() => {
//     if (cartQuantity > 0) {
//       setQuantity(cartQuantity);
//     } else {
//       setQuantity(1);
//     }
//   }, [cartQuantity, selectedVariant?.id]);

//   /* ---------- Core cart action ---------- */
//   const addVariantToCart = useCallback(
//     async (action: ActionKey): Promise<boolean> => {
//       if (!selectedVariant) {
//         toast.error("Please select a variant");
//         return false;
//       }

//       setLoadingAction(action);
//       try {
//         addLocalItem({
//           id: selectedVariant.id,
//           name: product?.name ?? selectedVariant.name,
//           slug: slug ?? "",
//           priceWithTax: selectedVariant.priceWithTax,
//           currencyCode: selectedVariant.currencyCode ?? "NGN",
//           image: mainImageSrc !== "/api/placeholder/400/400" ? mainImageSrc : undefined,
//           quantity,
//         });

//         if (customer) {
//           const result = await addToCartMutation({
//             productVariantId: selectedVariant.id,
//             quantity,
//           });

//           if (result?.__typename === "InsufficientStockError") {
//             toast.error(`Only ${result.quantityAvailable} item(s) available in stock.`);
//             return false;
//           }
//           if (result?.errorCode) {
//             toast.error(`Could not add to cart: ${result.message ?? result.errorCode}`);
//             return false;
//           }
//         }

//         toast.success("Added to cart!", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         });

//         return true;
//       } catch (e: any) {
//         console.error("Add to cart error:", e);
//         toast.error(e?.message ?? "Could not add to cart. Please try again.");
//         return false;
//       } finally {
//         setLoadingAction(null);
//       }
//     },
//     [selectedVariant, quantity, product, slug, mainImageSrc, customer, addLocalItem, addToCartMutation]
//   );

//   // ─── Adjust quantity directly from product detail page ────────────────────
//   const adjustCartQuantity = useCallback(
//     async (newQty: number) => {
//       if (!selectedVariant) return;
//       setQuantity(Math.max(1, newQty));

//       if (cartQuantity === 0) return;

//       if (newQty <= 0) {
//         removeLocalItem(selectedVariant.id);
//         if (customer) {
//           const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
//           if (orderLineId) {
//             try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
//           }
//         }
//         return;
//       }

//       updateLocalQuantity(selectedVariant.id, newQty);
//       if (customer) {
//         const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
//         if (orderLineId) {
//           try { await handleAdjustQuantity(orderLineId, newQty); } catch (e) { console.error(e); }
//         }
//       }
//     },
//     [selectedVariant, cartQuantity, customer, removeLocalItem, updateLocalQuantity, getOrderLineIdByVariantId, removeFromCartMutation, handleAdjustQuantity]
//   );

//   const handleAddToCart = () => addVariantToCart("cart");
//   const handleBuyNow = async () => {
//     const ok = await addVariantToCart("buy");
//     if (ok) router.push("/checkout");
//   };
//   const handlePayLater = async () => {
//     const ok = await addVariantToCart("later");
//     if (ok) router.push("/checkout?method=installment");
//   };

//   const anyLoading = loadingAction !== null;

//   /* ---------- Loading skeleton ---------- */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="space-y-4">
//                 <div className="bg-gray-200 rounded-lg aspect-square" />
//                 <div className="flex gap-2">
//                   {[1, 2, 3, 4, 5, 6].map((i) => (
//                     <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-6">
//                 <div className="h-8 bg-gray-200 rounded w-3/4" />
//                 <div className="h-6 bg-gray-200 rounded w-1/2" />
//                 <div className="h-8 bg-gray-200 rounded w-1/4" />
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   /* ---------- Error ---------- */
//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 text-center">
//             <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
//             <p className="text-gray-600">
//               The product you&apos;re looking for doesn&apos;t exist or has been removed.
//             </p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   /* ===================== Render ===================== */
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <ToastContainer />
//       <Navbar />

//       <div className="mx-auto px-6 py-6">
//         {/* ── Product section ── */}
//         <div className="mb-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//             {/* Left — images */}
//             <div className="space-y-8">
//               <div className="w-full bg-gray-100 rounded-lg p-4 aspect-square flex items-center justify-center">
//                 <img
//                   src={mainImageSrc}
//                   alt={product.name}
//                   className="max-w-full max-h-full object-contain"
//                 />
//               </div>
//               <div className="flex gap-2 overflow-x-auto">
//                 {productImages.map((image, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setSelectedImage(index)}
//                     aria-label={`View image ${index + 1}`}
//                     className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 p-2 ${
//                       selectedImage === index ? "border-[#00AAFF]" : "border-gray-200"
//                     }`}
//                   >
//                     <img
//                       src={image}
//                       alt={`Thumbnail ${index + 1}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Right — info */}
//             <div className="space-y-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
//                 <div className="flex items-center gap-2 mb-4">
//                   <div className="flex items-center">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <svg key={star} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </svg>
//                     ))}
//                     <span className="text-gray-600 ml-2">(1,250 reviews)</span>
//                   </div>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900 mb-6">
//                   {currencySymbol}{formattedPrice}
//                 </div>
//               </div>

//               {/* Variant selector */}
//               {variants.length > 1 && (
//                 <div className="space-y-3">
//                   <label className="text-gray-700 font-medium">Variant:</label>
//                   <div className="flex flex-wrap gap-2">
//                     {variants.map((variant) => (
//                       <button
//                         key={variant.id}
//                         onClick={() => setSelectedVariant(variant)}
//                         className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                           selectedVariant?.id === variant.id
//                             ? "border-blue-500 bg-blue-50 text-blue-700"
//                             : "border-gray-300 hover:bg-gray-50"
//                         }`}
//                       >
//                         {variant.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Stock */}
//               {selectedVariant && (
//                 <div className="text-sm text-gray-600">
//                   Stock: {selectedVariant.stockLevel}
//                 </div>
//               )}

//               {/* Description — HTML tags stripped */}
//               {plainDescription && (
//                 <p className="text-gray-700">{plainDescription}</p>
//               )}

//               {/* ── Quantity — shows cart quantity if already in cart ── */}
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-700 font-medium">Qty:</span>
//                 <button
//                   aria-label="Decrease quantity"
//                   onClick={() => adjustCartQuantity(quantity - 1)}
//                   disabled={anyLoading}
//                   className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50"
//                 >
//                   −
//                 </button>
//                 <span className="w-8 text-center font-medium">{quantity}</span>
//                 <button
//                   aria-label="Increase quantity"
//                   onClick={() => adjustCartQuantity(quantity + 1)}
//                   disabled={anyLoading}
//                   className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50"
//                 >
//                   +
//                 </button>
//                 {cartQuantity > 0 && (
//                   <span className="text-xs text-green-600 font-medium ml-1">
//                     ({cartQuantity} in cart)
//                   </span>
//                 )}
//               </div>

//               {/* ── Action buttons ── */}
//               <div className="flex flex-col md:flex-row gap-2 md:gap-4">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={anyLoading || !selectedVariant}
//                   className="flex-1 border-2 border-[#242425] text-[#242425] py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "cart" ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#242425] border-t-transparent" />
//                       Adding...
//                     </>
//                   ) : cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
//                 </button>

//                 <button
//                   onClick={handleBuyNow}
//                   disabled={anyLoading || !selectedVariant}
//                   className="flex-1 px-6 py-3 bg-[#242425] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "buy" ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                       Processing...
//                     </>
//                   ) : "Buy Now"}
//                 </button>

//                 <button
//                   onClick={handlePayLater}
//                   disabled={anyLoading || !selectedVariant}
//                   className="flex-1 bg-[#ff0000] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#751c1c] flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "later" ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                       Processing...
//                     </>
//                   ) : "Pay Later"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Tabs ── */}
//         <div>
//           <div className="border-b border-gray-200">
//             <nav className="flex">
//               {(["Product Detail", "Reviews", "Related Product"] as const).map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
//                     activeTab === tab
//                       ? "border-black text-black"
//                       : "border-transparent text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="w-full p-4 text-justify pb-12">
//             {activeTab === "Related Product" ? (
//               <div>
//                 <h3 className="text-xl font-bold mb-6">Related Products</h3>
//                 {relatedProducts.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {relatedProducts.map((rp) => (
//                       <div
//                         key={rp.id}
//                         className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
//                         onClick={() => router.push(`/products/${rp.slug}`)}
//                       >
//                         <div className="bg-gray-100 p-4 aspect-square flex items-center justify-center">
//                           <img src={rp.image} alt={rp.name} className="max-w-full max-h-full object-contain" />
//                         </div>
//                         <div className="p-4">
//                           <h4 className="font-medium text-gray-900 mb-2">{rp.name}</h4>
//                           <div className="flex items-center justify-between">
//                             <span className="text-lg font-bold text-gray-900">{rp.price}</span>
//                             <div className="flex items-center">
//                               <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                               <span className="text-sm text-gray-600 ml-1">{rp.rating}</span>
//                             </div>
//                           </div>
//                           <button className="w-full mt-3 bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors">
//                             View Product
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-center py-8">No related products found</p>
//                 )}
//               </div>
//             ) : (
//               <LocalProductCard status={activeTab} product={product} />
//             )}
//           </div>
//         </div>
//       </div>

//       <Suscribe />
//       <Footer />
//     </div>
//   );
// };

// /* ===================== LocalProductCard ===================== */

// function LocalProductCard({
//   status,
//   product,
// }: {
//   status: "Product Detail" | "Reviews";
//   product: ProductDetails;
// }) {
//   if (status === "Reviews") {
//     const totalReviews = ratingData.reduce((a, b) => a + b.count, 0);
//     const [isOpen, setIsOpen] = useState(false);

//     return (
//       <div className="space-y-8">
//         <div className="flex gap-10 border border-[#E4E9EE] rounded-xl p-6">
//           <div className="flex gap-3 items-center min-w-40">
//             <div className="relative w-20 h-20 flex items-center justify-center">
//               <svg className="absolute inset-0" viewBox="0 0 100 100">
//                 <circle cx="50" cy="50" r="45" fill="none" stroke="#FFA133" strokeWidth="6" />
//               </svg>
//               <span className="text-3xl font-semibold text-gray-800">4.8</span>
//             </div>
//             <div>
//               <div className="flex mt-1">
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <Star key={i} className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" />
//                 ))}
//               </div>
//               <p className="text-xs text-gray-500 mt-2">
//                 from {totalReviews.toLocaleString()} reviews
//               </p>
//             </div>
//           </div>
//           <div className="flex-1 space-y-2">
//             {ratingData.map((r) => (
//               <div key={r.stars} className="flex items-center gap-3">
//                 <span className="flex gap-1 w-8 text-sm">
//                   {r.stars}.0
//                   <Star className="w-5 h-5 fill-[#FFA133] text-[#FFA133]" />
//                 </span>
//                 <div className="flex-1 h-2 bg-gray-200 rounded">
//                   <div
//                     className="h-2 bg-black rounded"
//                     style={{ width: `${(r.count / totalReviews) * 100}%` }}
//                   />
//                 </div>
//                 <span className="w-12 text-sm text-right text-gray-500">{r.count}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="grid grid-cols-12 gap-8">
//           <aside className="col-span-2 space-y-6 text-[#818B9C]">
//             <div>
//               <h3 className="mb-3 text-black">Rating</h3>
//               {[5, 4, 3, 2, 1].map((r) => (
//                 <label key={r} className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" />
//                   <Star className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" /> {r} Star
//                 </label>
//               ))}
//             </div>
//             <div>
//               <h3 className="text-black mb-3">Review Topics</h3>
//               {["Product Quality", "Product Price", "Shipment"].map((t) => (
//                 <label key={t} className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" /> {t}
//                 </label>
//               ))}
//             </div>
//           </aside>

//           <div className="col-span-10 space-y-6">
//             <div className="flex items-center justify-between mb-6">
//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Review Lists</h2>
//                 <div className="flex gap-3">
//                   <button className="px-4 py-2 bg-red-500 text-white rounded-lg">All Reviews</button>
//                   <button className="px-4 py-2 border rounded-lg">With Photo & Video</button>
//                   <button className="px-4 py-2 border rounded-lg">With Description</button>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsOpen(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
//               >
//                 <Image src="/Edit Square.png" alt="Write a review" width={18} height={18} />
//                 Write a review
//               </button>
//             </div>

//             {isOpen && <ReviewModal onClose={() => setIsOpen(false)} />}

//             {reviews.map((review) => (
//               <div key={review.id} className="border-b border-[#E4E9EE] flex justify-between pb-6 space-y-3">
//                 <div className="flex flex-col gap-3">
//                   <div className="flex gap-1">
//                     {[1, 2, 3, 4, 5].map((i) => (
//                       <Star
//                         key={i}
//                         className={`w-4 h-4 ${i <= review.rating ? "fill-[#FFA133] text-[#FFA133]" : "text-gray-300"}`}
//                       />
//                     ))}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-700">{review.text}</p>
//                     <p className="text-xs text-gray-500">{review.date}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <img src={review.image} alt={review.name} className="w-8 h-8 object-cover rounded-full" />
//                     <p className="font-semibold">{review.name}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-1">
//                   <button className="text-sm hover:bg-gray-100">
//                     <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
//                       <Image src="/like.png" alt="Like" width={18} height={18} />
//                       {review.likes}
//                     </div>
//                   </button>
//                   <button className="text-sm hover:bg-gray-100">
//                     <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
//                       <Image src="/dislike.png" alt="Dislike" width={18} height={18} />
//                       {review.dislikes}
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const cf = product.customFields ?? {};
//   const specs = [
//     { label: "Power Output", value: cf.powerOutput },
//     { label: "Efficiency", value: cf.efficiency },
//     { label: "Voltage", value: cf.voltage },
//     { label: "Dimensions", value: cf.dimensions },
//     { label: "Weight", value: cf.weight },
//     { label: "Frame Material", value: cf.frameMaterial },
//     { label: "Surface Material", value: cf.surfaceMaterial },
//   ].filter((s) => Boolean(s.value));

//   // Strip HTML tags from product description in this tab too
//   const plainDescription = stripHtml(product.description);

//   return (
//     <div className="space-y-6">
//       {plainDescription && (
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
//           <p className="text-[#818B9C] leading-relaxed">{plainDescription}</p>
//         </div>
//       )}
//       {specs.length > 0 && (
//         <div className="w-full">
//           <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
//             {specs.map((s, idx) => (
//               <div key={idx} className="flex items-center justify-between">
//                 <span className="text-[#818B9C]">{s.label}</span>
//                 <span className="font-medium text-[#141718]">{s.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ProductDetailsPage;

// /* ===================== ReviewModal ===================== */

// type ReviewModalProps = { onClose: () => void };

// function ReviewModal({ onClose }: ReviewModalProps) {
//   const [rating, setRating] = useState(0);
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     if (submitted) {
//       const t = setTimeout(onClose, 1000);
//       return () => clearTimeout(t);
//     }
//   }, [submitted, onClose]);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/50" onClick={!submitted ? onClose : undefined} />
//       <div className="relative bg-white rounded-xl p-4 w-full max-w-md z-10">
//         {!submitted ? (
//           <>
//             <div className="flex justify-between mb-6">
//               <h3 className="text-lg font-semibold">Review</h3>
//               <button onClick={onClose} aria-label="Close review modal">
//                 <Image src="/close-circle.png" alt="Close" width={22} height={22} />
//               </button>
//             </div>
//             <div className="mb-4">
//               <h3 className="text-xs mb-1">Rating</h3>
//               <StarRating value={rating} onChange={setRating} />
//             </div>
//             <div className="grid gap-2">
//               <label className="text-xs text-[#15171C]">
//                 Leave your comments here for other customers
//               </label>
//               <textarea
//                 className="w-full border border-[#E3EFFC] bg-[#FCFCFD] rounded-lg p-3 text-sm"
//                 rows={4}
//                 placeholder="Comment"
//               />
//             </div>
//             <div className="flex justify-end mt-4">
//               <button
//                 onClick={() => setSubmitted(true)}
//                 disabled={rating === 0}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
//               >
//                 Submit
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-10 gap-4">
//             <Image src="/tick-circle.png" alt="Success" width={80} height={80} />
//             <p className="text-sm font-medium text-gray-700">Successful</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useParams } from "next/navigation";
// import React, { useMemo, useState, useEffect, useCallback } from "react";
// import { useQuery } from "@apollo/client/react";
// import { GET_PRODUCT_DETAILS } from "@/graphql/queries";
// import Navbar from "@/Components/Navbar/Navbar";
// import Footer from "@/Components/Footer/Footer";
// import { useCart } from "@/context/CartContext";
// import { useLocalCart } from "@/context/LocalCartContext";
// import { useUser } from "@/context/UserContext";
// import Suscribe from "@/Components/Suscribe/Suscribe";
// import { Star } from "lucide-react";
// import Image from "next/image";
// import StarRating from "../components/StarRating";
// import { useRouter } from "next/navigation";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { stripHtml } from "@/utils/stripHtml";

// /* ===================== Types ===================== */

// type ProductVariant = {
//   id: string;
//   name: string;
//   sku: string;
//   stockLevel: string;
//   currencyCode: string;
//   price: number;
//   priceWithTax: number;
//   featuredAsset?: { id: string; preview: string };
//   assets: { id: string; preview: string }[];
// };

// type ProductDetails = {
//   id: string;
//   name: string;
//   description: string;
//   collections: { name: string; id: string; slug: string }[];
//   customFields?: {
//     powerOutput?: string;
//     efficiency?: string;
//     voltage?: string;
//     dimensions?: string;
//     weight?: string;
//     frameMaterial?: string;
//     surfaceMaterial?: string;
//     relatedProducts?: {
//       variants: Array<{
//         id: string;
//         name: string;
//         featuredAsset?: { preview: string };
//         price: number;
//         product: {
//           id: string;
//           name: string;
//           slug: string;
//           enabled: boolean;
//           assets: { preview: string }[];
//           featuredAsset?: { id: string; preview: string };
//         };
//       }>;
//     };
//   };
//   featuredAsset?: { id: string; preview: string };
//   assets: { id: string; preview: string }[];
//   variants: ProductVariant[];
// };

// type GetProductDetailsData = { product: ProductDetails | null };
// type ActionKey = "cart" | "buy" | "later";

// /**
//  * Parses Vendure\'s stockLevel string into a numeric max quantity.
//  * - "OUT_OF_STOCK"      -> 0
//  * - "5_UNITS_LEFT"      -> 5  (any "X_UNITS_LEFT" pattern, 1-10)
//  * - "IN_STOCK"          -> Infinity (no display limit, >10 available)
//  * - anything else/empty -> Infinity (fail open, don\'t block legit purchases)
//  */
// function parseStockLevel(stockLevel?: string | null): number {
//   let limit: number;

//   if (!stockLevel) {
//     limit = Infinity;
//   } else if (stockLevel === "OUT_OF_STOCK") {
//     limit = 0;
//   } else if (stockLevel === "IN_STOCK") {
//     limit = Infinity;
//   } else {
//     const match = stockLevel.match(/^(\d+)_UNITS_LEFT$/);
//     limit = match ? parseInt(match[1], 10) : Infinity;
//   }

//   console.log("[stock] parseStockLevel:", { stockLevel, limit });
//   return limit;
// }

// /* ===================== Static data ===================== */

// const ratingData = [
//   { stars: 5, count: 2823 },
//   { stars: 4, count: 38 },
//   { stars: 3, count: 3 },
//   { stars: 2, count: 1 },
//   { stars: 1, count: 0 },
// ];

// const reviews = [
//   {
//     id: 1,
//     name: "Daniel Stevens",
//     date: "July 6, 2020 • 03:29 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 128,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
//   {
//     id: 2,
//     name: "Darlene Robertson",
//     date: "July 6, 2020 • 03:29 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 82,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
//   {
//     id: 3,
//     name: "Kathryn Murphy",
//     date: "June 6, 2020 • 07:39 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 74,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
// ];

// /* ===================== Page ===================== */

// const ProductDetailsPage = () => {
//   const params = useParams();
//   const slug = params?.slug as string;
//   const router = useRouter();

//   const { cart, addToCartMutation, handleAdjustQuantity, removeFromCartMutation, getOrderLineIdByVariantId } = useCart();
//   const { customer } = useUser();
//   const { items: localItems, addItem: addLocalItem, updateQuantity: updateLocalQuantity, removeItem: removeLocalItem } = useLocalCart();

//   const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState<"Product Detail" | "Reviews" | "Related Product">("Product Detail");
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

//   const { data, loading, error } = useQuery<GetProductDetailsData>(
//     GET_PRODUCT_DETAILS,
//     { variables: { slug }, skip: !slug }
//   );

//   console.log("[product] data:", data);
//   console.log("[product] loading:", selectedVariant, quantity,);
  
//   useEffect(() => {
//     if (data?.product?.variants?.length) {
//       const first = data.product.variants.find((v) => v?.id);
//       if (first) setSelectedVariant(first as ProductVariant);
//     }
//   }, [data]);

//   const product = data?.product ?? null;

//   /* ---------- Images ---------- */
//   const productImages = useMemo(() => {
//     if (!product) return ["/api/placeholder/400/400"];
//     const imgs: string[] = [];
//     if (product.featuredAsset?.preview) imgs.push(product.featuredAsset.preview);
//     for (const a of product.assets ?? []) {
//       if (a?.preview && a.preview !== product.featuredAsset?.preview)
//         imgs.push(a.preview);
//     }
//     return imgs.length ? imgs : ["/api/placeholder/400/400"];
//   }, [product]);

//   const mainImageSrc = productImages[selectedImage] ?? "/api/placeholder/400/400";

//   /* ---------- Variants ---------- */
//   const variants: ProductVariant[] = useMemo(
//     () => (product?.variants ?? []).filter((v): v is ProductVariant => Boolean(v?.id)),
//     [product]
//   );

//   /* ---------- Related products ---------- */
//   const relatedProducts = useMemo(() => {
//     return (product?.customFields?.relatedProducts?.variants ?? [])
//       .filter((v) => v?.product?.enabled)
//       .slice(0, 4)
//       .map((v) => ({
//         id: v!.id,
//         name: v!.product!.name,
//         price: `₦${v!.price.toLocaleString()}`,
//         image:
//           v!.featuredAsset?.preview ||
//           v!.product!.featuredAsset?.preview ||
//           "/api/placeholder/200/200",
//         rating: 4.5,
//         slug: v!.product!.slug,
//       }));
//   }, [product]);

//   /* ---------- Price ---------- */
//   const currentPrice = selectedVariant?.priceWithTax ?? variants[0]?.priceWithTax ?? 0;
//   const currency = selectedVariant?.currencyCode ?? variants[0]?.currencyCode ?? "NGN";
//   const currencySymbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
//   const formattedPrice = (currentPrice / 100).toLocaleString();

//   /* ---------- Plain-text description (strips HTML tags) ---------- */
//   const plainDescription = useMemo(
//     () => stripHtml(product?.description),
//     [product?.description]
//   );

//   /* ---------- Stock limit for the selected variant ---------- */
//   const stockLimit = useMemo(
//     () => parseStockLevel(selectedVariant?.stockLevel),
//     [selectedVariant?.stockLevel]
//   );

//   const isOutOfStock = stockLimit <= 0;

//   // ─── Quantity from cart — reads directly from cart/localItems by variantId ──
//   const cartQuantity = useMemo(() => {
//     if (!selectedVariant) return 0;

//     if (customer) {
//       const line = (cart?.activeOrder?.lines ?? []).find(
//         (l: any) =>
//           l?.productVariant?.id === selectedVariant.id ||
//           l?.productVariant?.product?.slug === slug
//       );
//       return line?.quantity ?? 0;
//     } else {
//       const item = localItems.find(
//         (it) => it.id === selectedVariant.id || it.slug === slug
//       );
//       return item?.quantity ?? 0;
//     }
//   }, [selectedVariant, customer, cart, localItems, slug]);

//   useEffect(() => {
//     if (cartQuantity > 0) {
//       setQuantity(cartQuantity);
//     } else {
//       setQuantity(1);
//     }
//   }, [cartQuantity, selectedVariant?.id]);

//   /* ---------- Core cart action ---------- */
//   const addVariantToCart = useCallback(
//     async (action: ActionKey): Promise<boolean> => {
//       if (!selectedVariant) {
//         toast.error("Please select a variant");
//         return false;
//       }

//       // ── Stock check before adding ──
//       const limit = parseStockLevel(selectedVariant.stockLevel);

//       if (limit <= 0) {
//         toast.error("This item is out of stock");
//         return false;
//       }
//       if (quantity > limit) {
//         toast.error(`Only ${limit} unit(s) available in stock`);
//         return false;
//       }

//       setLoadingAction(action);
//       try {
//         addLocalItem({
//           id: selectedVariant.id,
//           name: product?.name ?? selectedVariant.name,
//           slug: slug ?? "",
//           priceWithTax: selectedVariant.priceWithTax,
//           currencyCode: selectedVariant.currencyCode ?? "NGN",
//           image: mainImageSrc !== "/api/placeholder/400/400" ? mainImageSrc : undefined,
//           quantity,
//         });

//         if (customer) {
//           const result = await addToCartMutation({
//             productVariantId: selectedVariant.id,
//             quantity,
//           });

//           if (result?.__typename === "InsufficientStockError") {
//             toast.error(`Only ${result.quantityAvailable} item(s) available in stock.`);
//             return false;
//           }
//           if (result?.errorCode) {
//             toast.error(`Could not add to cart: ${result.message ?? result.errorCode}`);
//             return false;
//           }
//         }

//         toast.success("Added to cart!", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         });

//         return true;
//       } catch (e: any) {
//         console.error("Add to cart error:", e);
//         toast.error(e?.message ?? "Could not add to cart. Please try again.");
//         return false;
//       } finally {
//         setLoadingAction(null);
//       }
//     },
//     [selectedVariant, quantity, product, slug, mainImageSrc, customer, addLocalItem, addToCartMutation]
//   );

//   // ─── Adjust quantity directly from product detail page ────────────────────
//   const adjustCartQuantity = useCallback(
//     async (newQty: number) => {
//       if (!selectedVariant) return;

//       // ── Stock check: don\'t allow increasing beyond available stock ──
//       if (newQty > quantity) {
//         const limit = parseStockLevel(selectedVariant.stockLevel);
//         console.log("[stock] adjustCartQuantity check:", {
//           variant: selectedVariant.name,
//           stockLevel: selectedVariant.stockLevel,
//           currentQty: quantity,
//           newQty,
//           limit,
//         });
//         if (newQty > limit) {
//           toast.error(
//             limit <= 0
//               ? "This item is out of stock"
//               : `Only ${limit} unit(s) available in stock`
//           );
//           return;
//         }
//       }

//       setQuantity(Math.max(1, newQty));

//       if (cartQuantity === 0) return;

//       if (newQty <= 0) {
//         removeLocalItem(selectedVariant.id);
//         if (customer) {
//           const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
//           if (orderLineId) {
//             try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
//           }
//         }
//         return;
//       }

//       updateLocalQuantity(selectedVariant.id, newQty);
//       if (customer) {
//         const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
//         if (orderLineId) {
//           try { await handleAdjustQuantity(orderLineId, newQty); } catch (e) { console.error(e); }
//         }
//       }
//     },
//     [selectedVariant, cartQuantity, customer, removeLocalItem, updateLocalQuantity, getOrderLineIdByVariantId, removeFromCartMutation, handleAdjustQuantity]
//   );

//   const handleAddToCart = () => addVariantToCart("cart");
//   const handleBuyNow = async () => {
//     const ok = await addVariantToCart("buy");
//     if (ok) router.push("/checkout");
//   };
//   const handlePayLater = async () => {
//     const ok = await addVariantToCart("later");
//     if (ok) router.push("/checkout?method=installment");
//   };

//   const anyLoading = loadingAction !== null;

//   /* ---------- Loading skeleton ---------- */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="space-y-4">
//                 <div className="bg-gray-200 rounded-lg aspect-square" />
//                 <div className="flex gap-2">
//                   {[1, 2, 3, 4, 5, 6].map((i) => (
//                     <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-6">
//                 <div className="h-8 bg-gray-200 rounded w-3/4" />
//                 <div className="h-6 bg-gray-200 rounded w-1/2" />
//                 <div className="h-8 bg-gray-200 rounded w-1/4" />
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   /* ---------- Error ---------- */
//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 text-center">
//             <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
//             <p className="text-gray-600">
//               The product you&apos;re looking for doesn&apos;t exist or has been removed.
//             </p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   /* ===================== Render ===================== */
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <ToastContainer />
//       <Navbar />

//       <div className="mx-auto px-6 py-6">
//         {/* ── Product section ── */}
//         <div className="mb-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//             {/* Left — images */}
//             <div className="space-y-8">
//               <div className="w-full bg-gray-100 rounded-lg p-4 aspect-square flex items-center justify-center">
//                 <img
//                   src={mainImageSrc}
//                   alt={product.name}
//                   className="max-w-full max-h-full object-contain"
//                 />
//               </div>
//               <div className="flex gap-2 overflow-x-auto">
//                 {productImages.map((image, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setSelectedImage(index)}
//                     aria-label={`View image ${index + 1}`}
//                     className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 p-2 ${
//                       selectedImage === index ? "border-[#00AAFF]" : "border-gray-200"
//                     }`}
//                   >
//                     <img
//                       src={image}
//                       alt={`Thumbnail ${index + 1}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Right — info */}
//             <div className="space-y-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
//                 <div className="flex items-center gap-2 mb-4">
//                   <div className="flex items-center">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <svg key={star} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </svg>
//                     ))}
//                     <span className="text-gray-600 ml-2">(1,250 reviews)</span>
//                   </div>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900 mb-6">
//                   {currencySymbol}{formattedPrice}
//                 </div>
//               </div>

//               {/* Variant selector */}
//               {variants.length > 1 && (
//                 <div className="space-y-3">
//                   <label className="text-gray-700 font-medium">Variant:</label>
//                   <div className="flex flex-wrap gap-2">
//                     {variants.map((variant) => (
//                       <button
//                         key={variant.id}
//                         onClick={() => setSelectedVariant(variant)}
//                         className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                           selectedVariant?.id === variant.id
//                             ? "border-blue-500 bg-blue-50 text-blue-700"
//                             : "border-gray-300 hover:bg-gray-50"
//                         }`}
//                       >
//                         {variant.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Stock */}
//               {selectedVariant && (
//                 <div className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-gray-600"}`}>
//                   {isOutOfStock
//                     ? "Out of stock"
//                     : Number.isFinite(stockLimit)
//                     ? `Only ${stockLimit} unit(s) left in stock`
//                     : "In stock"}
//                 </div>
//               )}

//               {/* Description — HTML tags stripped */}
//               {plainDescription && (
//                 <p className="text-gray-700">{plainDescription}</p>
//               )}

//               {/* ── Quantity — shows cart quantity if already in cart ── */}
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-700 font-medium">Qty:</span>
//                 <button
//                   aria-label="Decrease quantity"
//                   onClick={() => adjustCartQuantity(quantity - 1)}
//                   disabled={anyLoading}
//                   className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50"
//                 >
//                   −
//                 </button>
//                 <span className="w-8 text-center font-medium">{quantity}</span>
//                 <button
//                   aria-label="Increase quantity"
//                   onClick={() => adjustCartQuantity(quantity + 1)}
//                   disabled={anyLoading || quantity >= stockLimit}
//                   className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50"
//                 >
//                   +
//                 </button>
//                 {cartQuantity > 0 && (
//                   <span className="text-xs text-green-600 font-medium ml-1">
//                     ({cartQuantity} in cart)
//                   </span>
//                 )}
//               </div>

//               {/* ── Action buttons ── */}
//               <div className="flex flex-col md:flex-row gap-2 md:gap-4">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={anyLoading || !selectedVariant || isOutOfStock}
//                   className="flex-1 border-2 border-[#242425] text-[#242425] py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "cart" ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#242425] border-t-transparent" />
//                       Adding...
//                     </>
//                   ) : isOutOfStock ? "Out of Stock" : cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
//                 </button>

//                 <button
//                   onClick={handleBuyNow}
//                   disabled={anyLoading || !selectedVariant || isOutOfStock}
//                   className="flex-1 px-6 py-3 bg-[#242425] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "buy" ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                       Processing...
//                     </>
//                   ) : "Buy Now"}
//                 </button>

//                 <button
//                   onClick={handlePayLater}
//                   disabled={anyLoading || !selectedVariant || isOutOfStock}
//                   className="flex-1 bg-[#ff0000] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#751c1c] flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "later" ? (
//                     <>
//                       <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                       Processing...
//                     </>
//                   ) : "Pay Later"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Tabs ── */}
//         <div>
//           <div className="border-b border-gray-200">
//             <nav className="flex">
//               {(["Product Detail", "Reviews", "Related Product"] as const).map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
//                     activeTab === tab
//                       ? "border-black text-black"
//                       : "border-transparent text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="w-full p-4 text-justify pb-12">
//             {activeTab === "Related Product" ? (
//               <div>
//                 <h3 className="text-xl font-bold mb-6">Related Products</h3>
//                 {relatedProducts.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {relatedProducts.map((rp) => (
//                       <div
//                         key={rp.id}
//                         className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
//                         onClick={() => router.push(`/products/${rp.slug}`)}
//                       >
//                         <div className="bg-gray-100 p-4 aspect-square flex items-center justify-center">
//                           <img src={rp.image} alt={rp.name} className="max-w-full max-h-full object-contain" />
//                         </div>
//                         <div className="p-4">
//                           <h4 className="font-medium text-gray-900 mb-2">{rp.name}</h4>
//                           <div className="flex items-center justify-between">
//                             <span className="text-lg font-bold text-gray-900">{rp.price}</span>
//                             <div className="flex items-center">
//                               <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                               <span className="text-sm text-gray-600 ml-1">{rp.rating}</span>
//                             </div>
//                           </div>
//                           <button className="w-full mt-3 bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors">
//                             View Product
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-center py-8">No related products found</p>
//                 )}
//               </div>
//             ) : (
//               <LocalProductCard status={activeTab} product={product} />
//             )}
//           </div>
//         </div>
//       </div>

//       <Suscribe />
//       <Footer />
//     </div>
//   );
// };

// /* ===================== LocalProductCard ===================== */

// function LocalProductCard({
//   status,
//   product,
// }: {
//   status: "Product Detail" | "Reviews";
//   product: ProductDetails;
// }) {
//   if (status === "Reviews") {
//     const totalReviews = ratingData.reduce((a, b) => a + b.count, 0);
//     const [isOpen, setIsOpen] = useState(false);

//     return (
//       <div className="space-y-8">
//         <div className="flex gap-10 border border-[#E4E9EE] rounded-xl p-6">
//           <div className="flex gap-3 items-center min-w-40">
//             <div className="relative w-20 h-20 flex items-center justify-center">
//               <svg className="absolute inset-0" viewBox="0 0 100 100">
//                 <circle cx="50" cy="50" r="45" fill="none" stroke="#FFA133" strokeWidth="6" />
//               </svg>
//               <span className="text-3xl font-semibold text-gray-800">4.8</span>
//             </div>
//             <div>
//               <div className="flex mt-1">
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <Star key={i} className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" />
//                 ))}
//               </div>
//               <p className="text-xs text-gray-500 mt-2">
//                 from {totalReviews.toLocaleString()} reviews
//               </p>
//             </div>
//           </div>
//           <div className="flex-1 space-y-2">
//             {ratingData.map((r) => (
//               <div key={r.stars} className="flex items-center gap-3">
//                 <span className="flex gap-1 w-8 text-sm">
//                   {r.stars}.0
//                   <Star className="w-5 h-5 fill-[#FFA133] text-[#FFA133]" />
//                 </span>
//                 <div className="flex-1 h-2 bg-gray-200 rounded">
//                   <div
//                     className="h-2 bg-black rounded"
//                     style={{ width: `${(r.count / totalReviews) * 100}%` }}
//                   />
//                 </div>
//                 <span className="w-12 text-sm text-right text-gray-500">{r.count}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="grid grid-cols-12 gap-8">
//           <aside className="col-span-2 space-y-6 text-[#818B9C]">
//             <div>
//               <h3 className="mb-3 text-black">Rating</h3>
//               {[5, 4, 3, 2, 1].map((r) => (
//                 <label key={r} className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" />
//                   <Star className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" /> {r} Star
//                 </label>
//               ))}
//             </div>
//             <div>
//               <h3 className="text-black mb-3">Review Topics</h3>
//               {["Product Quality", "Product Price", "Shipment"].map((t) => (
//                 <label key={t} className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" /> {t}
//                 </label>
//               ))}
//             </div>
//           </aside>

//           <div className="col-span-10 space-y-6">
//             <div className="flex items-center justify-between mb-6">
//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Review Lists</h2>
//                 <div className="flex gap-3">
//                   <button className="px-4 py-2 bg-red-500 text-white rounded-lg">All Reviews</button>
//                   <button className="px-4 py-2 border rounded-lg">With Photo & Video</button>
//                   <button className="px-4 py-2 border rounded-lg">With Description</button>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsOpen(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
//               >
//                 <Image src="/Edit Square.png" alt="Write a review" width={18} height={18} />
//                 Write a review
//               </button>
//             </div>

//             {isOpen && <ReviewModal onClose={() => setIsOpen(false)} />}

//             {reviews.map((review) => (
//               <div key={review.id} className="border-b border-[#E4E9EE] flex justify-between pb-6 space-y-3">
//                 <div className="flex flex-col gap-3">
//                   <div className="flex gap-1">
//                     {[1, 2, 3, 4, 5].map((i) => (
//                       <Star
//                         key={i}
//                         className={`w-4 h-4 ${i <= review.rating ? "fill-[#FFA133] text-[#FFA133]" : "text-gray-300"}`}
//                       />
//                     ))}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-700">{review.text}</p>
//                     <p className="text-xs text-gray-500">{review.date}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <img src={review.image} alt={review.name} className="w-8 h-8 object-cover rounded-full" />
//                     <p className="font-semibold">{review.name}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-1">
//                   <button className="text-sm hover:bg-gray-100">
//                     <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
//                       <Image src="/like.png" alt="Like" width={18} height={18} />
//                       {review.likes}
//                     </div>
//                   </button>
//                   <button className="text-sm hover:bg-gray-100">
//                     <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
//                       <Image src="/dislike.png" alt="Dislike" width={18} height={18} />
//                       {review.dislikes}
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const cf = product.customFields ?? {};
//   const specs = [
//     { label: "Power Output", value: cf.powerOutput },
//     { label: "Efficiency", value: cf.efficiency },
//     { label: "Voltage", value: cf.voltage },
//     { label: "Dimensions", value: cf.dimensions },
//     { label: "Weight", value: cf.weight },
//     { label: "Frame Material", value: cf.frameMaterial },
//     { label: "Surface Material", value: cf.surfaceMaterial },
//   ].filter((s) => Boolean(s.value));

//   // Strip HTML tags from product description in this tab too
//   const plainDescription = stripHtml(product.description);

//   return (
//     <div className="space-y-6">
//       {plainDescription && (
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
//           <p className="text-[#818B9C] leading-relaxed">{plainDescription}</p>
//         </div>
//       )}
//       {specs.length > 0 && (
//         <div className="w-full">
//           <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
//             {specs.map((s, idx) => (
//               <div key={idx} className="flex items-center justify-between">
//                 <span className="text-[#818B9C]">{s.label}</span>
//                 <span className="font-medium text-[#141718]">{s.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ProductDetailsPage;

// /* ===================== ReviewModal ===================== */

// type ReviewModalProps = { onClose: () => void };

// function ReviewModal({ onClose }: ReviewModalProps) {
//   const [rating, setRating] = useState(0);
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     if (submitted) {
//       const t = setTimeout(onClose, 1000);
//       return () => clearTimeout(t);
//     }
//   }, [submitted, onClose]);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/50" onClick={!submitted ? onClose : undefined} />
//       <div className="relative bg-white rounded-xl p-4 w-full max-w-md z-10">
//         {!submitted ? (
//           <>
//             <div className="flex justify-between mb-6">
//               <h3 className="text-lg font-semibold">Review</h3>
//               <button onClick={onClose} aria-label="Close review modal">
//                 <Image src="/close-circle.png" alt="Close" width={22} height={22} />
//               </button>
//             </div>
//             <div className="mb-4">
//               <h3 className="text-xs mb-1">Rating</h3>
//               <StarRating value={rating} onChange={setRating} />
//             </div>
//             <div className="grid gap-2">
//               <label className="text-xs text-[#15171C]">
//                 Leave your comments here for other customers
//               </label>
//               <textarea
//                 className="w-full border border-[#E3EFFC] bg-[#FCFCFD] rounded-lg p-3 text-sm"
//                 rows={4}
//                 placeholder="Comment"
//               />
//             </div>
//             <div className="flex justify-end mt-4">
//               <button
//                 onClick={() => setSubmitted(true)}
//                 disabled={rating === 0}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
//               >
//                 Submit
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-10 gap-4">
//             <Image src="/tick-circle.png" alt="Success" width={80} height={80} />
//             <p className="text-sm font-medium text-gray-700">Successful</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useParams } from "next/navigation";
// import React, { useMemo, useState, useEffect, useCallback } from "react";
// import { useQuery, useLazyQuery } from "@apollo/client/react";
// import { GET_PRODUCT_DETAILS } from "@/graphql/queries";
// import Navbar from "@/Components/Navbar/Navbar";
// import Footer from "@/Components/Footer/Footer";
// import { useCart } from "@/context/CartContext";
// import { useLocalCart } from "@/context/LocalCartContext";
// import { useUser } from "@/context/UserContext";
// import Suscribe from "@/Components/Suscribe/Suscribe";
// import { Star } from "lucide-react";
// import Image from "next/image";
// import StarRating from "../components/StarRating";
// import { useRouter } from "next/navigation";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { stripHtml } from "@/utils/stripHtml";

// /* ===================== Types ===================== */

// type ProductVariant = {
//   id: string;
//   name: string;
//   sku: string;
//   stockLevel: string;
//   currencyCode: string;
//   price: number;
//   priceWithTax: number;
//   featuredAsset?: { id: string; preview: string };
//   assets: { id: string; preview: string }[];
// };

// type ProductDetails = {
//   id: string;
//   name: string;
//   description: string;
//   collections: { name: string; id: string; slug: string }[];
//   customFields?: {
//     powerOutput?: string;
//     efficiency?: string;
//     voltage?: string;
//     dimensions?: string;
//     weight?: string;
//     frameMaterial?: string;
//     surfaceMaterial?: string;
//     relatedProducts?: {
//       variants: Array<{
//         id: string;
//         name: string;
//         featuredAsset?: { preview: string };
//         price: number;
//         product: {
//           id: string;
//           name: string;
//           slug: string;
//           enabled: boolean;
//           assets: { preview: string }[];
//           featuredAsset?: { id: string; preview: string };
//         };
//       }>;
//     };
//   };
//   featuredAsset?: { id: string; preview: string };
//   assets: { id: string; preview: string }[];
//   variants: ProductVariant[];
// };

// type GetProductDetailsData = { product: ProductDetails | null };
// type ActionKey = "cart" | "buy" | "later";

// /* ===================== Static data ===================== */

// const ratingData = [
//   { stars: 5, count: 2823 },
//   { stars: 4, count: 38 },
//   { stars: 3, count: 3 },
//   { stars: 2, count: 1 },
//   { stars: 1, count: 0 },
// ];

// const reviews = [
//   {
//     id: 1,
//     name: "Daniel Stevens",
//     date: "July 6, 2020 • 03:29 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 128,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
//   {
//     id: 2,
//     name: "Darlene Robertson",
//     date: "July 6, 2020 • 03:29 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 82,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
//   {
//     id: 3,
//     name: "Kathryn Murphy",
//     date: "June 6, 2020 • 07:39 PM",
//     rating: 5,
//     text: "This is amazing product I have.",
//     likes: 74,
//     dislikes: 2,
//     image: "/reviewimg.png",
//   },
// ];

// /* ===================== Page ===================== */

// const ProductDetailsPage = () => {
//   const params = useParams();
//   const slug = params?.slug as string;
//   const router = useRouter();

//   const { cart, addToCartMutation, handleAdjustQuantity, removeFromCartMutation, getOrderLineIdByVariantId } = useCart();
//   const { customer } = useUser();
//   const { items: localItems, addItem: addLocalItem, updateQuantity: updateLocalQuantity, removeItem: removeLocalItem } = useLocalCart();

//   const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [activeTab, setActiveTab] = useState<"Product Detail" | "Reviews" | "Related Product">("Product Detail");
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

//   // ── Live stock level — updated after every add/reduce action ──────────────
//   // Starts as the value from initial query, then refreshed by refetching
//   const [liveStockLevel, setLiveStockLevel] = useState<string | null>(null);

//   const { data, loading, error } = useQuery<GetProductDetailsData>(
//     GET_PRODUCT_DETAILS,
//     { variables: { slug }, skip: !slug, fetchPolicy: "cache-and-network" }
//   );

//   // Lazy query for refetching stock level after add/remove
//   // variables are passed at call time, not at declaration
//   const [refetchStock] = useLazyQuery<GetProductDetailsData>(GET_PRODUCT_DETAILS, {
//     fetchPolicy: "network-only",
//   });

//   useEffect(() => {
//     if (data?.product?.variants?.length) {
//       const first = data.product.variants.find((v) => v?.id);
//       if (first) {
//         setSelectedVariant(first as ProductVariant);
//         setLiveStockLevel(first.stockLevel);
//       }
//     }
//   }, [data]);

//   // When user switches variant, reset liveStockLevel to the variant's current value
//   useEffect(() => {
//     if (selectedVariant) {
//       setLiveStockLevel(selectedVariant.stockLevel);
//     }
//   }, [selectedVariant?.id]);

//   const product = data?.product ?? null;

//   /* ---------- Images ---------- */
//   const productImages = useMemo(() => {
//     if (!product) return ["/api/placeholder/400/400"];
//     const imgs: string[] = [];
//     if (product.featuredAsset?.preview) imgs.push(product.featuredAsset.preview);
//     for (const a of product.assets ?? []) {
//       if (a?.preview && a.preview !== product.featuredAsset?.preview)
//         imgs.push(a.preview);
//     }
//     return imgs.length ? imgs : ["/api/placeholder/400/400"];
//   }, [product]);

//   const mainImageSrc = productImages[selectedImage] ?? "/api/placeholder/400/400";

//   /* ---------- Variants ---------- */
//   const variants: ProductVariant[] = useMemo(
//     () => (product?.variants ?? []).filter((v): v is ProductVariant => Boolean(v?.id)),
//     [product]
//   );

//   /* ---------- Related products ---------- */
//   const relatedProducts = useMemo(() => {
//     return (product?.customFields?.relatedProducts?.variants ?? [])
//       .filter((v) => v?.product?.enabled)
//       .slice(0, 4)
//       .map((v) => ({
//         id: v!.id,
//         name: v!.product!.name,
//         price: `₦${v!.price.toLocaleString()}`,
//         image:
//           v!.featuredAsset?.preview ||
//           v!.product!.featuredAsset?.preview ||
//           "/api/placeholder/200/200",
//         rating: 4.5,
//         slug: v!.product!.slug,
//       }));
//   }, [product]);

//   /* ---------- Price ---------- */
//   const currentPrice = selectedVariant?.priceWithTax ?? variants[0]?.priceWithTax ?? 0;
//   const currency = selectedVariant?.currencyCode ?? variants[0]?.currencyCode ?? "NGN";
//   const currencySymbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
//   const formattedPrice = (currentPrice / 100).toLocaleString();

//   /* ---------- Plain-text description ---------- */
//   const plainDescription = useMemo(
//     () => stripHtml(product?.description),
//     [product?.description]
//   );

//   /* ---------- Stock logic ----------
//    * - "OUT_OF_STOCK" or empty → disabled, show "Out of Stock"
//    * - "X_UNITS_LEFT"          → show "Only X unit(s) left", allow adding up to X
//    * - "IN_STOCK"              → show "In stock", allow adding (refetch after each add)
//    */
//   const isOutOfStock = !liveStockLevel || liveStockLevel === "OUT_OF_STOCK";

//   const unitsLeft: number | null = useMemo(() => {
//     if (!liveStockLevel) return null;
//     const match = liveStockLevel.match(/^(\d+)_UNITS_LEFT$/);
//     return match ? parseInt(match[1], 10) : null;
//   }, [liveStockLevel]);

//   // + button disabled when: out of stock OR quantity already at the X_UNITS_LEFT limit
//   const isPlusDisabled = isOutOfStock || (unitsLeft !== null && quantity >= unitsLeft);

//   /* ---------- Refetch stock from backend ---------- */
//   const refreshStockLevel = useCallback(async () => {
//     try {
//       const result = await refetchStock({ variables: { slug } });
//       const freshVariant = result.data?.product?.variants?.find(
//         (v) => v.id === selectedVariant?.id
//       );
//       if (freshVariant) {
//         console.log("[stock] refreshed:", freshVariant.stockLevel);
//         setLiveStockLevel(freshVariant.stockLevel);
//         return freshVariant.stockLevel;
//       }
//     } catch (e) {
//       console.error("[stock] refetch failed:", e);
//     }
//     return liveStockLevel;
//   }, [refetchStock, selectedVariant?.id, liveStockLevel]);

//   /* ---------- Quantity from cart ---------- */
//   const cartQuantity = useMemo(() => {
//     if (!selectedVariant) return 0;
//     if (customer) {
//       const line = (cart?.activeOrder?.lines ?? []).find(
//         (l: any) =>
//           l?.productVariant?.id === selectedVariant.id ||
//           l?.productVariant?.product?.slug === slug
//       );
//       return line?.quantity ?? 0;
//     } else {
//       const item = localItems.find(
//         (it) => it.id === selectedVariant.id || it.slug === slug
//       );
//       return item?.quantity ?? 0;
//     }
//   }, [selectedVariant, customer, cart, localItems, slug]);

//   useEffect(() => {
//     if (cartQuantity > 0) {
//       setQuantity(cartQuantity);
//     } else {
//       setQuantity(1);
//     }
//   }, [cartQuantity, selectedVariant?.id]);

//   /* ---------- Core cart action ---------- */
//   const addVariantToCart = useCallback(
//     async (action: ActionKey): Promise<boolean> => {
//       if (!selectedVariant) {
//         toast.error("Please select a variant");
//         return false;
//       }

//       // Always check live stock before adding
//       if (isOutOfStock) {
//         toast.error("This item is out of stock");
//         return false;
//       }

//       // If we know exact units left, enforce it
//       if (unitsLeft !== null && quantity > unitsLeft) {
//         toast.error(`Only ${unitsLeft} unit(s) available in stock`);
//         return false;
//       }

//       setLoadingAction(action);
//       try {
//         addLocalItem({
//           id: selectedVariant.id,
//           name: product?.name ?? selectedVariant.name,
//           slug: slug ?? "",
//           priceWithTax: selectedVariant.priceWithTax,
//           currencyCode: selectedVariant.currencyCode ?? "NGN",
//           image: mainImageSrc !== "/api/placeholder/400/400" ? mainImageSrc : undefined,
//           quantity,
//         });

//         if (customer) {
//           const result = await addToCartMutation({
//             productVariantId: selectedVariant.id,
//             quantity,
//           });

//           if (result?.__typename === "InsufficientStockError") {
//             toast.error(`Only ${result.quantityAvailable} item(s) available in stock.`);
//             await refreshStockLevel();
//             return false;
//           }
//           if (result?.errorCode) {
//             toast.error(`Could not add to cart: ${result.message ?? result.errorCode}`);
//             return false;
//           }
//         }

//         // ── Refetch stock after successful add so UI reflects new availability ──
//         await refreshStockLevel();

//         toast.success("Added to cart!", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         });

//         return true;
//       } catch (e: any) {
//         console.error("Add to cart error:", e);
//         toast.error(e?.message ?? "Could not add to cart. Please try again.");
//         return false;
//       } finally {
//         setLoadingAction(null);
//       }
//     },
//     [selectedVariant, quantity, product, slug, mainImageSrc, customer, addLocalItem, addToCartMutation, isOutOfStock, unitsLeft, refreshStockLevel]
//   );

//   /* ---------- Adjust quantity ---------- */
//   const adjustCartQuantity = useCallback(
//     async (newQty: number) => {
//       if (!selectedVariant) return;

//       // Block incrementing beyond known units
//       if (newQty > quantity) {
//         if (isOutOfStock) {
//           toast.error("This item is out of stock");
//           return;
//         }
//         if (unitsLeft !== null && newQty > unitsLeft) {
//           toast.error(`Only ${unitsLeft} unit(s) available in stock`);
//           return;
//         }
//       }

//       setQuantity(Math.max(1, newQty));

//       if (cartQuantity === 0) return;

//       if (newQty <= 0) {
//         removeLocalItem(selectedVariant.id);
//         if (customer) {
//           const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
//           if (orderLineId) {
//             try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
//           }
//         }
//         // Refetch stock after removal — may go back to IN_STOCK
//         await refreshStockLevel();
//         return;
//       }

//       updateLocalQuantity(selectedVariant.id, newQty);
//       if (customer) {
//         const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
//         if (orderLineId) {
//           try {
//             await handleAdjustQuantity(orderLineId, newQty);
//             // Refetch after adjust
//             await refreshStockLevel();
//           } catch (e) { console.error(e); }
//         }
//       }
//     },
//     [selectedVariant, quantity, cartQuantity, customer, isOutOfStock, unitsLeft,
//      removeLocalItem, updateLocalQuantity, getOrderLineIdByVariantId,
//      removeFromCartMutation, handleAdjustQuantity, refreshStockLevel]
//   );

//   const handleAddToCart = () => addVariantToCart("cart");
//   const handleBuyNow = async () => {
//     const ok = await addVariantToCart("buy");
//     if (ok) router.push("/checkout");
//   };
//   const handlePayLater = async () => {
//     const ok = await addVariantToCart("later");
//     if (ok) router.push("/checkout?method=installment");
//   };

//   const anyLoading = loadingAction !== null;

//   /* ---------- Loading skeleton ---------- */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="space-y-4">
//                 <div className="bg-gray-200 rounded-lg aspect-square" />
//                 <div className="flex gap-2">
//                   {[1, 2, 3, 4, 5, 6].map((i) => (
//                     <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
//                   ))}
//                 </div>
//               </div>
//               <div className="space-y-6">
//                 <div className="h-8 bg-gray-200 rounded w-3/4" />
//                 <div className="h-6 bg-gray-200 rounded w-1/2" />
//                 <div className="h-8 bg-gray-200 rounded w-1/4" />
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   /* ---------- Error ---------- */
//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg shadow-sm p-6 text-center">
//             <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
//             <p className="text-gray-600">
//               The product you&apos;re looking for doesn&apos;t exist or has been removed.
//             </p>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   /* ===================== Render ===================== */
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <ToastContainer />
//       <Navbar />

//       <div className="mx-auto px-6 py-6">
//         <div className="mb-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//             {/* Left — images */}
//             <div className="space-y-8">
//               <div className="w-full bg-gray-100 rounded-lg p-4 aspect-square flex items-center justify-center">
//                 <img src={mainImageSrc} alt={product.name} className="max-w-full max-h-full object-contain" />
//               </div>
//               <div className="flex gap-2 overflow-x-auto">
//                 {productImages.map((image, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setSelectedImage(index)}
//                     aria-label={`View image ${index + 1}`}
//                     className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 p-2 ${
//                       selectedImage === index ? "border-[#00AAFF]" : "border-gray-200"
//                     }`}
//                   >
//                     <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Right — info */}
//             <div className="space-y-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
//                 <div className="flex items-center gap-2 mb-4">
//                   <div className="flex items-center">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <svg key={star} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </svg>
//                     ))}
//                     <span className="text-gray-600 ml-2">(1,250 reviews)</span>
//                   </div>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900 mb-6">
//                   {currencySymbol}{formattedPrice}
//                 </div>
//               </div>

//               {/* Variant selector */}
//               {variants.length > 1 && (
//                 <div className="space-y-3">
//                   <label className="text-gray-700 font-medium">Variant:</label>
//                   <div className="flex flex-wrap gap-2">
//                     {variants.map((variant) => (
//                       <button
//                         key={variant.id}
//                         onClick={() => setSelectedVariant(variant)}
//                         className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
//                           selectedVariant?.id === variant.id
//                             ? "border-blue-500 bg-blue-50 text-blue-700"
//                             : "border-gray-300 hover:bg-gray-50"
//                         }`}
//                       >
//                         {variant.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Stock status */}
//               {selectedVariant && (
//                 <div className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
//                   {isOutOfStock
//                     ? "Out of stock"
//                     : unitsLeft !== null
//                     ? `Only ${unitsLeft} unit(s) left in stock`
//                     : "In stock"}
//                 </div>
//               )}

//               {/* Description */}
//               {plainDescription && (
//                 <p className="text-gray-700">{plainDescription}</p>
//               )}

//               {/* Quantity controls */}
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-700 font-medium">Qty:</span>
//                 <button
//                   aria-label="Decrease quantity"
//                   onClick={() => adjustCartQuantity(quantity - 1)}
//                   disabled={anyLoading}
//                   className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50"
//                 >
//                   −
//                 </button>
//                 <span className="w-8 text-center font-medium">{quantity}</span>
//                 <button
//                   aria-label="Increase quantity"
//                   onClick={() => adjustCartQuantity(quantity + 1)}
//                   disabled={anyLoading || isPlusDisabled}
//                   className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   +
//                 </button>
//                 {cartQuantity > 0 && (
//                   <span className="text-xs text-green-600 font-medium ml-1">
//                     ({cartQuantity} in cart)
//                   </span>
//                 )}
//               </div>

//               {/* Action buttons */}
//               <div className="flex flex-col md:flex-row gap-2 md:gap-4">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={anyLoading || !selectedVariant || isOutOfStock}
//                   className="flex-1 border-2 border-[#242425] text-[#242425] py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "cart" ? (
//                     <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#242425] border-t-transparent" />Adding...</>
//                   ) : isOutOfStock ? "Out of Stock" : cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
//                 </button>

//                 <button
//                   onClick={handleBuyNow}
//                   disabled={anyLoading || !selectedVariant || isOutOfStock}
//                   className="flex-1 px-6 py-3 bg-[#242425] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "buy" ? (
//                     <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
//                   ) : "Buy Now"}
//                 </button>

//                 <button
//                   onClick={handlePayLater}
//                   disabled={anyLoading || !selectedVariant || isOutOfStock}
//                   className="flex-1 bg-[#ff0000] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#751c1c] flex items-center justify-center gap-2"
//                 >
//                   {loadingAction === "later" ? (
//                     <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
//                   ) : "Pay Later"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div>
//           <div className="border-b border-gray-200">
//             <nav className="flex">
//               {(["Product Detail", "Reviews", "Related Product"] as const).map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
//                     activeTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="w-full p-4 text-justify pb-12">
//             {activeTab === "Related Product" ? (
//               <div>
//                 <h3 className="text-xl font-bold mb-6">Related Products</h3>
//                 {relatedProducts.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {relatedProducts.map((rp) => (
//                       <div
//                         key={rp.id}
//                         className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
//                         onClick={() => router.push(`/products/${rp.slug}`)}
//                       >
//                         <div className="bg-gray-100 p-4 aspect-square flex items-center justify-center">
//                           <img src={rp.image} alt={rp.name} className="max-w-full max-h-full object-contain" />
//                         </div>
//                         <div className="p-4">
//                           <h4 className="font-medium text-gray-900 mb-2">{rp.name}</h4>
//                           <div className="flex items-center justify-between">
//                             <span className="text-lg font-bold text-gray-900">{rp.price}</span>
//                             <div className="flex items-center">
//                               <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                               <span className="text-sm text-gray-600 ml-1">{rp.rating}</span>
//                             </div>
//                           </div>
//                           <button className="w-full mt-3 bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors">
//                             View Product
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-center py-8">No related products found</p>
//                 )}
//               </div>
//             ) : (
//               <LocalProductCard status={activeTab} product={product} />
//             )}
//           </div>
//         </div>
//       </div>

//       <Suscribe />
//       <Footer />
//     </div>
//   );
// };

// /* ===================== LocalProductCard ===================== */

// function LocalProductCard({
//   status,
//   product,
// }: {
//   status: "Product Detail" | "Reviews";
//   product: ProductDetails;
// }) {
//   if (status === "Reviews") {
//     const totalReviews = ratingData.reduce((a, b) => a + b.count, 0);
//     const [isOpen, setIsOpen] = useState(false);

//     return (
//       <div className="space-y-8">
//         <div className="flex gap-10 border border-[#E4E9EE] rounded-xl p-6">
//           <div className="flex gap-3 items-center min-w-40">
//             <div className="relative w-20 h-20 flex items-center justify-center">
//               <svg className="absolute inset-0" viewBox="0 0 100 100">
//                 <circle cx="50" cy="50" r="45" fill="none" stroke="#FFA133" strokeWidth="6" />
//               </svg>
//               <span className="text-3xl font-semibold text-gray-800">4.8</span>
//             </div>
//             <div>
//               <div className="flex mt-1">
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <Star key={i} className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" />
//                 ))}
//               </div>
//               <p className="text-xs text-gray-500 mt-2">
//                 from {totalReviews.toLocaleString()} reviews
//               </p>
//             </div>
//           </div>
//           <div className="flex-1 space-y-2">
//             {ratingData.map((r) => (
//               <div key={r.stars} className="flex items-center gap-3">
//                 <span className="flex gap-1 w-8 text-sm">
//                   {r.stars}.0
//                   <Star className="w-5 h-5 fill-[#FFA133] text-[#FFA133]" />
//                 </span>
//                 <div className="flex-1 h-2 bg-gray-200 rounded">
//                   <div className="h-2 bg-black rounded" style={{ width: `${(r.count / totalReviews) * 100}%` }} />
//                 </div>
//                 <span className="w-12 text-sm text-right text-gray-500">{r.count}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="grid grid-cols-12 gap-8">
//           <aside className="col-span-2 space-y-6 text-[#818B9C]">
//             <div>
//               <h3 className="mb-3 text-black">Rating</h3>
//               {[5, 4, 3, 2, 1].map((r) => (
//                 <label key={r} className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" />
//                   <Star className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" /> {r} Star
//                 </label>
//               ))}
//             </div>
//             <div>
//               <h3 className="text-black mb-3">Review Topics</h3>
//               {["Product Quality", "Product Price", "Shipment"].map((t) => (
//                 <label key={t} className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" /> {t}
//                 </label>
//               ))}
//             </div>
//           </aside>

//           <div className="col-span-10 space-y-6">
//             <div className="flex items-center justify-between mb-6">
//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Review Lists</h2>
//                 <div className="flex gap-3">
//                   <button className="px-4 py-2 bg-red-500 text-white rounded-lg">All Reviews</button>
//                   <button className="px-4 py-2 border rounded-lg">With Photo & Video</button>
//                   <button className="px-4 py-2 border rounded-lg">With Description</button>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsOpen(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg"
//               >
//                 <Image src="/Edit Square.png" alt="Write a review" width={18} height={18} />
//                 Write a review
//               </button>
//             </div>

//             {isOpen && <ReviewModal onClose={() => setIsOpen(false)} />}

//             {reviews.map((review) => (
//               <div key={review.id} className="border-b border-[#E4E9EE] flex justify-between pb-6 space-y-3">
//                 <div className="flex flex-col gap-3">
//                   <div className="flex gap-1">
//                     {[1, 2, 3, 4, 5].map((i) => (
//                       <Star key={i} className={`w-4 h-4 ${i <= review.rating ? "fill-[#FFA133] text-[#FFA133]" : "text-gray-300"}`} />
//                     ))}
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-700">{review.text}</p>
//                     <p className="text-xs text-gray-500">{review.date}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <img src={review.image} alt={review.name} className="w-8 h-8 object-cover rounded-full" />
//                     <p className="font-semibold">{review.name}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-1">
//                   <button className="text-sm hover:bg-gray-100">
//                     <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
//                       <Image src="/like.png" alt="Like" width={18} height={18} />
//                       {review.likes}
//                     </div>
//                   </button>
//                   <button className="text-sm hover:bg-gray-100">
//                     <div className="flex items-center border p-2 border-[#d7d7d7] rounded-sm gap-1">
//                       <Image src="/dislike.png" alt="Dislike" width={18} height={18} />
//                       {review.dislikes}
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const cf = product.customFields ?? {};
//   const specs = [
//     { label: "Power Output", value: cf.powerOutput },
//     { label: "Efficiency", value: cf.efficiency },
//     { label: "Voltage", value: cf.voltage },
//     { label: "Dimensions", value: cf.dimensions },
//     { label: "Weight", value: cf.weight },
//     { label: "Frame Material", value: cf.frameMaterial },
//     { label: "Surface Material", value: cf.surfaceMaterial },
//   ].filter((s) => Boolean(s.value));

//   const plainDescription = stripHtml(product.description);

//   return (
//     <div className="space-y-6">
//       {plainDescription && (
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
//           <p className="text-[#818B9C] leading-relaxed">{plainDescription}</p>
//         </div>
//       )}
//       {specs.length > 0 && (
//         <div className="w-full">
//           <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
//             {specs.map((s, idx) => (
//               <div key={idx} className="flex items-center justify-between">
//                 <span className="text-[#818B9C]">{s.label}</span>
//                 <span className="font-medium text-[#141718]">{s.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ProductDetailsPage;

// /* ===================== ReviewModal ===================== */

// type ReviewModalProps = { onClose: () => void };

// function ReviewModal({ onClose }: ReviewModalProps) {
//   const [rating, setRating] = useState(0);
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     if (submitted) {
//       const t = setTimeout(onClose, 1000);
//       return () => clearTimeout(t);
//     }
//   }, [submitted, onClose]);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/50" onClick={!submitted ? onClose : undefined} />
//       <div className="relative bg-white rounded-xl p-4 w-full max-w-md z-10">
//         {!submitted ? (
//           <>
//             <div className="flex justify-between mb-6">
//               <h3 className="text-lg font-semibold">Review</h3>
//               <button onClick={onClose} aria-label="Close review modal">
//                 <Image src="/close-circle.png" alt="Close" width={22} height={22} />
//               </button>
//             </div>
//             <div className="mb-4">
//               <h3 className="text-xs mb-1">Rating</h3>
//               <StarRating value={rating} onChange={setRating} />
//             </div>
//             <div className="grid gap-2">
//               <label className="text-xs text-[#15171C]">
//                 Leave your comments here for other customers
//               </label>
//               <textarea
//                 className="w-full border border-[#E3EFFC] bg-[#FCFCFD] rounded-lg p-3 text-sm"
//                 rows={4}
//                 placeholder="Comment"
//               />
//             </div>
//             <div className="flex justify-end mt-4">
//               <button
//                 onClick={() => setSubmitted(true)}
//                 disabled={rating === 0}
//                 className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
//               >
//                 Submit
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-10 gap-4">
//             <Image src="/tick-circle.png" alt="Success" width={80} height={80} />
//             <p className="text-sm font-medium text-gray-700">Successful</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





"use client";

import { useParams } from "next/navigation";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { GET_PRODUCT_DETAILS } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";
import Suscribe from "@/Components/Suscribe/Suscribe";
import { Star } from "lucide-react";
import Image from "next/image";
import StarRating from "../components/StarRating";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { stripHtml } from "@/utils/stripHtml";

/* ===================== Types ===================== */

type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  stockLevel: string;
  currencyCode: string;
  price: number;
  priceWithTax: number;
  featuredAsset?: { id: string; preview: string };
  assets: { id: string; preview: string }[];
};

type ProductDetails = {
  id: string;
  name: string;
  description: string;
  collections: { name: string; id: string; slug: string }[];
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
        featuredAsset?: { preview: string };
        price: number;
        product: {
          id: string;
          name: string;
          slug: string;
          enabled: boolean;
          assets: { preview: string }[];
          featuredAsset?: { id: string; preview: string };
        };
      }>;
    };
  };
  featuredAsset?: { id: string; preview: string };
  assets: { id: string; preview: string }[];
  variants: ProductVariant[];
};

type GetProductDetailsData = { product: ProductDetails | null };
type ActionKey = "cart" | "buy" | "later";

/* ===================== Static data ===================== */

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
  const router = useRouter();

  const { cart, addToCartMutation, handleAdjustQuantity, removeFromCartMutation, getOrderLineIdByVariantId } = useCart();
  const { customer } = useUser();
  const { items: localItems, addItem: addLocalItem, updateQuantity: updateLocalQuantity, removeItem: removeLocalItem } = useLocalCart();

  const [loadingAction, setLoadingAction] = useState<ActionKey | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"Product Detail" | "Reviews" | "Related Product">("Product Detail");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // ── Live stock level — updated after every add/reduce action ──────────────
  const [liveStockLevel, setLiveStockLevel] = useState<string | null>(null);

  const { data, loading, error } = useQuery<GetProductDetailsData>(
    GET_PRODUCT_DETAILS,
    { variables: { slug }, skip: !slug, fetchPolicy: "cache-and-network" }
  );

  // Lazy query for refetching stock level after add/remove
  const [refetchStock] = useLazyQuery<GetProductDetailsData>(GET_PRODUCT_DETAILS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.product?.variants?.length) {
      const first = data.product.variants.find((v) => v?.id);
      if (first) {
        setSelectedVariant(first as ProductVariant);
        setLiveStockLevel(first.stockLevel);
      }
    }
  }, [data]);

  useEffect(() => {
    if (selectedVariant) {
      setLiveStockLevel(selectedVariant.stockLevel);
    }
  }, [selectedVariant?.id]);

  const product = data?.product ?? null;

  /* ---------- Images ---------- */
  const productImages = useMemo(() => {
    if (!product) return ["/api/placeholder/400/400"];
    const imgs: string[] = [];
    if (product.featuredAsset?.preview) imgs.push(product.featuredAsset.preview);
    for (const a of product.assets ?? []) {
      if (a?.preview && a.preview !== product.featuredAsset?.preview)
        imgs.push(a.preview);
    }
    return imgs.length ? imgs : ["/api/placeholder/400/400"];
  }, [product]);

  const mainImageSrc = productImages[selectedImage] ?? "/api/placeholder/400/400";

  /* ---------- Variants ---------- */
  const variants: ProductVariant[] = useMemo(
    () => (product?.variants ?? []).filter((v): v is ProductVariant => Boolean(v?.id)),
    [product]
  );

  /* ---------- Related products ---------- */
  const relatedProducts = useMemo(() => {
    return (product?.customFields?.relatedProducts?.variants ?? [])
      .filter((v) => v?.product?.enabled)
      .slice(0, 4)
      .map((v) => ({
        id: v!.id,
        name: v!.product!.name,
        price: `₦${v!.price.toLocaleString()}`,
        image:
          v!.featuredAsset?.preview ||
          v!.product!.featuredAsset?.preview ||
          "/api/placeholder/200/200",
        rating: 4.5,
        slug: v!.product!.slug,
      }));
  }, [product]);

  /* ---------- Price ---------- */
  const currentPrice = selectedVariant?.priceWithTax ?? variants[0]?.priceWithTax ?? 0;
  const currency = selectedVariant?.currencyCode ?? variants[0]?.currencyCode ?? "NGN";
  const currencySymbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency;
  const formattedPrice = (currentPrice / 100).toLocaleString();

  /* ---------- Plain-text description ---------- */
  const plainDescription = useMemo(
    () => stripHtml(product?.description),
    [product?.description]
  );

  /* ---------- Stock logic ---------- */
  const isOutOfStock = !liveStockLevel || liveStockLevel === "OUT_OF_STOCK";

  const unitsLeft: number | null = useMemo(() => {
    if (!liveStockLevel) return null;
    const match = liveStockLevel.match(/^(\d+)_UNITS_LEFT$/);
    return match ? parseInt(match[1], 10) : null;
  }, [liveStockLevel]);

  const isPlusDisabled = isOutOfStock || (unitsLeft !== null && quantity >= unitsLeft);

  /* ---------- Refetch stock from backend ---------- */
  const refreshStockLevel = useCallback(async () => {
    try {
      const result = await refetchStock({ variables: { slug } });
      const freshVariant = result.data?.product?.variants?.find(
        (v) => v.id === selectedVariant?.id
      );
      if (freshVariant) {
        console.log("[stock] refreshed:", freshVariant.stockLevel);
        setLiveStockLevel(freshVariant.stockLevel);
        return freshVariant.stockLevel;
      }
    } catch (e) {
      console.error("[stock] refetch failed:", e);
    }
    return liveStockLevel;
  }, [refetchStock, selectedVariant?.id, liveStockLevel]);

  /* ---------- Quantity from cart ---------- */
  const cartQuantity = useMemo(() => {
    if (!selectedVariant) return 0;
    if (customer) {
      const line = (cart?.activeOrder?.lines ?? []).find(
        (l: any) =>
          l?.productVariant?.id === selectedVariant.id ||
          l?.productVariant?.product?.slug === slug
      );
      return line?.quantity ?? 0;
    } else {
      const item = localItems.find(
        (it) => it.id === selectedVariant.id || it.slug === slug
      );
      return item?.quantity ?? 0;
    }
  }, [selectedVariant, customer, cart, localItems, slug]);

  useEffect(() => {
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
    } else {
      setQuantity(1);
    }
  }, [cartQuantity, selectedVariant?.id]);

  /* ---------- Core cart action ---------- */
  const addVariantToCart = useCallback(
    async (action: ActionKey): Promise<boolean> => {
      if (!selectedVariant) {
        toast.error("Please select a variant");
        return false;
      }

      if (isOutOfStock) {
        toast.error("This item is out of stock");
        return false;
      }

      if (unitsLeft !== null && quantity > unitsLeft) {
        toast.error(`Only ${unitsLeft} unit(s) available in stock`);
        return false;
      }

      setLoadingAction(action);
      try {
        addLocalItem({
          id: selectedVariant.id,
          name: product?.name ?? selectedVariant.name,
          slug: slug ?? "",
          priceWithTax: selectedVariant.priceWithTax,
          currencyCode: selectedVariant.currencyCode ?? "NGN",
          image: mainImageSrc !== "/api/placeholder/400/400" ? mainImageSrc : undefined,
          quantity,
        });

        if (customer) {
          const result = await addToCartMutation({
            productVariantId: selectedVariant.id,
            quantity,
          });

          if (result?.__typename === "InsufficientStockError") {
            toast.error(`Only ${result.quantityAvailable} item(s) available in stock.`);
            await refreshStockLevel();
            return false;
          }
          if (result?.errorCode) {
            toast.error(`Could not add to cart: ${result.message ?? result.errorCode}`);
            return false;
          }
        }

        await refreshStockLevel();

        toast.success("Added to cart!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        return true;
      } catch (e: any) {
        console.error("Add to cart error:", e);
        toast.error(e?.message ?? "Could not add to cart. Please try again.");
        return false;
      } finally {
        setLoadingAction(null);
      }
    },
    [selectedVariant, quantity, product, slug, mainImageSrc, customer, addLocalItem, addToCartMutation, isOutOfStock, unitsLeft, refreshStockLevel]
  );

  /* ---------- Adjust quantity ---------- */
  const adjustCartQuantity = useCallback(
    async (newQty: number) => {
      if (!selectedVariant) return;

      if (newQty > quantity) {
        if (isOutOfStock) {
          toast.error("This item is out of stock");
          return;
        }
        if (unitsLeft !== null && newQty > unitsLeft) {
          toast.error(`Only ${unitsLeft} unit(s) available in stock`);
          return;
        }
      }

      setQuantity(Math.max(1, newQty));

      if (cartQuantity === 0) return;

      if (newQty <= 0) {
        removeLocalItem(selectedVariant.id);
        if (customer) {
          const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
          if (orderLineId) {
            try { await removeFromCartMutation(orderLineId); } catch (e) { console.error(e); }
          }
        }
        await refreshStockLevel();
        return;
      }

      updateLocalQuantity(selectedVariant.id, newQty);
      if (customer) {
        const orderLineId = getOrderLineIdByVariantId(selectedVariant.id);
        if (orderLineId) {
          try {
            await handleAdjustQuantity(orderLineId, newQty);
            await refreshStockLevel();
          } catch (e) { console.error(e); }
        }
      }
    },
    [selectedVariant, quantity, cartQuantity, customer, isOutOfStock, unitsLeft,
     removeLocalItem, updateLocalQuantity, getOrderLineIdByVariantId,
     removeFromCartMutation, handleAdjustQuantity, refreshStockLevel]
  );

  const handleAddToCart = () => addVariantToCart("cart");
  const handleBuyNow = async () => {
    const ok = await addVariantToCart("buy");
    if (ok) router.push("/checkout");
  };
  const handlePayLater = async () => {
    const ok = await addVariantToCart("later");
    if (ok) router.push("/checkout?method=installment");
  };

  const anyLoading = loadingAction !== null;

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg aspect-square" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ===================== Render ===================== */
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <Navbar />

      <div className="mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left — images */}
            <div className="space-y-8">
              <div className="w-full bg-gray-100 rounded-lg p-4 aspect-square flex items-center justify-center">
                <img src={mainImageSrc} alt={product.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 p-2 ${
                      selectedImage === index ? "border-[#00AAFF]" : "border-gray-200"
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right — info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-600 ml-2">(1,250 reviews)</span>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  {currencySymbol}{formattedPrice}
                </div>
              </div>

              {/* Variant selector */}
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

              {/* Stock status */}
              {selectedVariant && (
                <div className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                  {isOutOfStock
                    ? "Out of stock"
                    : unitsLeft !== null
                    ? `Only ${unitsLeft} unit(s) left in stock`
                    : "In stock"}
                </div>
              )}

              {/* Description */}
              {plainDescription && (
                <p className="text-gray-700">{plainDescription}</p>
              )}

              {/* Quantity controls */}
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Qty:</span>
                <button
                  aria-label="Decrease quantity"
                  onClick={() => adjustCartQuantity(quantity - 1)}
                  disabled={anyLoading}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => adjustCartQuantity(quantity + 1)}
                  disabled={anyLoading || isPlusDisabled}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
                {cartQuantity > 0 && (
                  <span className="text-xs text-green-600 font-medium ml-1">
                    ({cartQuantity} in cart)
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={anyLoading || !selectedVariant || isOutOfStock}
                  className="flex-1 border-2 border-[#242425] text-[#242425] py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  {loadingAction === "cart" ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#242425] border-t-transparent" />Adding...</>
                  ) : isOutOfStock ? "Out of Stock" : cartQuantity > 0 ? "Update Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={anyLoading || !selectedVariant || isOutOfStock}
                  className="flex-1 px-6 py-3 bg-[#242425] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  {loadingAction === "buy" ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
                  ) : "Buy Now"}
                </button>

                <button
                  onClick={handlePayLater}
                  disabled={anyLoading || !selectedVariant || isOutOfStock}
                  className="flex-1 bg-[#ff0000] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#751c1c] flex items-center justify-center gap-2"
                >
                  {loadingAction === "later" ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
                  ) : "Pay Later"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {(["Product Detail", "Reviews", "Related Product"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="w-full p-2 sm:p-4 text-left pb-12">
            {activeTab === "Related Product" ? (
              <div>
                <h3 className="text-xl font-bold mb-6">Related Products</h3>
                {relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((rp) => (
                      <div
                        key={rp.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/products/${rp.slug}`)}
                      >
                        <div className="bg-gray-100 p-4 aspect-square flex items-center justify-center">
                          <img src={rp.image} alt={rp.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{rp.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">{rp.price}</span>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm text-gray-600 ml-1">{rp.rating}</span>
                            </div>
                          </div>
                          <button className="w-full mt-3 bg-black text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                            View Product
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No related products found</p>
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

/* ===================== LocalProductCard ===================== */

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
        {/* Rating summary — stacks on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 border border-[#E4E9EE] rounded-xl p-4 sm:p-6">
          <div className="flex gap-3 items-center sm:min-w-40">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FFA133" strokeWidth="6" />
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
                <span className="flex gap-1 w-10 text-sm shrink-0">
                  {r.stars}.0
                  <Star className="w-5 h-5 fill-[#FFA133] text-[#FFA133]" />
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-black rounded" style={{ width: `${(r.count / totalReviews) * 100}%` }} />
                </div>
                <span className="w-12 text-sm text-right text-gray-500 shrink-0">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacks vertically. lg: sidebar + content. */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          {/* Filters — horizontal scroll row on mobile, sidebar on lg */}
          <aside className="lg:col-span-3 xl:col-span-2 text-[#818B9C]">
            <div className="flex flex-col gap-6 lg:overflow-visible pb-2 lg:pb-0">
              <div className="shrink-0">
                <h3 className="mb-3 text-black font-medium">Rating</h3>
                <div className="flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
                      <input type="checkbox" className="accent-red-600" />
                      <Star className="w-4 h-4 fill-[#FFA133] text-[#FFA133]" />
                      {r} Star
                    </label>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <h3 className="text-black mb-3 font-medium">Review Topics</h3>
                <div className="flex flex-col gap-1.5">
                  {["Product Quality", "Product Price", "Shipment"].map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
                      <input type="checkbox" className="accent-red-600" /> {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Review list */}
          <div className="lg:col-span-9 xl:col-span-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review Lists</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm whitespace-nowrap">All Reviews</button>
                  <button className="px-4 py-2 border rounded-lg text-sm whitespace-nowrap">With Photo &amp; Video</button>
                  <button className="px-4 py-2 border rounded-lg text-sm whitespace-nowrap">With Description</button>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm shrink-0 self-start"
              >
                <Image src="/Edit Square.png" alt="Write a review" width={18} height={18} />
                Write a review
              </button>
            </div>

            {isOpen && <ReviewModal onClose={() => setIsOpen(false)} />}

            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-[#E4E9EE] flex flex-col sm:flex-row sm:justify-between gap-3 pb-6"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i <= review.rating ? "fill-[#FFA133] text-[#FFA133]" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{review.text}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={review.image} alt={review.name} className="w-8 h-8 object-cover rounded-full" />
                    <p className="font-semibold">{review.name}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
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

  const cf = product.customFields ?? {};
  const specs = [
    { label: "Power Output", value: cf.powerOutput },
    { label: "Efficiency", value: cf.efficiency },
    { label: "Voltage", value: cf.voltage },
    { label: "Dimensions", value: cf.dimensions },
    { label: "Weight", value: cf.weight },
    { label: "Frame Material", value: cf.frameMaterial },
    { label: "Surface Material", value: cf.surfaceMaterial },
  ].filter((s) => Boolean(s.value));

  const plainDescription = stripHtml(product.description);

  return (
    <div className="space-y-6">
      {plainDescription && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-[#818B9C] leading-relaxed">{plainDescription}</p>
        </div>
      )}
      {specs.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {specs.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between">
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

/* ===================== ReviewModal ===================== */

type ReviewModalProps = { onClose: () => void };

function ReviewModal({ onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const t = setTimeout(onClose, 1000);
      return () => clearTimeout(t);
    }
  }, [submitted, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!submitted ? onClose : undefined} />
      <div className="relative bg-white rounded-xl p-4 w-full max-w-md z-10">
        {!submitted ? (
          <>
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-semibold">Review</h3>
              <button onClick={onClose} aria-label="Close review modal">
                <Image src="/close-circle.png" alt="Close" width={22} height={22} />
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-xs mb-1">Rating</h3>
              <StarRating value={rating} onChange={setRating} />
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
                onClick={() => setSubmitted(true)}
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