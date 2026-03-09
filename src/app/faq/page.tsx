"use client";

import React, { useState } from "react";
import "./Faq.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Suscribe/Suscribe";
import { ChevronDown, ChevronUp } from "lucide-react";

type AccordionItemProps = {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
};

const AccordionItem = ({ title, content, isOpen, onClick }: AccordionItemProps) => (
  <div className="accordion-item">
    <button type="button" className="accordion-header w-full" onClick={onClick}>
      <div className="accordion-flex flex items-center justify-between w-full">
        <span>{title}</span>
        <span className="arrow">{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
      </div>
    </button>

    {isOpen && <div className="accordion-content">{content}</div>}

    <hr className="rule" />
  </div>
);

const Page = () => {
  const [openGettingStarted, setOpenGettingStarted] = useState<number | null>(null);
  const [openProduct, setOpenProduct] = useState<number | null>(null);
  const [openShipping, setOpenShipping] = useState<number | null>(null);

  const toggleGettingStarted = (index: number) => {
    setOpenGettingStarted(openGettingStarted === index ? null : index);
  };

  const toggleProduct = (index: number) => {
    setOpenProduct(openProduct === index ? null : index);
  };

  const toggleShipping = (index: number) => {
    setOpenShipping(openShipping === index ? null : index);
  };

  const items = [
    {
      title: "How do I create an account?",
      content:
        "Click the Sign Up button at the top-right corner of the homepage and fill in your details to get started.",
    },
    {
      title: "What payment methods do you accept?",
      content: "We accept debit cards, credit cards, bank transfers, and selected digital wallets.",
    },
    {
      title: "How can I contact support?",
      content: "You can reach our support team via live chat, email, or the contact page.",
    },
  ];

  const itemsProduct = [
    {
      title: "How do I know which solar product is right for me?",
      content:
        "Use our Solar Product Finder or book a free consultation with our solar advisors to match your energy needs.",
    },
    {
      title: "Do you offer installation services?",
      content:
        "Yes, we provide professional installation services in select cities. You can schedule installation during checkout or request one from your dashboard after purchase.",
    },
    {
      title: "Are the solar kits plug-and-play?",
      content:
        "Some are DIY-friendly, but we recommend using a professional for complete systems to ensure safety and warranty validity.",
    },
  ];

  const itemsShipping = [
    {
      title: "How long does delivery take?",
      content:
        "Delivery typically takes between 2–5 business days depending on your location.",
    },
    {
      title: "Do you ship to rural or remote areas?",
      content:
        "Yes, we ship nationwide including rural areas, though delivery times may vary.",
    },
    {
      title: "What should I do if I receive a damaged product?",
      content:
        "Please contact our support team immediately with photos of the product so we can arrange a replacement.",
    },
  ];

  return (
    <div className="w-full">
      <Navbar />

      {/* Banner */}
      <div className="faq-banner">
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about our services.</p>
      </div>

      {/* FAQ Sections */}
      <div className="pb-20">

        {/* Getting Started */}
        <div className="faqAccordion pt-10">
          <h3>Getting Started</h3>

          {items.map((item, index) => (
            <AccordionItem
              key={item.title}
              title={item.title}
              content={item.content}
              isOpen={openGettingStarted === index}
              onClick={() => toggleGettingStarted(index)}

            />
          ))}
        </div>

        {/* Product & Installation */}
        <div className="faqAccordion">
          <h3>Product & Installation</h3>

          {itemsProduct.map((item, index) => (
            <AccordionItem
              key={item.title}
              title={item.title}
              content={item.content}
              isOpen={openProduct === index}
              onClick={() => toggleProduct(index)}
            />
          ))}
        </div>

        {/* Shipping */}
        <div className="faqAccordion">
          <h3>Shipping & Delivery</h3>

          {itemsShipping.map((item, index) => (
            <AccordionItem
              key={item.title}
              title={item.title}
              content={item.content}
              isOpen={openShipping === index}
              onClick={() => toggleShipping(index)}
            />
          ))}
        </div>

      </div>

      <Refer />
      <Footer />
    </div>
  );
};

export default Page;