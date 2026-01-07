import React from "react";
import Image from "next/image";

const Suscribe = () => {
  return (
    <div className="bg-[#1C1C1C] py-16 px-20 text-center grid grid-cols-3">
      <Image src="/full logo.png" alt="Logo" width={200} height={200} />
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 text-left">
          Subscribe to our Newsletter
        </h3>
        <p className="text-white text-md mb-8 max-w-2xl mx-auto text-left">
          Subscribe to our newsletter to receive updates
        </p>

        <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            required
            className="w-full sm:flex-1 px-6 py-3 rounded-full bg-white text-gray-800 placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-[#FF0000] text-white rounded-full text-sm hover:bg-gray-900 transition"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Suscribe;
