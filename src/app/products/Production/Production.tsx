import React from 'react'
import Navbar from '../../../Components/Navbar/Navbar'
import Footer from '../../../Components/Footer/Footer'
// import { Star, ShoppingCart } from 'lucide-react'
import Solar from '../../../Assets/img.png'
import { useState } from 'react'
import './production.css'
import ProductCard from '../components/productCards'
import Image from 'next/image'

const Products = () => {
  const [activeTab, setActiveTab] = useState('Product Detail')
  const tabList = ['Product Detail', 'Reviews', 'Related Product']

  return (
    <main>
      <Navbar />

      <div className="breadcrumb">
        <p>Products</p>
        <span>{`>`}</span>
        <p>Categories</p>
        <span>{`>`}</span>
        <p>Inverters</p>
        <span>{`>`}</span>
        <p>High-Efficiency SKE 3.5KVA Inverter</p>
      </div>

      <section className="product-details">
        <div className="product-image">
          <Image src={Solar} alt="" />
        </div>
        <div className="details">
          <h1>High-Efficiency SKE 3.5KVA Inverter</h1>
          <div className="rating">
            <span>4.8</span>
            <hr />
            <span>1,238 Sold</span>
          </div>
          <p>₦3,050,000</p>
          <p>
            Introducing the SKE 3.5KVA Inverter, a cutting-edge solution
            designed for maximum energy efficiency. With a robust 25-year
            warranty, this inverter is perfect for powering your home or office.
          </p>
          <hr />
          <div className="buttons">
            <button>Buy Now</button>
            <button>Add to Cart</button>
          </div>
        </div>
      </section>

      <section className="product-tabs">
        <div className="tab-con">
          {tabList.map((tab) => (
            <p
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </p>
          ))}
        </div>

        <ProductCard status={activeTab} />
      </section>

      <Footer />
    </main>
  )
}

export default Products
