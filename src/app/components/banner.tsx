// "use client";
// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Battery,
//   Zap,
//   Gauge,
//   Sun,
//   Home,
//   Fan,
//   Cable,
//   RefreshCw,
//   Power,
//   Hammer,
//   Pipette,
// } from "lucide-react";

// /**
//  * IMPORTANT: The `href` slug values below (e.g. "battery", "inverter") MUST
//  * exactly match the `slug` field returned by your Vendure
//  * GET_TOP_LEVEL_COLLECTIONS query. If your API returns "batteries" instead of
//  * "battery", update the href accordingly.
//  *
//  * To verify your slugs, check the network tab on the /products page and look
//  * at the GetTopLevelCollections response.
//  */
// const categories = [
//   { name: "Battery", icon: Battery, href: "/products?category=battery" },
//   { name: "Inverter", icon: Zap, href: "/products?category=inverter" },
//   {
//     name: "Charge Controller",
//     icon: Gauge,
//     href: "/products?category=charge-controller",
//   },
//   { name: "Panels", icon: Sun, href: "/products?category=panels" },
//   {
//     name: "Solar Generator",
//     icon: Home,
//     href: "/products?category=solar-generator",
//   },
//   { name: "Solar Fan", icon: Fan, href: "/products?category=solar-fan" },
//   { name: "Wires", icon: Cable, href: "/products?category=wires" },
//   {
//     name: "Change Over",
//     icon: RefreshCw,
//     href: "/products?category=change-over",
//   },
//   { name: "DC & AC Breaker", icon: Power, href: "/products?category=breaker" },
//   {
//     name: "Thunder Arrestor",
//     icon: Hammer,
//     href: "/products?category=thunder-arrestor",
//   },
//   {
//     name: "Trunking Pipe",
//     icon: Pipette,
//     href: "/products?category=trunking-pipe",
//   },
// ];

// const Banner = () => {
//   return (
//     <div className="w-full bg-[#FAFAFA]">
//       <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6 py-6 md:py-8 px-4 md:px-8 lg:px-12 mx-auto items-stretch">

//         {/* Sidebar Categories */}
//         <aside className="hidden lg:flex w-72 shrink-0">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
//             <nav className="space-y-1">
//               {categories.map((category) => {
//                 const IconComponent = category.icon;

//                 return (
//                   <Link
//                     key={category.name}
//                     href={category.href}
//                     className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
//                   >
//                     <IconComponent className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
//                     <span className="text-sm font-medium">
//                       {category.name}
//                     </span>
//                   </Link>
//                 );
//               })}
//             </nav>
//           </div>
//         </aside>

//         {/* Hero Banner */}
//         <div className="flex-1 relative rounded-2xl overflow-hidden shadow-lg min-h-80 sm:min-h-95 md:min-h-112 lg:min-h-125">

//           {/* Background Image */}
//           <Image
//             src="/hero.png"
//             alt="Solar panels on modern house"
//             fill
//             className="object-cover"
//             priority
//           />

//           {/* Overlay */}
//           <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />

//           {/* Centered Content */}
//           <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-40">
//             <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
//               Your One-Stop
//               <br />
//               Solar Shop
//             </h1>

//             <p className="text-sm sm:text-base md:text-md text-gray-200 mb-5 md:mb-8 max-w-xl leading-relaxed">
//               Explore top-quality solar energy products, track your orders, and
//               manage everything in one place.
//             </p>

//             <div className="flex gap-4 flex-wrap">
//               <Link
//                 href="/products"
//                 className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
//               >
//                 Products
//               </Link>
//               <Link
//                 href="/installation"
//                 className="inline-flex items-center justify-center border border-white hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
//               >
//                 Installation
//               </Link>
//               <Link
//                 href="/referral"
//                 className="inline-flex items-center justify-center bg-white hover:bg-red-700 hover:text-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
//               >
//                 Referral
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Banner;



// "use client";
// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Battery,
//   Zap,
//   Gauge,
//   Sun,
//   Home,
//   Fan,
//   Cable,
//   RefreshCw,
//   Power,
//   Hammer,
//   Pipette,
// } from "lucide-react";

// const categories = [
//   { name: "Battery", icon: Battery, href: "/products?category=battery" },
//   { name: "Inverter", icon: Zap, href: "/products?category=inverter" },
//   {
//     name: "Charge Controller",
//     icon: Gauge,
//     href: "/products?category=charge-controller",
//   },
//   { name: "Panels", icon: Sun, href: "/products?category=panels" },
//   {
//     name: "Solar Generator",
//     icon: Home,
//     href: "/products?category=solar-generator",
//   },
//   { name: "Solar Fan", icon: Fan, href: "/products?category=solar-fan" },
//   { name: "Wires", icon: Cable, href: "/products?category=wires" },
//   {
//     name: "Change Over",
//     icon: RefreshCw,
//     href: "/products?category=change-over",
//   },
//   { name: "DC & AC Breaker", icon: Power, href: "/products?category=breaker" },
//   {
//     name: "Thunder Arrestor",
//     icon: Hammer,
//     href: "/products?category=thunder-arrestor",
//   },
//   {
//     name: "Trunking Pipe",
//     icon: Pipette,
//     href: "/products?category=trunking-pipe",
//   },
// ];

// const Banner = () => {
//   return (
//     <div className="w-full bg-[#FAFAFA]">
//       <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6 py-6 md:py-8 px-4 md:px-8 lg:px-12 mx-auto items-stretch">

//         {/* Sidebar Categories — desktop only */}
//         <aside className="hidden lg:flex w-72 shrink-0">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
//             <nav className="space-y-1">
//               {categories.map((category) => {
//                 const IconComponent = category.icon;
//                 return (
//                   <Link
//                     key={category.name}
//                     href={category.href}
//                     className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
//                   >
//                     <IconComponent className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
//                     <span className="text-sm font-medium">{category.name}</span>
//                   </Link>
//                 );
//               })}
//             </nav>
//           </div>
//         </aside>

//         {/* Hero Banner */}
//         <div className="flex-1 relative rounded-2xl overflow-hidden shadow-lg min-h-80 sm:min-h-95 md:min-h-112 lg:min-h-125">

//           {/* Background Image */}
//           <Image
//             src="/hero.png"
//             alt="Solar panels on modern house"
//             fill
//             className="object-cover"
//             priority
//           />

//           {/* Overlay */}
//           <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />

//           {/* Content */}
//           <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-40">
//             <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
//               Your One-Stop
//               <br />
//               Solar Shop
//             </h1>

//             <p className="text-sm sm:text-base md:text-md text-gray-200 mb-5 md:mb-8 max-w-xl leading-relaxed">
//               Explore top-quality solar energy products, track your orders, and
//               manage everything in one place.
//             </p>

//             {/* Buttons — desktop only */}
//             <div className="hidden lg:flex gap-4 flex-wrap">
//               <Link
//                 href="/products"
//                 className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
//               >
//                 Products
//               </Link>
//               <Link
//                 href="/installation"
//                 className="inline-flex items-center justify-center border border-white hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
//               >
//                 Installation
//               </Link>
//               <Link
//                 href="/referral"
//                 className="inline-flex items-center justify-center bg-white hover:bg-red-700 hover:text-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
//               >
//                 Referral
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Banner;
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Battery,
  Zap,
  Gauge,
  Sun,
  Home,
  Fan,
  Cable,
  RefreshCw,
  Power,
  Hammer,
  Pipette,
} from "lucide-react";

const categories = [
  { name: "Battery", icon: Battery, href: "/products?category=battery" },
  { name: "Inverter", icon: Zap, href: "/products?category=inverter" },
  {
    name: "Charge Controller",
    icon: Gauge,
    href: "/products?category=charge-controller",
  },
  { name: "Panels", icon: Sun, href: "/products?category=panels" },
  {
    name: "Solar Generator",
    icon: Home,
    href: "/products?category=solar-generator",
  },
  { name: "Solar Fan", icon: Fan, href: "/products?category=solar-fan" },
  { name: "Wires", icon: Cable, href: "/products?category=wires" },
  {
    name: "Change Over",
    icon: RefreshCw,
    href: "/products?category=change-over",
  },
  { name: "DC & AC Breaker", icon: Power, href: "/products?category=breaker" },
  {
    name: "Thunder Arrestor",
    icon: Hammer,
    href: "/products?category=thunder-arrestor",
  },
  {
    name: "Trunking Pipe",
    icon: Pipette,
    href: "/products?category=trunking-pipe",
  },
];

const Banner = () => {
  return (
    <div className="w-full bg-[#FAFAFA]">

      <div className="w-full flex flex-col lg:flex-row gap-4 md:gap-6 py-6 md:py-8 px-4 md:px-8 lg:px-12 mx-auto items-stretch">

        {/* Sidebar Categories — desktop only */}
        <aside className="hidden lg:flex w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
            <nav className="space-y-1">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
                  >
                    <IconComponent className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Mobile Promo Banner ── */}
        <div className="lg:hidden relative rounded-2xl overflow-hidden shadow-lg h-36 bg-[#1a1a1a]">
          {/* Dark background with subtle pattern dots */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/95 to-[#2a1a1a]" />

          {/* Decorative lines top-right */}
          <div className="absolute top-3 right-28 flex flex-col gap-1 opacity-40">
            <div className="w-6 h-0.5 bg-white rotate-45" />
            <div className="w-4 h-0.5 bg-white rotate-45 ml-2" />
          </div>

          {/* Decorative dots */}
          <div className="absolute bottom-4 left-36 w-2 h-2 rounded-full border border-white/30" />
          <div className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-yellow-400/60" />

          {/* Left text content */}
          <div className="absolute inset-0 flex flex-col justify-center pl-5 pr-40">
            <h2 className="text-white text-xl font-bold leading-tight mb-2">
              Your One-Stop
              <br />
              Solar Shop
            </h2>
            <p className="text-gray-300 text-xs leading-relaxed">
              Explore top-quality solar energy products, track your orders, and
              manage everything in one place.
            </p>
          </div>

          {/* Right — product image */}
          <div className="absolute right-2 bottom-0 h-full w-40 flex items-end justify-center">
            <Image
              src="/hero.png"
              alt="Solar product"
              width={160}
              height={130}
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* ── Desktop Hero Banner ── */}
        <div className="hidden lg:block flex-1 relative rounded-2xl overflow-hidden shadow-lg lg:min-h-125">

          {/* Background Image */}
          <Image
            src="/hero.png"
            alt="Solar panels on modern house"
            fill
            className="object-cover"
            priority
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-40">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Your One-Stop
              <br />
              Solar Shop
            </h1>

            <p className="text-base md:text-md text-gray-200 mb-8 max-w-xl leading-relaxed">
              Explore top-quality solar energy products, track your orders, and
              manage everything in one place.
            </p>

            {/* Buttons — desktop only */}
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs font-medium"
              >
                Products
              </Link>
              <Link
                href="/installation"
                className="inline-flex items-center justify-center border border-white hover:bg-red-700 text-white px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs font-medium"
              >
                Installation
              </Link>
              <Link
                href="/referral"
                className="inline-flex items-center justify-center bg-white hover:bg-red-700 hover:text-white text-red-600 px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs font-medium"
              >
                Referral
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Service Section ── */}
      <div className="lg:hidden px-4 pt-2 pb-4">
        <h2 className="text-[15px]  text-[#191A26] mb-4">Service</h2>
        <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 flex items-center justify-around py-5 px-3">

          {/* Products */}
          <Link href="/products" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#F97316"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#F97316"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#F97316"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#F97316"/>
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">Products</span>
          </Link>

          {/* Installation */}
          <Link href="/installation" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="#3B82F6"/>
                <line x1="12" y1="3" x2="12" y2="7" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="3" y1="12" x2="7" y2="12" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="17" y1="12" x2="21" y2="12" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">Installation</span>
          </Link>

          {/* Refer & Earn */}
          <Link href="/referral" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="7" y="2" width="10" height="8" rx="2" fill="#EF4444"/>
                <path d="M5 10h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10z" fill="#EF4444"/>
                <path d="M12 2v20M7 7h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">Refer & Earn</span>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default Banner;