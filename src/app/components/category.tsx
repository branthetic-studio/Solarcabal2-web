"use client"
import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
import profimg1 from "../../Assets/image.png"
import profimg2 from "../../Assets/imagebattery.png"
import profimg3 from "../../Assets/solas.png"
import profimg4 from "../../Assets/img.png"

const Category = () => {
  return (
    <div className='category-container'>
      <h3>Shop by Category</h3>
      <div className='category-grid'>
        <div className='category'>
          <div className='category-img'>
            <Image src={profimg3} alt='' />
          </div>
          <div>
            <h6>Solar Panels</h6>
            <p>High-efficiency panels for optimal
              energy production</p>
          </div>
          <Link href="/products" className='category-btn'>View Products</Link>
        </div>

        <div className='category'>
          <div className='category-img'>
            <Image src={profimg4} alt='' />
          </div>
          <div>
            <h6>Battery Storage</h6>
            <p>Store excess energy for use when
              you need it</p>
          </div>
          <Link href="/products" className='category-btn'>View Products</Link>
        </div>

        <div className='category'>
          <div className='category-img'>
            <Image src={profimg1} alt='' />
          </div>
          <div>
            <h6>Inverters</h6>
            <p>Convert solar energy to usable
              electricity</p>
          </div>
          <Link href="/products" className='category-btn'>View Products</Link>
        </div>

        <div className='category'>
          <div className='category-img'>
            <Image src={profimg2} alt='' />
          </div>
          <div>
            <h6>Complete Systems</h6>
            <p>All-in-one solutions for your energy
              needs</p>
          </div>
          <Link href="/products" className='category-btn'>View Products</Link>
        </div>
      </div>
    </div>
  )
}

export default Category