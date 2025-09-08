"use client"
import React from 'react'
import Image from 'next/image'
import profimg1 from "../../Assets/product.png"
import profimg2 from "../../Assets/install.png"
import profimg3 from "../../Assets/usage.png"
import profimg4 from "../../Assets/customer.png"

const services = () => {
  return (
    <div>
      <div className="services-container">
        <h3>Services</h3>
        <div className='services-content'>
          <div className="service">
            <Image src={profimg1} alt='' />
            <div className='service-text'>
              <h4>Products</h4>
              <p>Revolutionise your energy use with our cutting-edge solar solutions.</p>
              <button className="service-btn">Shop Now</button>
            </div>
          </div>
          <div className="service">
            <Image src={profimg2} alt='' />
            <div className='service-text'>
              <h4>Installation</h4>
              <p>Enjoy exceptional solar installations that illuminate your space.</p>
              <button className="service-btn">Learn More</button>
            </div>
          </div>
          <div className="service">
            <Image src={profimg3} alt='' />
            <div className='service-text'>
              <h4>Usage</h4>
              <p>Track your solar energy usage effortlessly and stay informed.</p>
              <button className="service-btn">Learn More</button>
            </div>
          </div>
          <div className="service">
            <Image src={profimg4} alt='' />
            <div className='service-text'>
              <h4>Enquiries</h4>
              <p>Inquire about our solar solutions and get expert assistance today!</p>
              <button className="service-btn">Contact Us</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default services
