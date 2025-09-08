"use client"
import React from 'react';
import Image from 'next/image';
import profimg1 from "../../Assets/Symbol.png"
import profimg2 from "../../Assets/Symbol (1).png"
import profimg3 from "../../Assets/$.png"
import profimg4 from "../../Assets/Symbol (2).png"


const ChooseUs = () => {

  return (
    <div>
      <div className="choose-container">
        <h3>Why Choose SolarCabal?</h3>
        <div className='choose-us-content'>
          <div className="choose-us">
            <Image src={profimg1} alt='' />
            <div className='service-text'>
              <h4>Premium Quality</h4>
              <p>We only carry top-tier solar
                products with industry-leading
                warranties.</p>
            </div>
          </div>
          <div className="choose-us">
            <Image src={profimg2} alt='' />
            <div className='service-text'>
              <h4>Eco-Friendly</h4>
              <p>Reduce your carbon footprint
                and contribute to a sustainable
                future.</p>
            </div>
          </div>
          <div className="choose-us">
            <Image src={profimg3} alt='' />
            <div className='service-text'>
              <h4>Save Money</h4>
              <p>Cut your electricity bills and enjoy long-term savings.</p>
            </div>
          </div>
          <div className="choose-us">
            <Image src={profimg4} alt='' />
            <div className='service-text'>
              <h4>Expert Support</h4>
              <p>Our team of specialists is always ready to help you.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )

}

export default ChooseUs