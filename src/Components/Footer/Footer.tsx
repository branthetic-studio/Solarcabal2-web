import React from 'react'
import Logo from '../../Assets/solacabal.png'
import './Footer.css';
import Image from "next/image"
// import {
//   FaFacebookF,
//   FaTwitter,
//   FaInstagram,
//   FaLinkedinIn,
//   FaYoutube,
// } from 'react-icons/fa';

const Footer = () => {
  return (
    <div>
      <footer className="footer">
      <div className="footer-container">
        {/* Left: Logo + About */}
        <div className="footer-about">
          <Image src={Logo}alt="Logo" className="footer-logo" />
          <h3>About Us</h3>
          <p>
            SolarCabal is dedicated to providing high-quality solar energy
            solutions to homeowners and businesses, helping them reduce their
            carbon footprint and save on energy costs.
          </p>
        </div>

        {/* Center: Navigation */}
        <div className="footer-links">
          <a href="#">FAQs</a>
          <a href="#">Shipping & Returns</a>
          <a href="#">Products</a>
          <a href="#">Warranty Information</a>
          <a href="#">Track Your Order</a>
          <a href="#">Contact Us</a>
        </div>

        {/* Right: Social + Legal */}
        <div className="footer-social">
          <div className="social-icons">
            {/* <FaFacebookF />
            <FaTwitter />
            <FaInstagram />
            <FaLinkedinIn />
            <FaYoutube /> */}
          </div>
          <p>Copyright © 2025 SolarCabal. All rights reserved</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
    </div>
  )
}

export default Footer
