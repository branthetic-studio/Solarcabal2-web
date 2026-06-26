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
        <h2 className="text-[15px]  text-[#191A26] mb-4 font-[500]">Service</h2>
        <div className="bg-[#FAFAFA] rounded-[10px] border border-gray-100 flex items-center justify-around py-5 px-3">

          {/* Products */}
          <Link href="/products" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-[#F7900926] flex items-center justify-center transition-transform group-hover:scale-105">
             

              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.2918 8.61462L22.9897 5.72921C22.5522 2.58337 21.1251 1.30212 18.073 1.30212H15.6147H14.073H10.9064H9.36471H6.86471C3.80221 1.30212 2.38554 2.58337 1.93762 5.76046L1.65637 8.62504C1.55221 9.73962 1.85429 10.823 2.51054 11.6667C3.30221 12.698 4.52096 13.2813 5.87512 13.2813C7.18762 13.2813 8.44804 12.625 9.23971 11.573C9.94804 12.625 11.1564 13.2813 12.5001 13.2813C13.8439 13.2813 15.021 12.6563 15.7397 11.6146C16.5418 12.6459 17.7814 13.2813 19.073 13.2813C20.4585 13.2813 21.7085 12.6667 22.4897 11.5834C23.1147 10.75 23.396 9.69796 23.2918 8.61462Z" fill="#F79009"/>
<path d="M11.8229 17.3542C10.5 17.4896 9.5 18.6146 9.5 19.948V22.8021C9.5 23.0834 9.72917 23.3125 10.0104 23.3125H14.9792C15.2604 23.3125 15.4896 23.0834 15.4896 22.8021V20.3126C15.5 18.1355 14.2188 17.1042 11.8229 17.3542Z" fill="#F79009"/>
<path d="M22.2606 15V18.1041C22.2606 20.9791 19.9272 23.3125 17.0522 23.3125C16.771 23.3125 16.5418 23.0833 16.5418 22.802V20.3125C16.5418 18.9791 16.1356 17.9375 15.3439 17.2291C14.646 16.5937 13.6981 16.2812 12.521 16.2812C12.2606 16.2812 12.0002 16.2916 11.7189 16.3229C9.86475 16.5104 8.4585 18.0729 8.4585 19.9479V22.802C8.4585 23.0833 8.22933 23.3125 7.94808 23.3125C5.07308 23.3125 2.73975 20.9791 2.73975 18.1041V15.0208C2.73975 14.2916 3.4585 13.802 4.13558 14.0416C4.41683 14.1354 4.69808 14.2083 4.98975 14.25C5.11475 14.2708 5.25016 14.2916 5.37516 14.2916C5.54183 14.3125 5.7085 14.3229 5.87516 14.3229C7.0835 14.3229 8.271 13.875 9.2085 13.1041C10.1043 13.875 11.271 14.3229 12.5002 14.3229C13.7397 14.3229 14.8856 13.8958 15.7814 13.125C16.7189 13.8854 17.8856 14.3229 19.0731 14.3229C19.2606 14.3229 19.4481 14.3125 19.6252 14.2916C19.7502 14.2812 19.8647 14.2708 19.9793 14.25C20.3022 14.2083 20.5939 14.1145 20.8856 14.0208C21.5627 13.7916 22.2606 14.2916 22.2606 15Z" fill="#F79009"/>
</svg>

            </div>
            <span className="text-sm text-gray-700 font-medium">Products</span>
          </Link>

          {/* Installation */}
          <Link href="/installation" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-[#0088FF1A] flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.8647 2.08337H8.13558C4.34391 2.08337 2.0835 4.34379 2.0835 8.13546V16.8542C2.0835 20.6563 4.34391 22.9167 8.13558 22.9167H16.8543C20.646 22.9167 22.9064 20.6563 22.9064 16.8646V8.13546C22.9168 4.34379 20.6564 2.08337 16.8647 2.08337ZM7.98975 5.72921C7.98975 5.30212 8.34391 4.94796 8.771 4.94796C9.19808 4.94796 9.55225 5.30212 9.55225 5.72921V9.79171C9.55225 10.2188 9.19808 10.573 8.771 10.573C8.34391 10.573 7.98975 10.2188 7.98975 9.79171V5.72921ZM9.85982 17.1418C9.68149 17.2162 9.55225 17.383 9.55225 17.5762V19.2709C9.55225 19.698 9.19808 20.0521 8.771 20.0521C8.34391 20.0521 7.98975 19.698 7.98975 19.2709V17.5762C7.98975 17.383 7.86048 17.2162 7.6822 17.1417C6.65588 16.7128 5.93766 15.7086 5.93766 14.5313C5.93766 12.9688 7.2085 11.6875 8.771 11.6875C10.3335 11.6875 11.6147 12.9584 11.6147 14.5313C11.6147 15.7086 10.8878 16.7129 9.85982 17.1418ZM17.0106 19.2709C17.0106 19.698 16.6564 20.0521 16.2293 20.0521C15.8022 20.0521 15.4481 19.698 15.4481 19.2709V15.2084C15.4481 14.7813 15.8022 14.4271 16.2293 14.4271C16.6564 14.4271 17.0106 14.7813 17.0106 15.2084V19.2709ZM16.2293 13.3021C14.6668 13.3021 13.3856 12.0313 13.3856 10.4584C13.3856 9.28103 14.1125 8.27677 15.1405 7.84791C15.3188 7.77351 15.4481 7.60664 15.4481 7.41342V5.72921C15.4481 5.30212 15.8022 4.94796 16.2293 4.94796C16.6564 4.94796 17.0106 5.30212 17.0106 5.72921V7.42383C17.0106 7.61706 17.1398 7.78391 17.3181 7.85841C18.3444 8.28732 19.0627 9.29153 19.0627 10.4688C19.0627 12.0313 17.7918 13.3021 16.2293 13.3021Z" fill="#0088FF"/>
</svg>

            </div>
            <span className="text-sm text-gray-700 font-medium">Solar Package</span>
          </Link>

          {/* Refer & Earn */}
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-[#F54E4D1A] flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.8332 12.5V18.75C20.8332 21.0521 18.9686 22.9167 16.6665 22.9167H8.33317C6.03109 22.9167 4.1665 21.0521 4.1665 18.75V12.5C4.1665 11.9271 4.63525 11.4584 5.20817 11.4584H7.26025C7.83317 11.4584 8.30192 11.9271 8.30192 12.5V15.7709C8.30192 16.5417 8.729 17.25 9.40609 17.6146C9.70817 17.7813 10.0415 17.8646 10.3853 17.8646C10.7811 17.8646 11.1769 17.75 11.5207 17.5209L12.5103 16.875L13.4269 17.4896C14.0623 17.9167 14.8748 17.9688 15.5519 17.6042C16.2394 17.2396 16.6665 16.5417 16.6665 15.7605V12.5C16.6665 11.9271 17.1353 11.4584 17.7082 11.4584H19.7915C20.3644 11.4584 20.8332 11.9271 20.8332 12.5Z" fill="#FF0000"/>
<path d="M22.3957 7.29171V8.33337C22.3957 9.47921 21.8436 10.4167 20.3123 10.4167H4.68734C3.09359 10.4167 2.604 9.47921 2.604 8.33337V7.29171C2.604 6.14587 3.09359 5.20837 4.68734 5.20837H20.3123C21.8436 5.20837 22.3957 6.14587 22.3957 7.29171Z" fill="#FF0000"/>
<path d="M12.1252 5.20833H6.37522C6.02106 4.82292 6.03147 4.22917 6.40647 3.85417L7.88564 2.375C8.27106 1.98958 8.90647 1.98958 9.29189 2.375L12.1252 5.20833Z" fill="#FF0000"/>
<path d="M18.6147 5.20833H12.8647L15.6981 2.375C16.0835 1.98958 16.7189 1.98958 17.1043 2.375L18.5835 3.85417C18.9585 4.22917 18.9689 4.82292 18.6147 5.20833Z" fill="#FF0000"/>
<path d="M14.5521 11.4584C15.125 11.4584 15.5938 11.9271 15.5938 12.5V15.7605C15.5938 16.5938 14.6667 17.0938 13.9792 16.625L13.0417 16C12.6979 15.7709 12.25 15.7709 11.8958 16L10.9167 16.6459C10.2292 17.1042 9.3125 16.6042 9.3125 15.7813V12.5C9.3125 11.9271 9.78125 11.4584 10.3542 11.4584H14.5521Z" fill="#FF0000"/>
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