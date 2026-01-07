"use client"
import React from "react";
import Image from "next/image";
import Customer from "../../Assets/dp.png"

const Testimonial = () => {
  return (
    <div className="testimonial-container bg-[#ffffff] my-4">
      <h2 className="text-4xl font-bold">What Our Customers Say</h2>
      <div className="testimonial-grid">
        <div className="testimonial-card py-12 md:py-12">
          <p>
            I&apos;ve been using SolarCabal&apos;s products for over a year now, and I&apos;m extremely satisfied with the performance. My electricity bills have been reduced by 70%!
          </p>

          <div className="clients-detail">
            <Image src={Customer} alt="" />
            <div>
              <h6>John Smith</h6>
              <p>Home Owner</p>
            </div>
          </div>
        </div>

        <div className="testimonial-card">
          <p>
            I&apos;ve been using SolarCabal&apos;s products for over a year now, and I&apos;m extremely satisfied with the performance. My electricity bills have been reduced by 70%!
          </p>

          <div className="clients-detail">
            <Image src={Customer} alt="" />
            <div>
              <h6>John Smith</h6>
              <p>Home Owner</p>
            </div>
          </div>
        </div>

        <div className="testimonial-card">
          <p>
            I&apos;ve been using SolarCabal&apos;s products for over a year now, and I&apos;m extremely satisfied with the performance. My electricity bills have been reduced by 70%!
          </p>

          <div className="clients-detail">
            <Image src={Customer} alt="" />
            <div>
              <h6>John Smith</h6>
              <p>Home Owner</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Testimonial;