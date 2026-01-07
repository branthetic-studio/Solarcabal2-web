"use client";
import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import Banner from "./components/banner";
import Footer from "../Components/Footer/Footer";
import Refer from "../Components/Refer/Refer";
import Testimonial from "./components/testimonial";
import Services from "./components/services";
import ChooseUs from "./components/chooseUs";
import Reward from "./components/reward";
import Category from "./components/category";
import Products from "../app/components/products";
import "./home.css";

export default function Home() {
  return (
    <div className="w-full bg-[#FAFAFA]">
      <Navbar />
      <Banner />
      <Services />
      {/* <Category /> */}
      <Products />
      <ChooseUs />
      <Reward />
      <Testimonial />
      <Refer />
      <Footer />
    </div>
  );
}
