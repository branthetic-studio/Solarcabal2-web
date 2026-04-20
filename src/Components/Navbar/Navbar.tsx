"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "../AuthModal";
import { Search, Menu, X, LogOut } from "lucide-react";
import SearchUI from "../SearchUI";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";

const Navbar = () => {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const { cart } = useCart();
  const { items: localItems } = useLocalCart();

  const { customer, logout, loading } = useUser();

  useEffect(() => {
    if (customer && authOpen) {
      setAuthOpen(false);
    }
  }, [customer, authOpen]);

  const getCartCount = () => {
    if (customer) {
      return cart?.activeOrder?.lines?.length ?? 0;
    }
    return localItems.length;
  };

  const cartCount = getCartCount();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="w-full flex items-center justify-center py-6 bg-[#FAFAFA]">
        <div className="w-full flex items-center justify-between bg-white px-5 mx-12 py-3.5">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/solarcabal.png"
              alt="Company Logo"
              width={50}
              height={50}
            />
          </Link>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Products" },
              { href: "/installation", label: "Installation" },
              { href: "/enquiries", label: "Enquiries" },
              { href: "/referral", label: "Referral Program" },
              { href: "/faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm font-medium transition-colors hover:text-[#FF0000] ${
                    pathname === href
                      ? "text-[#FF0000] border-b-2 border-[#FF0000] pb-2"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Search */}
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* AUTH AREA */}
            {loading ? (
              <div className="w-10 h-10 animate-pulse rounded-full bg-gray-200" />
            ) : customer ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <Image src="/profile.png" alt="User" width={24} height={24} />
                  <span className="text-sm font-medium text-gray-700">
                    Hi,{" "}
                    {customer.firstName ||
                      customer.emailAddress?.split("@")[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    {/* ✅ FIX: raised from z-10 → z-[60] to sit above referral page decorations */}
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setShowUserMenu(false)}
                    />
                    {/* ✅ FIX: raised from z-20 → z-[70] */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-[70]">
                      <div className="p-3 border-b">
                        <p className="text-sm font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {customer.emailAddress}
                        </p>
                      </div>

                      <Link
                        href="/Accounts"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Account
                      </Link>

                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Orders
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <AuthModal
                open={authOpen}
                onOpenChange={setAuthOpen}
                trigger={
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={() => setAuthOpen(true)}
                  >
                    <Image
                      src="/profile.png"
                      alt="User"
                      width={24}
                      height={24}
                    />
                  </button>
                }
              />
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <Image src="/shop-cart.png" alt="Cart" width={20} height={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex justify-between">
          <Image src="/solarcabal.png" alt="" width={40} height={40} />
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        {customer && !loading && (
          <div className="p-6 border-b bg-gray-50">
            <p className="text-sm font-medium">
              Hi,{" "}
              {customer.firstName ||
                customer.emailAddress?.split("@")[0]}
              !
            </p>
          </div>
        )}

        <div className="p-6">
          {!customer && !loading && (
            <AuthModal
              open={authOpen}
              onOpenChange={setAuthOpen}
              trigger={
                <button onClick={() => setAuthOpen(true)}>
                  Login / Register
                </button>
              }
            />
          )}

          {customer && (
            <button
              onClick={handleLogout}
              className="text-red-600 mt-4"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {showSearch && <SearchUI onClose={() => setShowSearch(false)} />}
    </>
  );
};

export default Navbar;