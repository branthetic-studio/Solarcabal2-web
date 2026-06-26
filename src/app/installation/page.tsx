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
            {/* <Image src={solarPanelImage} alt="" /> */}
            <svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.34799 11.1154C2.34799 10.993 2.39662 10.8756 2.48317 10.789C2.56973 10.7025 2.68712 10.6538 2.80953 10.6538H4.65568C4.77809 10.6538 4.89548 10.7025 4.98204 10.789C5.06859 10.8756 5.11722 10.993 5.11722 11.1154C5.11722 11.2378 5.06859 11.3552 4.98204 11.4417C4.89548 11.5283 4.77809 11.5769 4.65568 11.5769H2.80953C2.68712 11.5769 2.56973 11.5283 2.48317 11.4417C2.39662 11.3552 2.34799 11.2378 2.34799 11.1154ZM6.7626 5.56769C6.80548 5.61057 6.85639 5.64459 6.91242 5.6678C6.96845 5.691 7.0285 5.70295 7.08914 5.70295C7.14978 5.70295 7.20983 5.691 7.26586 5.6678C7.32189 5.64459 7.3728 5.61057 7.41568 5.56769C7.45856 5.52481 7.49258 5.4739 7.51578 5.41787C7.53899 5.36185 7.55094 5.3018 7.55094 5.24115C7.55094 5.18051 7.53899 5.12046 7.51578 5.06443C7.49258 5.0084 7.45856 4.9575 7.41568 4.91461L6.10953 3.61538C6.02065 3.54872 5.91071 3.51636 5.79989 3.52424C5.68907 3.53211 5.58481 3.5797 5.50625 3.65826C5.42769 3.73682 5.3801 3.84108 5.37223 3.9519C5.36435 4.06272 5.39671 4.17266 5.46337 4.26154L6.7626 5.56769ZM12.9634 3.26923C13.0858 3.26923 13.2032 3.2206 13.2897 3.13405C13.3763 3.04749 13.4249 2.9301 13.4249 2.80769V0.961538C13.4249 0.839131 13.3763 0.721737 13.2897 0.635181C13.2032 0.548626 13.0858 0.5 12.9634 0.5C12.841 0.5 12.7236 0.548626 12.637 0.635181C12.5505 0.721737 12.5018 0.839131 12.5018 0.961538V2.80769C12.5018 2.9301 12.5505 3.04749 12.637 3.13405C12.7236 3.2206 12.841 3.26923 12.9634 3.26923ZM18.8376 5.70269C18.8982 5.70274 18.9583 5.69084 19.0143 5.66768C19.0703 5.64451 19.1212 5.61054 19.1641 5.56769L20.4691 4.26154C20.5193 4.22065 20.5603 4.16965 20.5895 4.11188C20.6187 4.0541 20.6354 3.99083 20.6386 3.92617C20.6417 3.86152 20.6312 3.79692 20.6078 3.73659C20.5843 3.67625 20.5485 3.62152 20.5025 3.57595C20.4565 3.53038 20.4015 3.49499 20.3409 3.47208C20.2804 3.44917 20.2157 3.43926 20.1511 3.44298C20.0864 3.4467 20.0233 3.46397 19.9658 3.49367C19.9083 3.52337 19.8577 3.56484 19.8172 3.61538L18.5111 4.91461C18.4464 4.97916 18.4024 5.06143 18.3846 5.15101C18.3667 5.24059 18.3759 5.33345 18.4108 5.41783C18.4458 5.50221 18.505 5.57431 18.581 5.62502C18.657 5.67573 18.7463 5.70276 18.8376 5.70269ZM21.2711 11.5769H23.1172C23.2396 11.5769 23.357 11.5283 23.4436 11.4417C23.5301 11.3552 23.5787 11.2378 23.5787 11.1154C23.5787 10.993 23.5301 10.8756 23.4436 10.789C23.357 10.7025 23.2396 10.6538 23.1172 10.6538H21.2711C21.1486 10.6538 21.0313 10.7025 20.9447 10.789C20.8581 10.8756 20.8095 10.993 20.8095 11.1154C20.8095 11.2378 20.8581 11.3552 20.9447 11.4417C21.0313 11.5283 21.1486 11.5769 21.2711 11.5769ZM8.34799 11.5769C8.47039 11.5769 8.58779 11.5283 8.67434 11.4417C8.7609 11.3552 8.80952 11.2378 8.80952 11.1154C8.80952 10.0137 9.24716 8.95717 10.0262 8.17817C10.8052 7.39917 11.8617 6.96154 12.9634 6.96154C14.065 6.96154 15.1216 7.39917 15.9006 8.17817C16.6796 8.95717 17.1172 10.0137 17.1172 11.1154C17.1172 11.2378 17.1658 11.3552 17.2524 11.4417C17.3389 11.5283 17.4563 11.5769 17.5788 11.5769C17.7012 11.5769 17.8186 11.5283 17.9051 11.4417C17.9917 11.3552 18.0403 11.2378 18.0403 11.1154C18.0403 9.7689 17.5054 8.47756 16.5533 7.52546C15.6012 6.57335 14.3099 6.03846 12.9634 6.03846C11.6169 6.03846 10.3256 6.57335 9.37344 7.52546C8.42134 8.47756 7.88645 9.7689 7.88645 11.1154C7.88645 11.2378 7.93507 11.3552 8.02163 11.4417C8.10818 11.5283 8.22558 11.5769 8.34799 11.5769ZM25.3614 24.2692C25.3211 24.3392 25.2631 24.3973 25.1932 24.4378C25.1234 24.4783 25.0441 24.4997 24.9634 24.5H0.963375C0.882202 24.5003 0.802381 24.4792 0.731962 24.4389C0.661544 24.3985 0.603019 24.3402 0.562293 24.27C0.521567 24.1998 0.50008 24.1201 0.5 24.0389C0.49992 23.9577 0.521249 23.878 0.561837 23.8077L5.25683 15.5C5.2976 15.4294 5.35633 15.3708 5.42706 15.3303C5.4978 15.2898 5.578 15.2687 5.65953 15.2692H20.2672C20.3487 15.2687 20.4289 15.2898 20.4997 15.3303C20.5704 15.3708 20.6291 15.4294 20.6699 15.5L25.3649 23.8077C25.4049 23.8782 25.4256 23.9579 25.425 24.0389C25.4244 24.1199 25.4025 24.1994 25.3614 24.2692ZM20.0018 16.1923H16.3453L16.9476 18.9615H21.563L20.0018 16.1923ZM16.0061 18.9615L15.4038 16.1923H10.5264L9.92414 18.9615H16.0061ZM9.72683 19.8846L8.91914 23.5769H17.0018L16.1941 19.8846H9.72683ZM4.36607 18.9615H8.98145L9.58375 16.1923H5.92491L4.36607 18.9615ZM1.75837 23.5769H7.97645L8.78414 19.8846H3.84107L1.75837 23.5769ZM24.1753 23.5769L22.0891 19.8846H17.1484L17.9503 23.5769H24.1753Z" fill="#FF0000" stroke="#FF0000"/>
</svg>

            <h4>Solar Panels</h4>
          </div>
          <div className="item">
            {/* <Image src={hardwarelImage} alt="" /> */}
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6257 24.1016H3.56684C2.88608 24.1016 2.23319 23.8312 1.75181 23.3498C1.27043 22.8684 1 22.2155 1 21.5348V3.56684C1 2.88608 1.27043 2.23319 1.75181 1.75181C2.23319 1.27043 2.88608 1 3.56684 1H21.5348C22.2155 1 22.8684 1.27043 23.3498 1.75181C23.8312 2.23319 24.1016 2.88608 24.1016 3.56684V10.6257M15.5027 22.3048L16.7861 21.7914M16.4011 1V10.6257M16.6578 18.8396L15.5027 18.4545M18.4545 25L18.8396 23.8449M18.7112 16.7861L18.1979 15.5027M21.6631 16.6578L22.0481 15.5027M22.3048 25L21.7914 23.7166M23.7166 18.7112L25 18.1979M25 22.0481L23.8449 21.6631M8.70053 1V24.1016M24.1016 20.2513C24.1016 22.3778 22.3778 24.1016 20.2513 24.1016C18.1249 24.1016 16.4011 22.3778 16.4011 20.2513C16.4011 18.1249 18.1249 16.4011 20.2513 16.4011C22.3778 16.4011 24.1016 18.1249 24.1016 20.2513Z" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            <h4>Mounting Hardware</h4>
          </div>
          <div className="item">
            {/* <Image src={systemImage} alt="" /> */}
            <svg width="21" height="26" viewBox="0 0 21 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 22V4C1 3.20435 1.31278 2.44129 1.86953 1.87868C2.42628 1.31607 3.18139 1 3.96875 1H18.8125C19.1274 1 19.4295 1.12643 19.6522 1.35147C19.8749 1.57652 20 1.88174 20 2.2V23.8C20 24.1183 19.8749 24.4235 19.6522 24.6485C19.4295 24.8736 19.1274 25 18.8125 25H3.96875C3.18139 25 2.42628 24.6839 1.86953 24.1213C1.31278 23.5587 1 22.7957 1 22ZM1 22C1 21.2044 1.31278 20.4413 1.86953 19.8787C2.42628 19.3161 3.18139 19 3.96875 19H20M6.9375 10L9.3125 12.4L14.0625 7.6" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            <h4>System Testing</h4>
          </div>
          <div className="item">
            {/* <Image src={safetyImage} alt="" /> */}
            <svg width="21" height="26" viewBox="0 0 21 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.9375 12.9985L9.3125 15.3981L14.0625 10.5989M20 14.1983C20 20.1973 15.8438 23.1968 10.9038 24.9365C10.6451 25.0251 10.3641 25.0209 10.1081 24.9245C5.15625 23.1968 1 20.1973 1 14.1983V5.79974C1 5.48153 1.12511 5.17636 1.34781 4.95135C1.57051 4.72634 1.87256 4.59994 2.1875 4.59994C4.5625 4.59994 7.53125 3.16018 9.5975 1.33648C9.84908 1.11932 10.1691 1 10.5 1C10.8309 1 11.1509 1.11932 11.4025 1.33648C13.4806 3.17218 16.4375 4.59994 18.8125 4.59994C19.1274 4.59994 19.4295 4.72634 19.6522 4.95135C19.8749 5.17636 20 5.48153 20 5.79974V14.1983Z" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

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
