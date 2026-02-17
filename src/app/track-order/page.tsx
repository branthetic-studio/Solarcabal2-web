"use client"
import React from 'react'
import Navbar from '@/Components/Navbar/Navbar'
import Footer from '@/Components/Footer/Footer'
import Suscribe from '@/Components/Suscribe/Suscribe'

const page = () => {
  return (
    <div>
      <Navbar />

      <div
        className="h-100 flex flex-col justify-center mb-20 text-white text-center bg-black/10 bg-blend-overlay bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        <h2 className="text-3xl font-semibold">
          Track Your Order
        </h2>
        <div>
          <p className="mt-2 text-lg">
            Find answers to common questions about tracking your order.
          </p>
        </div>
      </div>


      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="border-l-4 border-[#FF0000] pl-6 py-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Number</h3>
            <input
              type="text"
              placeholder="Enter your order number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF0000]"
            />
          </div>

          <div className="border-l-4 border-[#FF0000] pl-6 py-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Address</h3>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF0000]"
            />
          </div>

          <button className="w-full bg-[#FF0000] text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition">
            Track Order
          </button>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF0000] rounded-full"></span>
              Tracking Tips
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li>• Check your confirmation email for the order number</li>
              <li>• Tracking updates are sent to your registered email</li>
              <li>• Delivery typically takes 5-7 business days</li>
            </ul>
          </div>
        </div>
      </div>

      <Suscribe />
      <Footer />
    </div>
  )
}

export default page
