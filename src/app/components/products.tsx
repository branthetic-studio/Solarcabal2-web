"use client";
import React from "react";
import Image from "next/image";
import { FaArrowRight } from 'react-icons/fa';
import profimg1 from "../../Assets/image.png";
import profimg2 from "../../Assets/imagebattery.png";
import profimg3 from "../../Assets/solas.png";
import profimg4 from "../../Assets/img.png";
import Rating from "../../Assets/Star Icon.png";
import Link from "next/link";

const Rate = () => {
  const rating = 4;
  return (
    <div style={{ display: "flex", gap: "5px" }}>
      {[...Array(5)].map((_, index) => (
        <Image
          key={index}
          src={Rating}
          alt="Star"
          style={{
            width: "20px",
            height: "20px",
            margin: "5px 0",
            opacity: index < rating ? 1 : 0.2,
          }}

          className="bg-[#ffffff]"
        />
      ))}
    </div>
  );
};

const formatPrice = (priceWithTax: any): string => {
  if (!priceWithTax) return "₦—";
  // Vendure search prices are typically minor units
  if ("value" in priceWithTax && typeof priceWithTax.value === "number") {
    return `₦${(priceWithTax.value / 100).toLocaleString()}`;
  }
  if (
    "min" in priceWithTax &&
    "max" in priceWithTax &&
    typeof priceWithTax.min === "number" &&
    typeof priceWithTax.max === "number"
  ) {
    return `₦${(priceWithTax.min / 100).toLocaleString()} - ₦${(
      priceWithTax.max / 100
    ).toLocaleString()}`;
  }
  return "₦—";
};

const Products = () => {
  return (
    <div className="products-container bg-[#ffffff] my-6">
      <div className="products-header">
        <h3>Popular Products</h3>
        <Link className="text-lg flex gap-2 items-center cursor-pointer" href="/products" passHref>
          <span className="text-[#FF0000] font-medium">More Products </span><FaArrowRight className="text-[#ff0000] font-medium" />
        </Link>
      </div>
      <div className="product-grid">
        <div className="product relative">
          <div className="absolute top-2 left-2 flex w-full pr-6 justify-between items-center">
            <span className="bg-[#ff0000] text-white text-sm px-3 py-2 rounded-xl">
              Best Seller
            </span>
            <div className="bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
              <Image src="/fav icon.png" alt="add to favourites" className="" width={25} height={25} />
            </div>
          </div>
          <div className="product-img">
            <Image src={profimg2} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>

        <div className="product relative">
          <div className="absolute top-2 left-2 flex w-full pr-6 justify-between items-center">
            <span className="bg-[#000000] text-white text-sm px-3 py-2 rounded-xl">
              New
            </span>
            <div className="bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
              <Image src="/fav icon.png" alt="add to favourites" className="" width={25} height={25} />
            </div>
          </div>
          <div className="product-img">
            <Image src={profimg1} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>

        <div className="product relative">
          <div className=" flex w-full pr-6 justify-between items-center">

            <div className="absolute top-2 right-2 bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
              <Image src="/fav icon.png" alt="add to favourites" className="" width={25} height={25} />
            </div>
          </div>
          <div className="product-img">
            <Image src={profimg4} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>

        <div className="product relative">
          <div className="flex w-full pr-6 justify-between items-center">
           
            <div className="absolute top-2 right-2 bg-[#ffffff] shadow-lg shadow-black/30 rounded-4xl p-1 cursor-pointer">
              <Image src="/fav icon.png" alt="add to favourites" className="" width={25} height={25} />
            </div>
          </div>
          <div className="product-img">
            <Image src={profimg3} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
