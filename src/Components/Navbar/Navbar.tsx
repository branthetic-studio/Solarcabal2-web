"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./Navbar.css";
import Logo from "../../Assets/solacabal.png";
import AuthModal from "../AuthModal";
import {
  Search as SearchIcon,
  User as UserIcon,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import SearchUI from "../SearchUI";
import { useCart } from "@/context/CartContext";
import { useLocalCart } from "@/context/LocalCartContext";
import { useUser } from "@/context/UserContext";

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Import cart contexts to get item count
  const { cart } = useCart();
  const { items: localItems } = useLocalCart();
  const u = useUser() as any;
  const isLoggedIn = !!(u?.me || u?.user || u?.activeCustomer || u?.customer);

  // Calculate cart count (number of unique items, not total quantity)
  const getCartCount = () => {
    if (isLoggedIn) {
      // For logged-in users, use server cart - count number of line items
      const lines = cart?.activeOrder?.lines ?? [];
      return lines.length;
    } else {
      // For guest users, use local cart - count number of items
      return localItems.length;
    }
  };

  const cartCount = getCartCount();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="navbar">
        <Image src={Logo} alt="Company Logo" className="logo" />

        <div className="links">
          <ul>
            <li>
              <Link href="/" className={pathname === "/" ? "active-link" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className={pathname === "/products" ? "active-link" : ""}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/installation"
                className={pathname === "/installation" ? "active-link" : ""}
              >
                Installation
              </Link>
            </li>
            <li>
              <Link
                href="/enquiries"
                className={pathname === "/enquiries" ? "active-link" : ""}
              >
                Enquiries
              </Link>
            </li>
            <li>
              <Link
                href="/referral"
                className={pathname === "/referral" ? "active-link" : ""}
              >
                Referral Program
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className={pathname === "/faq" ? "active-link" : ""}
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-actions">
          <button
            className="nav-toggle"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu width={24} height={24} />
          </button>

          {/* ✅ Search Button */}
          <button
            aria-label="Search"
            className="cursor-pointer"
            onClick={() => setShowSearch(true)}
          >
            <SearchIcon width={24} height={24} />
          </button>

          <AuthModal
            trigger={
              <button aria-label="Account" className="cursor-pointer">
                <UserIcon width={24} height={24} />
              </button>
            }
          />

          <button aria-label="Cart" style={{ position: "relative" }}>
            <Link href="/cart">
              <ShoppingCart width={24} height={24} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "600",
                    minWidth: "20px",
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        className={`mobile-menu${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-sheet">
          <div className="mobile-sheet-head">
            <Image src={Logo} alt="Company Logo" className="logo" />
            <button
              className="mobile-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X width={24} height={24} />
            </button>
          </div>

          <ul className="mobile-links" onClick={() => setOpen(false)}>
            <li>
              <Link href="/" className={pathname === "/" ? "active-link" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className={pathname === "/products" ? "active-link" : ""}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/installation"
                className={pathname === "/installation" ? "active-link" : ""}
              >
                Installation
              </Link>
            </li>
            <li>
              <Link
                href="/enquiries"
                className={pathname === "/enquiries" ? "active-link" : ""}
              >
                Enquiries
              </Link>
            </li>
            <li>
              <Link
                href="/referral"
                className={pathname === "/referral" ? "active-link" : ""}
              >
                Referral Program
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className={pathname === "/faq" ? "active-link" : ""}
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* ✅ Search Overlay */}
      {showSearch && <SearchUI onClose={() => setShowSearch(false)} />}
    </>
  );
};

export default Navbar;
