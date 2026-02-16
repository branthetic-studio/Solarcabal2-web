"use client"

import React, { useState } from 'react'
import Navbar from '@/Components/Navbar/Navbar'
import Footer from '@/Components/Footer/Footer'
import Suscribe from '@/Components/Suscribe/Suscribe'

const page = () => {
  return (
    <div>
      <Navbar />
      <Suscribe />
      <Footer />
    </div>
  )
}

export default page
