"use client";
import React from "react";
import "./Installation.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import InstallProduct from "./components/PackageList";
import solarPanelImage from "../../Assets/sunvec (1).png";
import hardwarelImage from "../../Assets/Vector (1).png";
import systemImage from "../../Assets/Vector (2).png";
import safetyImage from "../../Assets/Vector (3).png";
import BannerImg from "../../../public/hero.png";
import Image from "next/image";
import Suscribe from "@/Components/Suscribe/Suscribe";
import Link from "next/link";

const steps = [
  {
    title: "Book a Free Consultation",
    description:
      "Tell us about your space, power needs, and budget. Our solar advisors will help you pick the right system, no pressure, just guidance.",
  },
  {
    title: "Site Assessment & Design",
    description:
      "Our certified engineers will assess your roof, wiring, and energy usage (physically or virtually) to design the ideal solar setup for your home or business.",
  },
  {
    title: "Professional Installation",
    description:
      "On your chosen date, our trained technicians will install the full system panels, inverter, batteries, and safety components quickly and cleanly, without disrupting your space.",
  },
  {
    title: "System Activation",
    description:
      "We will run safety tests, guide you through how everything works, and activate your system. You start saving on power from Day One.",
  },
];

const page = () => {
  return (
    <div>
      <Navbar />
      {/* <div className="installation-banner">
        <Image src={BannerImg} alt="installation-banner-image" />
        <div className="installation-banner-container">
          <div className="installation-banner-content">
            <h1>Stress-Free Solar Installation</h1>
            <p>
              Experience seamless solar energy installation with SolarCabal. Our
              expert team ensures a smooth transition to sustainable power,
              tailored to your needs.
            </p>
            <button>Request Installation</button>
          </div>
        </div>
      </div> */}

      <InstallProduct />

      <section className="installation-section">
        <h2 className="installation-title">Our Installation Process</h2>
        <p className="installation-subtitle">
          Getting solar with SolarCabal is simple, safe, and fully handled by
          experts.
        </p>
        <div className="installation-steps">
          {steps.map((step, index) => (
            <div className="installation-step" key={index}>
              <div className="step-indicator"></div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full justify-center align-middle my-16">
          <Link href="/enquiries">
            <button className="request-btn">
              Book a Free Consultation
            </button>
          </Link>
        </div>
      </section>

      <div className="installation-info">
        <h3>What&apos;s Included</h3>
        <div className="included-items">
          <div className="item">
            <Image src={solarPanelImage} alt="" />
            <h4>Solar Panels</h4>
          </div>
          <div className="item">
            <Image src={hardwarelImage} alt="" />
            <h4>Mounting Hardware</h4>
          </div>
          <div className="item">
            <Image src={systemImage} alt="" />
            <h4>System Testing</h4>
          </div>
          <div className="item">
            <Image src={safetyImage} alt="" />
            <h4>Safety Inspections</h4>
          </div>
        </div>
      </div>
      <Suscribe />
      <Footer />
    </div>
  );
};

export default page;
