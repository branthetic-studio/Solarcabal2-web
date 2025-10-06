import React from "react";
import Image from "next/image";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-[#1c1c1c]/95 overflow-hidden text-white py-20 px-6 md:px-16 z-0">
      {/* Background gradient decorations */}
      <div className="absolute -top-20 -right-20 pointer-events-none opacity-30 z-10">
        <Image
          src="/footershadow1.png"
          alt="Footer shadow"
          width={537}
          height={542}
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute -bottom-20 -left-20 pointer-events-none opacity-30 z-10">
        <Image
          src="/footershadow2.png"
          alt="Footer shadow"
          width={537}
          height={542}
          className="object-cover"
          priority
        />
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-20">
        {/* Left: Logo + About */}
        <div className="max-w-xs">
          <Image
            src="/solarcabal.png"
            alt="SolarCabal Logo"
            width={60}
            height={60}
          />
          <p className="mt-4 text-gray-300 text-sm leading-relaxed">
            SolarCabal is dedicated to providing high-quality solar energy
            solutions to homeowners and businesses, helping them reduce their
            carbon footprint and save on energy costs.
          </p>
        </div>

        <div className="flex flex-col items-start justify-center gap-8 pt-6">
          {/* Top: Navigation */}
          <div className="flex flex-row gap-3 text-xs font-medium md:items-start items-center">
            <a href="#" className="hover:text-red-500 transition">
              FAQs
            </a>
            <a href="#" className="hover:text-red-500 transition">
              Shipping & Returns
            </a>
            <a href="#" className="hover:text-red-500 transition">
              Products
            </a>
            <a href="#" className="hover:text-red-500 transition">
              Warranty Information
            </a>
            <a href="#" className="hover:text-red-500 transition">
              Track Your Order
            </a>
            <a href="#" className="hover:text-red-500 transition">
              Contact Us
            </a>
          </div>

          {/* Bottom: Social + Legal */}
          <div className="flex flex-col items-center md:items-start gap-5">
            {/* Social Icons */}
            <div className="flex gap-3 items-start justify-start">
              <a
                href="#"
                className="bg-white text-black rounded-full p-2 hover:bg-red-500 hover:text-white transition"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="#"
                className="bg-white text-black rounded-full p-2 hover:bg-red-500 hover:text-white transition"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="bg-white text-black rounded-full p-2 hover:bg-red-500 hover:text-white transition"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                className="bg-white text-black rounded-full p-2 hover:bg-red-500 hover:text-white transition"
              >
                <FaLinkedinIn size={18} />
              </a>
              <a
                href="#"
                className="bg-white text-black rounded-full p-2 hover:bg-red-500 hover:text-white transition"
              >
                <FaYoutube size={18} />
              </a>
            </div>

            {/* Copyright + Legal */}
            <div className="flex gap-3 items-center justify-center">
              <p className="text-gray-400 text-xs text-center md:text-right">
                Copyright © 2025 SolarCabal. All rights reserved
              </p>
              <div className="flex gap-4 text-xs">
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="hover:underline">
                  Terms of Use
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
