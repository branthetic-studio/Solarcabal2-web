// "use client";

// import React from "react";
// import ItemCard from "./ItemCard";
// import Link from "next/link";

// interface Item {
//   name: string;
//   desc: string;
//   img: string;
// }

// interface PackageOption {
//   title: string;
//   price: string;
//   features: string[];
//   items: Item[];
// }

// interface Props {
//   option: PackageOption;
//   collectionSlug?: string;
//   variantId?: string;
//   productSlug?: string;
//   collectionImg?: string; // ← add here
// }

// const PackageCard: React.FC<Props> = ({ option, collectionSlug, variantId, productSlug, collectionImg }) => {
//   const fallbackSlug = option.title.replace(/\s+/g, "-").toLowerCase();
//   const slug = collectionSlug || fallbackSlug;

//   const params = new URLSearchParams();
//   if (productSlug) params.set("productSlug", productSlug);
//   if (variantId) params.set("variantId", variantId);
//   const href = `/installation/${encodeURIComponent(slug)}${params.toString() ? `?${params.toString()}` : ""}`;

//   return (
//     <div className="bg-white p-2 md:p-4 rounded-lg border border-[#f0f0f0]">
//       {/* Product image */}
//       <div className="items">
//         {option.items.map((item, i) => (
//           <ItemCard key={i} item={item} collectionImg={collectionImg} /> // ← pass it here
//         ))}
//       </div>

//       {/* Name and price shown under image */}
//       <div className="mt-2 px-1">
//         <p className="text-sm font-medium text-gray-600 line-clamp-2 leading-snug">
//           {option.title}
//         </p>
//         <p className="text-sm font-bold mt-1">{option.price}</p>
//       </div>

//       <button className="text-sm bg-[#000000] text-white py-3 rounded-lg w-full mt-4">
//         <Link href={href}>
//           View
//         </Link>
//       </button>
//     </div>
//   );
// };

// export default PackageCard;


// "use client";

// import React from "react";
// import Link from "next/link";

// interface Component {
//   id: string;
//   name: string;
//   slug: string;
//   featuredAsset?: { id: string; preview?: string | null } | null;
// }

// interface PackageOption {
//   title: string;
//   price: string;
//   capacity?: string;           // packageCapacity → "Recommended Loads" line
//   components?: Component[];     // packageComponents → "Offer Includes" list
//   bannerImg?: string;          // variant/product featuredAsset for the banner
// }

// interface Props {
//   option: PackageOption;
//   collectionSlug?: string;
//   variantId?: string;
//   productSlug?: string;
// }

// const PackageCard: React.FC<Props> = ({
//   option,
//   collectionSlug,
//   variantId,
//   productSlug,
// }) => {
//   const fallbackSlug = option.title.replace(/\s+/g, "-").toLowerCase();
//   const slug = productSlug || collectionSlug || fallbackSlug;

//   const params = new URLSearchParams();
//   if (productSlug) params.set("productSlug", productSlug);
//   if (variantId) params.set("variantId", variantId);
//   const href = `/installation/${encodeURIComponent(slug)}${
//     params.toString() ? `?${params.toString()}` : ""
//   }`;

//   // "Offer Includes" — component names, capped so the card stays tidy
//   const includes = (option.components ?? [])
//     .map((c) => c.name)
//     .filter(Boolean);
//   const visibleIncludes = includes.slice(0, 4);
//   const extraCount = includes.length - visibleIncludes.length;

//   return (
//     <div className="flex flex-col rounded-xl border border-[#f0f0f0] bg-white overflow-hidden">
//       {/* Banner image */}
//       <div className="relative bg-[#0B0F0E] aspect-[4/3] flex items-center justify-center">
//         {option.bannerImg ? (
//           // eslint-disable-next-line @next/next/no-img-element
//           <img
//             src={option.bannerImg}
//             alt={option.title}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="text-white/70 text-xs">No image</div>
//         )}
//         {/* Price pill */}
//         <span className="absolute top-2 right-2 bg-[#ff0000] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
//           {option.price}
//         </span>
//       </div>

//       {/* Body */}
//       <div className="flex flex-col flex-1 p-3">
//         <h3 className="text-sm font-semibold text-[#0B0F0E] line-clamp-2">
//           {option.title}
//         </h3>

//         {/* Recommended Loads */}
//         {option.capacity && (
//           <div className="mt-2">
//             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
//               Recommended Loads
//             </p>
//             <p className="text-xs text-gray-700 mt-0.5">{option.capacity}</p>
//           </div>
//         )}

//         {/* Offer Includes */}
//         {visibleIncludes.length > 0 && (
//           <div className="mt-3">
//             <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
//               Offer Includes
//             </p>
//             <ul className="mt-1 space-y-1">
//               {visibleIncludes.map((name, i) => (
//                 <li
//                   key={i}
//                   className="flex items-start gap-1.5 text-xs text-gray-700"
//                 >
//                   <span className="mt-1 w-1 h-1 rounded-full bg-[#ff0000] shrink-0" />
//                   <span className="line-clamp-1">{name}</span>
//                 </li>
//               ))}
//               {extraCount > 0 && (
//                 <li className="text-xs text-gray-400 pl-2.5">
//                   + {extraCount} more
//                 </li>
//               )}
//             </ul>
//           </div>
//         )}

//         {/* View button — pinned to bottom */}
//         <Link
//           href={href}
//           className="mt-4 block text-center text-sm bg-[#0B0F0E] text-white py-2.5 rounded-lg hover:bg-black/80 transition-colors"
//         >
//           View
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default PackageCard;



"use client";

import React from "react";
import Link from "next/link";

interface Component {
  id: string;
  name: string;
  slug: string;
  featuredAsset?: { id: string; preview?: string | null } | null;
}

interface PackageOption {
  title: string;
  price: string;
  capacity?: string;           // packageCapacity → "Recommended Loads" line
  components?: Component[];     // packageComponents → "Offer Includes" list
  bannerImg?: string;          // variant/product featuredAsset for the banner
}

interface Props {
  option: PackageOption;
  collectionSlug?: string;
  variantId?: string;
  productSlug?: string;
}

const PackageCard: React.FC<Props> = ({
  option,
  collectionSlug,
  variantId,
  productSlug,
}) => {
  const fallbackSlug = option.title.replace(/\s+/g, "-").toLowerCase();
  const slug = productSlug || collectionSlug || fallbackSlug;

  console.log("[PackageCard] option:", option, { collectionSlug, variantId, productSlug });

  const params = new URLSearchParams();
  if (productSlug) params.set("productSlug", productSlug);
  if (variantId) params.set("variantId", variantId);
  const href = `/installation/${encodeURIComponent(slug)}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  // "Offer Includes" — component names, capped so the card stays tidy
  const includes = (option.components ?? [])
    .map((c) => c.name)
    .filter(Boolean);
  const visibleIncludes = includes.slice(0, 4);
  const extraCount = includes.length - visibleIncludes.length;

  return (
    <div className="flex flex-col rounded-xl border border-[#f0f0f0] bg-white overflow-hidden">
      {/* Banner image */}
      <div className="relative bg-[#0B0F0E] aspect-[4/3] flex items-center justify-center">
        {option.bannerImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={option.bannerImg}
            alt={option.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/70 text-xs">No image</div>
        )}
        {/* Price pill */}
        <span className="absolute top-2 right-2 bg-[#ff0000] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
          {option.price}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-sm font-semibold text-[#0B0F0E] line-clamp-2">
          {option.title}
        </h3>

        {/* Recommended Loads */}
        {option.capacity && (
          <div className="mt-2">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Recommended Loads
            </p>
            <p className="text-xs text-gray-700 mt-0.5">{option.capacity}</p>
          </div>
        )}

        {/* Offer Includes */}
        {visibleIncludes.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Offer Includes
            </p>
            <ul className="mt-1 space-y-1">
              {visibleIncludes.map((name, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-gray-700"
                >
                  <span className="mt-1 w-1 h-1 rounded-full bg-[#ff0000] shrink-0" />
                  <span className="line-clamp-1">{name}</span>
                </li>
              ))}
              {extraCount > 0 && (
                <li className="text-xs text-gray-400 pl-2.5">
                  + {extraCount} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* View button — pinned to bottom */}
        <Link
          href={href}
          className="mt-4 block text-center text-sm bg-[#0B0F0E] text-white py-2.5 rounded-lg hover:bg-black/80 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default PackageCard;