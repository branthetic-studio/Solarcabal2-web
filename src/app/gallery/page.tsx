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
          Gallery
        </h2>
        <div>
          <p className="mt-2 text-lg">
            View our product gallery and see the quality of our solar panels.
          </p>
        </div>
      </div>

      <div className='min-h-200'>
        
      </div>

      <Suscribe />
      <Footer />
    </div>
  )
}

export default page
