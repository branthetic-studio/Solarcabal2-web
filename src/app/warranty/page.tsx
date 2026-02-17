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
          Warranty Information
        </h2>
        <div>
          <p className="mt-2 text-lg">
            Find answers to common questions about the warranty on our products.
          </p>
        </div>
      </div>

      <div className='min-h-200'>
        <div className='max-w-4xl mx-auto px-6 py-12'>
          <div className='space-y-8'>
            <div>
              <h3 className='text-2xl font-bold text-black mb-4'>Product Warranty Coverage</h3>
              <p className='text-gray-700 mb-4'>
                All our solar products come with a comprehensive warranty to ensure your peace of mind and protection of your investment.
              </p>
            </div>

            <div className='space-y-6'>
              <div className='border-l-4 border-[#FF0000] pl-6'>
                <h4 className='text-xl font-semibold text-black mb-2'>Panel Warranty</h4>
                <p className='text-gray-700'>25-year limited warranty covering manufacturing defects and performance degradation.</p>
              </div>

              <div className='border-l-4 border-[#FF0000] pl-6'>
                <h4 className='text-xl font-semibold text-black mb-2'>Inverter Warranty</h4>
                <p className='text-gray-700'>10-year warranty on all inverters with optional extended coverage available.</p>
              </div>

              <div className='border-l-4 border-[#FF0000] pl-6'>
                <h4 className='text-xl font-semibold text-black mb-2'>Installation Warranty</h4>
                <p className='text-gray-700'>2-year warranty on workmanship and installation quality.</p>
              </div>

              <div className='border-l-4 border-[#FF0000] pl-6'>
                <h4 className='text-xl font-semibold text-black mb-2'>What's Covered?</h4>
                <ul className='text-gray-700 list-disc list-inside space-y-1'>
                  <li>Manufacturing defects</li>
                  <li>Equipment failure</li>
                  <li>Performance issues</li>
                  <li>Material and workmanship</li>
                </ul>
              </div>
            </div>

            <div className='mt-12 bg-[#FF0000]/10 p-6 rounded-lg'>
              <h4 className='text-lg font-semibold text-black mb-2'>Need More Information?</h4>
              <p className='text-gray-700'>Contact our support team for detailed warranty terms and conditions.</p>
            </div>
          </div>
        </div>
      </div>

      <Suscribe />
      <Footer />
    </div>
  )
}

export default page
