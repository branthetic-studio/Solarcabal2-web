import React from "react";

const Refer = () => {
  return (
    <div className="bg-red-600 py-16 px-6 text-center">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Subscribe to our Newsletter
      </h3>
      <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
        Subscribe to our newsletter to receive updates on new products, special
        offers and solar energy tips.
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
          className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default Refer;
