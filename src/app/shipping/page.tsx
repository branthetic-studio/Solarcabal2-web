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

      <div className='min-h-200'></div>

      <Suscribe />
      <Footer />
    </div>
  )
}

export default page
