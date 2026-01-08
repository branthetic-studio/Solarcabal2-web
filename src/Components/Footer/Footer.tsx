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
    <footer className="relative bg-linear-to-r from-[#1c1c1c]/95 to-[#3d3d3d]/95 overflow-hidden text-white py-16 pb-0 px-6 md:px-16 z-0">

      {/* Noise Texture */}
      <div className=" w-full absolute inset-0 bg-[url('/texture.png')] opacity-80 mix-blend-multiply pointer-events-none"></div>


      <div className="max-w-7xl mx-auto relative z-20">
        {/* Grid Section */}
        <div className="grid grid-cols-1 pb-20 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Column 1 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Need Help?</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500">FAQs</a></li>
              <li><a href="#" className="hover:text-red-500">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-red-500">Products</a></li>
              <li><a href="#" className="hover:text-red-500">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer service</h3>
            <p className="text-sm text-gray-300 mb-3">Return and refund policy</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span> <Image src="/message.png" alt="Verve" width={15} height={15} /></span> Support@solarcabal.com
              </li>
              <li className="flex items-center gap-2">
                <span> <Image src="/whatsapp.png" alt="Verve" width={15} height={15} /></span> 07074890730, 07074782575
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Useful Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-red-500">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-red-500">Products</a></li>
              <li><a href="#" className="hover:text-red-500">Warranty Information</a></li>
              <li><a href="#" className="hover:text-red-500">Track Your Order</a></li>
              <li><a href="#" className="hover:text-red-500">Gallery</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Earn Money with Solarcabal</h3>
            <ul className="space-y-2 text-sm text-gray-300 mb-4">
              <li><a href="#" className="hover:text-red-500">Referral</a></li>
              <li><a href="#" className="hover:text-red-500">Sell on Solarcabal</a></li>
            </ul>

            <h4 className="font-semibold text-sm mb-3">We accept</h4>
            <div className="flex items-center gap-1 flex-wrap">
              <Image src="/verve.png" alt="Verve" width={30} height={20} />
              <Image src="/visa.png" alt="Visa" width={30} height={20} />
              <Image src="/mastercard.png" alt="Mastercard" width={30} height={20} />
              <Image src="/express.png" alt="PayPal" width={30} height={20} />
              <Image src="/apple pay.png" alt="Apple Pay" width={30} height={20} />
              
              <Image src="/flutterwave.png" alt="PayPal" width={30} height={20} />
              <Image src="/paystack.png" alt="PayPal" width={30} height={20} />
              <Image src="/google pay.png" alt="PayPal" width={30} height={20} />
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex md:flex-row justify-around items-center px-80 pb-8 pt-2">

          {/* Copyright */}
          <p className="text-gray-400 text-xs">
            Copyright © 2025 SolarCabal. All rights reserved
          </p>

          {/* Legal Links */}

          <a href="#" className="text-xs underline hover:text-red-500">Privacy Policy</a>
          <a href="#" className="text-xs underline hover:text-red-500">Terms of Use</a>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
