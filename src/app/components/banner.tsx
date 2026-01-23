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

        {/* Sidebar Categories */}
        <aside className="hidden lg:flex w-72 flex-shrink-0">
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
                    <span className="text-sm font-medium">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Hero Banner */}
        <div className="flex-1 relative rounded-2xl overflow-hidden shadow-lg min-h-80 sm:min-h-95 md:min-h-112 lg:min-h-125">

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

          {/* Centered Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-40">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Your One-Stop
              <br />
              Solar Shop
            </h1>

            <p className="text-sm sm:text-base md:text-md text-gray-200 mb-5 md:mb-8 max-w-xl leading-relaxed">
              Explore top-quality solar energy products, track your orders, and
              manage everything in one place.
            </p>

            <div className="flex gap-4 flex-wrap ">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
              >
                Shop Now
              </Link>
              <Link
                href="/installation"
                className="inline-flex items-center justify-center border boreder-red-600  hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
              >
                Installation
              </Link>
              <Link
                href="/referral"
                className="inline-flex items-center justify-center bg-white hover:bg-red-700 hover:text-white text-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-fit text-xs sm:text-xs font-medium"
              >
                Referral
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
