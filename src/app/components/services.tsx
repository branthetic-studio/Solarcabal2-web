"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import profimg1 from "../../Assets/product.png";
import profimg2 from "../../Assets/install.png";
import profimg3 from "../../Assets/usage.png";
import profimg4 from "../../Assets/customer.png";

const services = () => {
  return (
    <div className="px-4 py-6 md:px-9 md:py-6 bg-[#ffffff]">
      <div className="w-wull mx-auto">
        <h3 className="text-2xl md:text-3xl font-semibold mb-8">Services</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Product Service */}
          <div className="bg-[#fafafa] rounded-2xl p-3 pb-6 flex flex-col items-center">
            <Image
              src={profimg1}
              alt="Products"
              className="w-full h-auto max-h-40 md:max-h-none object-cover rounded-2xl"
            />
            <div className="mt-3 md:mt-4 text-center md:text-left w-full">
              <h4 className="text-base md:text-lg font-semibold text-[#281D1B]">
                Products
              </h4>
              <p className="text-[#281d1b] text-md md:text-md mt-2 md:mt-2.5 leading-relaxed pb-6">
                Revolutionise your energy use with our cutting-edge solar
                solutions.
              </p>
              <Link href="/products" className="w-full md:w-auto bg-[#FF0000] hover:bg-red-700 text-white text-sm md:text-base px-6 md:px-8 py-2.5 md:py-2.5 rounded-full mt-3.5 md:mt-4 transition-colors my-8 md:my-8">
                Shop Now
              </Link>
            </div>
          </div>

          {/* Installation Service */}
          <div className="bg-[#fafafa] rounded-2xl p-3 pb-6 flex flex-col items-center">
            <Image
              src={profimg2}
              alt="Installation"
              className="w-full h-auto max-h-40 md:max-h-none object-cover rounded-2xl"
            />
            <div className="mt-3 md:mt-4 text-center md:text-left w-full">
              <h4 className="text-base md:text-lg font-semibold text-[#281D1B]">
                Solar Packages
              </h4>
              <p className="text-[#281d1b] text-md md:text-md mt-2 md:mt-2.5 leading-relaxed pb-6">
                Enjoy exceptional solar installations that illuminate your
                space.
              </p>
              <Link href="/installation" className="w-full md:w-auto bg-[#FF0000] hover:bg-red-700 text-white text-sm md:text-base px-6 md:px-8 py-2.5 md:py-2.5 rounded-full mt-3.5 md:mt-4 transition-colors">
               Shop Now
              </Link>
            </div>
          </div>

          {/* Usage Service */}
          <div className="bg-[#fafafa] rounded-2xl p-3 flex flex-col items-center">
            <Image
              src={profimg3}
              alt="Usage"
              className="w-full h-auto max-h-40 md:max-h-none object-cover rounded-2xl"
            />
            <div className="mt-3 md:mt-4 text-center md:text-left w-full">
              <h4 className="text-base md:text-lg font-semibold text-[#281D1B]">
                Referral & Rewards
              </h4>
              <p className="text-[#281d1b] text-md md:text-md mt-2 md:mt-2.5 leading-relaxed pb-6">
                Share your referral code, and earn rewards.
              </p>
              <Link href="/referral" className="w-full md:w-auto bg-[#FF0000] hover:bg-red-700 text-white  text-sm md:text-base px-6 md:px-8 py-2.5 md:py-2.5 rounded-full mt-3.5 md:mt-4 transition-colors">
               Refer a Friend
              </Link>
            </div>
          </div>

          {/* Enquiries Service */}
          <div className="bg-[#fafafa] rounded-2xl p-3 pb-6 flex flex-col items-center">
            <Image
              src={profimg4}
              alt="Enquiries"
              className="w-full h-auto max-h-40 md:max-h-none object-cover rounded-2xl"
            />
            <div className="mt-3 md:mt-4 text-center md:text-left w-full">
              <h4 className="text-base md:text-lg font-semibold text-[#281D1B]">
                Enquiries
              </h4>
              <p className="text-[#281d1b] text-md md:text-md mt-2 md:mt-2.5 leading-relaxed pb-6">
                Inquire about our solar solutions and get expert assistance today!
              </p>
              <Link href="/contact" className="w-full md:w-auto bg-[#FF0000] hover:bg-red-700 text-white text-sm md:text-base px-6 md:px-8 py-2.5 md:py-2.5 rounded-full mt-3.5 md:mt-4 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default services;
