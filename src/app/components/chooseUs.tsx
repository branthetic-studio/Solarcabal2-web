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
            {/* <Image
              src={profimg1}
              alt="Premium Quality"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            /> */}
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.8273 12.793C17.7273 13.4766 14.0177 15.332 11.1867 18.0664L0.253294 2.53906C-0.430047 1.46484 0.350914 0 1.61998 0H12.4558C13.5296 0 14.6035 0.683594 15.0916 1.5625L21.8273 12.793ZM48.38 0C49.6491 0 50.43 1.46484 49.7467 2.53906L38.8132 18.0664C35.9823 15.332 32.2727 13.4766 28.1727 12.793L34.9084 1.5625C35.4942 0.585938 36.4704 0 37.5442 0H48.38ZM25.0488 15.625C34.518 15.625 42.23 23.3398 42.23 32.8125C42.23 42.3828 34.518 50 25.0488 50C15.482 50 7.86766 42.3828 7.86766 32.8125C7.86766 23.3398 15.482 15.625 25.0488 15.625ZM34.0299 31.0547C34.7132 30.3711 34.3227 29.2969 33.4441 29.1016L28.2703 28.418L26.025 23.7305C25.8298 23.3398 25.4393 23.1445 24.9512 23.1445C24.5607 23.1445 24.1702 23.3398 23.975 23.7305L21.7297 28.418L16.5559 29.1016C15.6773 29.2969 15.2868 30.3711 15.9701 31.0547L19.6797 34.668L18.8011 39.7461C18.6059 40.625 19.5821 41.3086 20.4607 40.918L25.0488 38.4766L29.5393 40.918C30.4179 41.3086 31.3941 40.625 31.1989 39.7461L30.3203 34.668L34.0299 31.0547Z" fill="#1C1C1C"/>
</svg>

            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5 mt-4">
              Premium Quality
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              We only carry top-tier solar products with industry-leading
              warranties.
            </p>
          </div>

          {/* Eco-Friendly */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            {/* <Image
              src={profimg2}
              alt="Eco-Friendly"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            /> */}
            <svg width="40" height="40" viewBox="0 0 57 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M54.0341 0.929145C55.9125 5.12785 57 10.2054 57 15.0876C57 31.8824 46.026 45.6502 30.5043 46.7243C22.4963 47.6031 16.4656 43.5021 13.2031 39.2057C8.16097 43.4044 6.28255 47.7008 6.08482 48.0913C5.39277 49.6536 3.61321 50.4348 1.93251 49.7513C0.350682 49.0678 -0.440234 47.3102 0.251817 45.6502C2.62456 40.0845 13.1042 24.9496 38.018 24.9496C38.8089 24.9496 39.5999 24.2661 39.5999 23.3873C39.5999 22.6062 38.8089 21.825 38.018 21.825C25.0668 21.825 15.9713 25.6331 9.64394 30.1248C9.54507 29.4413 9.54507 28.7578 9.54507 28.0743C9.54507 17.724 18.0474 9.32655 28.527 9.32655H36.4362C42.6647 9.32655 48.1022 6.10429 51.167 0.8315C51.8591 -0.340231 53.4409 -0.242587 54.0341 0.929145Z" fill="#1C1C1C"/>
</svg>

            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5 mt-4">
              Eco-Friendly
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              Reduce your carbon footprint and contribute to a sustainable
              future.
            </p>
          </div>

          {/* Save Money */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            {/* <Image
              src={profimg3}
              alt="Save Money"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            /> */}
            <svg width="40" height="40" viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.8571 44.0024C10.2041 43.9208 7.83673 43.676 5.7551 43.2681C3.67347 42.8193 1.77551 42.2073 0.0612246 41.4321V33.5373C1.73469 34.3533 3.7551 35.1081 6.12245 35.8017C8.4898 36.4545 10.7347 36.8421 12.8571 36.9645V27.7234C10.4898 26.785 8.46939 25.8874 6.79592 25.0306C5.16327 24.1738 3.83673 23.2762 2.81633 22.3378C1.83673 21.3586 1.12245 20.2978 0.673469 19.1554C0.22449 17.9723 0 16.6259 0 15.1163C0 13.0763 0.530612 11.3219 1.59184 9.85312C2.69388 8.34353 4.20408 7.13994 6.12245 6.24235C8.08163 5.34476 10.3265 4.79396 12.8571 4.58997V0H16.9592V4.46756C19.2449 4.54917 21.3878 4.81436 23.3878 5.26316C25.4286 5.71195 27.4082 6.36475 29.3265 7.22154L26.5102 14.1983C24.8776 13.5047 23.2245 12.9743 21.551 12.6071C19.9184 12.2399 18.3878 11.9951 16.9592 11.8727V20.6854C19.1633 21.5014 21.2653 22.399 23.2653 23.3782C25.2653 24.3166 26.8776 25.5202 28.102 26.989C29.3673 28.4578 30 30.3958 30 32.8029C30 35.7813 28.9184 38.2701 26.7551 40.2693C24.5918 42.2685 21.3265 43.472 16.9592 43.88V50H12.8571V44.0024ZM16.9592 36.7809C18.3469 36.5361 19.3673 36.1281 20.0204 35.5569C20.6735 34.9449 21 34.1697 21 33.2313C21 32.6601 20.8367 32.1705 20.5102 31.7625C20.2245 31.3137 19.7755 30.9058 19.1633 30.5386C18.5918 30.1306 17.8571 29.7226 16.9592 29.3146V36.7809ZM12.8571 11.9951C12.0408 12.1175 11.3469 12.3215 10.7755 12.6071C10.2041 12.8519 9.7551 13.1987 9.42857 13.6475C9.14286 14.0555 9 14.5451 9 15.1163C9 15.6875 9.12245 16.1975 9.36735 16.6463C9.65306 17.0543 10.0816 17.4623 10.6531 17.8703C11.2245 18.2375 11.9592 18.6251 12.8571 19.033V11.9951Z" fill="#1C1C1C"/>
</svg>

            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5 mt-4">
              Save Money
            </h4>
            <p className="text-[#525252] text-md md:text-md leading-relaxed">
              Cut your electricity bills and enjoy long-term savings.
            </p>
          </div>

          {/* Expert Support */}
          <div className="bg-[#fafafa] rounded-2xl p-6 md:p-8 py-20 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
            {/* <Image
              src={profimg4}
              alt="Expert Support"
              className="w-12 h-12 md:w-14 md:h-14 object-contain mb-4"
            /> */}
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.75 20.3125V31.25C18.75 33.0078 17.2852 34.375 15.625 34.375H14.0625C10.5469 34.375 7.8125 31.6406 7.8125 28.125V23.4375C7.8125 20.0195 10.5469 17.1875 14.0625 17.1875H15.625C17.2852 17.1875 18.75 18.6523 18.75 20.3125ZM35.9375 34.375H34.375C32.6172 34.375 31.25 33.0078 31.25 31.25V20.3125C31.25 18.6523 32.6172 17.1875 34.375 17.1875H35.9375C39.3555 17.1875 42.1875 20.0195 42.1875 23.4375V28.125C42.1875 31.6406 39.3555 34.375 35.9375 34.375ZM25 0C38.8672 0 49.5117 11.6211 50 25V41.2109C50 46.0938 45.9961 50 41.1133 50H23.4375C20.8008 50 18.75 47.9492 18.75 45.3125C18.75 42.7734 20.8008 40.625 23.4375 40.625H26.5625C29.1016 40.625 31.25 42.7734 31.25 45.3125H41.1133C43.457 45.3125 45.3125 43.5547 45.3125 41.2109C45.3125 41.2109 45.2148 25.293 45.2148 25H45.3125C45.3125 13.8672 36.1328 4.6875 25 4.6875C13.7695 4.6875 4.6875 13.8672 4.6875 25V26.5625C4.6875 27.4414 3.90625 28.125 3.125 28.125H1.5625C0.683594 28.125 0 27.4414 0 26.5625V25C0.390625 11.6211 11.0352 0 25 0Z" fill="#1C1C1C"/>
</svg>

            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2.5 mt-4">
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
