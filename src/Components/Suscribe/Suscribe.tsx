import React, { useState } from "react";
import Image from "next/image";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { TbBrandX } from "react-icons/tb";

const Suscribe = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="bg-[#1C1C1C] w-full py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-center md:text-left">

      <div className="">
        <Image src="/full logo.png" alt="Logo" className="object-contain" width={180} height={180} />
      </div>

      <div className="pr-16">
        <h3 className="text-lg md:text-lg font-bold text-white mb-4 text-left">
          Subscribe to our Newsletter
        </h3>

        <p className="text-sm text-gray-300 mb-8 max-w-2xl text-left">
          Subscribe to our newsletter to receive updates
        </p>

        <form className="flex flex-col sm:flex-row items-center justify-start gap-4 max-w-xl">
          <input
            type="email"
            placeholder="Enter your email address"
            required
            className="w-full text-sm sm:flex-1 px-6 py-3 rounded-full bg-white text-gray-800 placeholder-gray-500 focus:outline-none"
          />

          <button
            type="submit"
            className="px-8 py-3 bg-[#FF0000] text-white rounded-full text-xs hover:bg-gray-900 transition"
          >
            Subscribe
          </button>
        </form>

        {/* Checkbox Section */}
        <div className="flex items-start gap-3 mt-6">
          <input
            type="checkbox"
            id="legal"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className="h-4 w-4 mt-1 accent-[#ED544E] cursor-pointer"
          />

          <div className="text-gray-300 text-sm text-left leading-snug">
            <p>
              I agree to SolarCabal’s Privacy and Cookie Policy. You can unsubscribe
              from newsletters at any time.
            </p>

            {/* Legal terms link that turns red when checked */}
            <p
              className={`mt-1 cursor-pointer ${checked ? "text-[#ED544E]" : "text-gray-400"
                }`}
            >
              I accept the Legal Terms
            </p>
          </div>
        </div>
      </div>


      <div>
        <section className="text-white">

          <div className="mx-auto text-center md:text-left">

            {/* Header */}
            <h2 className="text-lg md:text-lg font-semibold mb-10">
              Download the SolarCabal App
            </h2>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-gray-300 mb-6">
              <p className="flex items-center gap-3 text-sm md:text-sm">
                <span><Image src="/down arrow.png" alt="sales" width={20} height={20} /></span> Sales alerts
              </p>
              <p className="flex items-center gap-3 text-sm md:text-sm">
                <span><Image src="/truck-fast.png" alt="sales" width={20} height={20} /></span> Track orders any time
              </p>

              <p className="flex items-center gap-3 text-sm md:text-sm">
                <span><Image src="/tag.png" alt="sales" width={20} height={20} /></span> Coupons & offers
              </p>
              <p className="flex items-center gap-3 text-sm md:text-sm">
                <span><Image src="/ticket-discount.png" alt="sales" width={20} height={20} /></span> Exclusive offers
              </p>

              <p className="flex items-center gap-3 text-sm md:text-sm">
                <span><Image src="/security-safe.png" alt="sales" width={20} height={20} /></span> Quicker, safer checkout
              </p>
              <p className="flex items-center gap-3 text-sm md:text-sm">
                <span><Image src="/timer.png" alt="sales" width={20} height={20} /></span> Low stock items alerts
              </p>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">

              {/* Apple Store */}
              <a
                href="#"
                className="flex items-center gap-3 border border-gray-500 px-6 py-3 rounded-full"
              >
                <Image
                  src="/apple-icon.png"
                  alt="Apple"
                  width={30}
                  height={30}
                />
                <div className="text-left leading-tight">
                  <p className="text-xs text-gray-300">Download on the</p>
                  <p className="text-md font-semibold">App Store</p>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-3 border border-gray-500 px-6 py-3 rounded-full "
              >
                <Image
                  src="/googleplay-icon.png"
                  alt="Google Play"
                  width={30}
                  height={30}
                />
                <div className="text-left leading-tight">
                  <p className="text-xs text-gray-300">Get it on</p>
                  <span className="text-md font-semibold">Google Play</span>
                </div>
              </a>

            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-md font-semibold mb-4">Connect with us</h3>
              <div className="flex items-center gap-6 text-2xl">

                <a href="#" className="hover:text-red-500 transition">
                  <FaInstagram />
                </a>

                <a href="#" className="hover:text-red-500 transition">
                  <FaFacebookF />
                </a>

                <a href="#" className="hover:text-red-500 transition">
                  <TbBrandX />
                </a>

                <a href="#" className="hover:text-red-500 transition">
                  <FaLinkedinIn />
                </a>

                <a href="#" className="hover:text-red-500 transition">
                  <FaTiktok />
                </a>

                <a href="#" className="hover:text-red-500 transition">
                  <FaYoutube />
                </a>

              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
};

export default Suscribe;
