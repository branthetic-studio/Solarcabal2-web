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

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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

          <button aria-label="Cart">
            <Link href="/cart">
              <ShoppingCart width={24} height={24} />
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
