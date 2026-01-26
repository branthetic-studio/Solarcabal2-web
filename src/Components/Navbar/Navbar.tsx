"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "../AuthModal";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import SearchUI from "../SearchUI";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { cart } = useCart();
  const { items: localItems } = useLocalCart();
  const u = useUser() as any;
  const isLoggedIn = !!(u?.me || u?.user || u?.activeCustomer || u?.customer);

  const getCartCount = () => {
    if (isLoggedIn) {
      const lines = cart?.activeOrder?.lines ?? [];
      return lines.length;
    } else {
      return localItems.length;
    }
  };

  const cartCount = getCartCount();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="w-full flex items-center justify-center py-6 bg-[#FAFAFA]">
        <div className="w-full flex items-center justify-between gap- bg-white px-5 mx-12 py-3.5">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/solarcabal.png"
              alt="Company Logo"
              className="object-cover"
              width={50}
              height={50}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <li>
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                  pathname === "/"
                    ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2 font-bold"
                    : "text-gray-700"
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                  pathname === "/products"
                    ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2"
                    : "text-gray-700"
                }`}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/installation"
                className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                  pathname === "/installation"
                    ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2"
                    : "text-gray-700"
                }`}
              >
                Installation
              </Link>
            </li>
            <li>
              <Link
                href="/enquiries"
                className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                  pathname === "/enquiries"
                    ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2"
                    : "text-gray-700"
                }`}
              >
                Enquiries
              </Link>
            </li>
            <li>
              <Link
                href="/referral"
                className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                  pathname === "/referral"
                    ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2"
                    : "text-gray-700"
                }`}
              >
                Referral Program
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                  pathname === "/faq"
                    ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2"
                    : "text-gray-700"
                }`}
              >
                FAQ
              </Link>
            </li>
          </ul>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-0.5">
            <button
              aria-label="Search"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <AuthModal
              trigger={
                <button
                  aria-label="Account"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Image src="/profile.png" alt="User" width={24} height={24} />
                </button>
              }
            />
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Image src="/shop cart.png" alt="Cart" width={20} height={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Image
              src="/solarcabal.png"
              alt="Company Logo"
              className="object-contain"
              width={40}
              height={40}
            />
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Links */}
          <ul className="flex flex-col p-6 space-y-1">
            <li>
              <Link
                href="/"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-orange-50 text-[#FF0000]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/products"
                    ? "bg-orange-50 text-[#FF0000]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/installation"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/installation"
                    ? "bg-orange-50 text-[#FF0000]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                Installation
              </Link>
            </li>
            <li>
              <Link
                href="/enquiries"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/enquiries"
                    ? "bg-orange-50 text-[#FF0000]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                Enquiries
              </Link>
            </li>
            <li>
              <Link
                href="/referral"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/referral"
                    ? "bg-orange-50 text-[#FF0000]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                Referral Program
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/faq"
                    ? "bg-orange-50 text-[#FF0000]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setOpen(false)}
              >
                FAQ
              </Link>
            </li>
          </ul>

          {/* Mobile Actions */}
          <div className="mt-auto p-6 border-t">
            <div className="flex items-center justify-around">
              <button
                aria-label="Search"
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  setShowSearch(true);
                  setOpen(false);
                }}
              >
                <Search className="w-6 h-6 text-gray-700" />
              </button>

              <button
                aria-label="Account"
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Image src="/profile.png" alt="User" width={24} height={24} />
              </button>

              <Link
                href="/cart"
                aria-label="Cart"
                className="relative p-3 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                <Image src="/shop cart.png" alt="Cart" width={20} height={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && <SearchUI onClose={() => setShowSearch(false)} />}
    </>
  );
};

export default Navbar;
