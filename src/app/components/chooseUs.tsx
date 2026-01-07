"use client";
import React from "react";
import Image from "next/image";
import profimg1 from "../../Assets/Symbol.png";
import profimg2 from "../../Assets/Symbol (1).png";
import profimg3 from "../../Assets/$.png";
import profimg4 from "../../Assets/Symbol (2).png";

const ChooseUs = () => {
  return (
    <div className="px-4 py-20 md:px-9 md:py-20 bg-[#ffffff]">
      <div className="w-full mx-auto">
        <h3 className="text-2xl md:text-3xl font-semibold mb-8">
          Why Choose SolarCabal?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Premium Quality */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            <Image
              src={profimg1}
              alt="Premium Quality"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            />
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5">
              Premium Quality
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              We only carry top-tier solar products with industry-leading
              warranties.
            </p>
          </div>

          {/* Eco-Friendly */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            <Image
              src={profimg2}
              alt="Eco-Friendly"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            />
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5">
              Eco-Friendly
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              Reduce your carbon footprint and contribute to a sustainable
              future.
            </p>
          </div>

          {/* Save Money */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            <Image
              src={profimg3}
              alt="Save Money"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            />
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5">
              Save Money
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              Cut your electricity bills and enjoy long-term savings.
            </p>
          </div>

          {/* Expert Support */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            <Image
              src={profimg4}
              alt="Expert Support"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            />
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5">
              Expert Support
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              Our team of specialists is always ready to help you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseUs;
