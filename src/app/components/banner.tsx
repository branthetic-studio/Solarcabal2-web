"use client"
import React from 'react'
import Image from 'next/image';
import BannerImg from "../../Assets/Image Placeholder.png"

const banner = () => {
  return (
    <div className='banner'>
      <Image src={BannerImg} alt="banner-image" />
      <div className='banner-container'>
        <div className='banner-content'>
          <h1>Your One-Stop Solar Shop</h1>
          <p>Explore top-quality solar energy products, track your orders, and manage everything in one place.</p>
          <button>Shopping Now</button>
        </div>
      </div>

    </div>
  )
}

export default banner
