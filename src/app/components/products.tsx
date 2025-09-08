"use client";
import React from "react";
import Image from "next/image";
// import { FaArrowRight } from 'react-icons/fa';
import profimg1 from "../../Assets/image.png";
import profimg2 from "../../Assets/imagebattery.png";
import profimg3 from "../../Assets/solas.png";
import profimg4 from "../../Assets/img.png";
import Rating from "../../Assets/Star Icon.png";

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
    <div className="products-container">
      <div className="products-header">
        <h3>Popular Products</h3>
        <button>More Products </button>
      </div>
      <div className="product-grid">
        <div className="product">
          <div className="product-img">
            <Image src={profimg2} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>

        <div className="product">
          <div className="product-img">
            <Image src={profimg1} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>

        <div className="product">
          <div className="product-img">
            <Image src={profimg4} alt="" />
          </div>
          <div className="product-detail">
            <h6>₦102,349</h6>

            <Rate />

            <h5>2.5kwh Battery </h5>
          </div>
        </div>

        <div className="product">
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
