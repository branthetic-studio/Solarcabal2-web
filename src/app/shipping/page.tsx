"use client"

import React, { useState } from 'react'
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
          Shipping
        </h2>
        <div>
          <p className="mt-2 text-lg">
            Find answers to common questions about shipping and delivery.
          </p>
        </div>
      </div>

      <div className='min-h-50 py-20 flex items-center justify-center'>
        <div className="text-center text-[#FF0000]">
          <h3 className="text-2xl font-bold">Shipping Information</h3>
          <p className="">
            We offer a variety of shipping options to meet your needs. All orders are processed within 2-3 business days.
          </p>
          <p className="mt-2">
            Standard shipping typically takes 5-7 business days, while expedited shipping options are available at checkout.
          </p>
          <p className="mt-2">
            For any questions regarding your order, please contact our support team.
          </p>
        </div>
      </div>

      <Suscribe />
      <Footer />
    </div>
  )
}

export default page
