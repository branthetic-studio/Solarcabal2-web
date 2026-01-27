"use client"
import React, { useState } from 'react'
import './Faq.css';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import Refer from '../../Components/Suscribe/Suscribe';
import { ChevronDown, ChevronUp } from 'lucide-react';


type AccordionItemProps = {
  title: string;
  content: string;
  isOpen: boolean;
  onClick: () => void;
};


const AccordionItem = ({ title, content, isOpen, onClick }: AccordionItemProps) => (
  <div className="accordion-item">
    <button className="accordion-header" onClick={onClick}>

      <div className='accordian-flex'>
        <span className="">{title}</span>

        <span className="arrow">{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
      </div>
    </button>
    {isOpen && <div className="accordion-content">{content}</div>}
    <hr className='rule' />
  </div>
);

const page = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const items = [
    { title: 'How do I create an account?', content: 'Click the Sign Up button at the top-right corner of the homepage and fill in your details to get started.' },
    { title: 'What payment methods do you accept?', content: 'This is the content of section 2.' },
    { title: 'How can I contact support?', content: 'This is the content of section 3.' },
  ];

  const itemsProduct = [
    { title: 'How do I know which solar product is right for me?', content: 'Use our Solar Product Finder or book a free consultation with our solar advisors to match your energy needs.' },
    { title: 'Do you offer installation services?', content: 'Yes, we provide professional installation services in select cities. You can schedule installation during checkout or request one from your dashboard after purchase.' },
    { title: 'Are the solar kits plug-and-play?', content: 'Some are DIY-friendly, but we recommend using a professional for complete systems to ensure safety and warranty validity.' },
  ];

  const itemShipping = [
    { title: 'How long does delivery take?', content: 'Click the Sign Up button at the top-right corner of the homepage and fill in your details to get started.' },
    { title: 'Do you ship to rural or remote areas?', content: 'This is the content of section 2.' },
    { title: 'What should I do if I receive a damaged product?', content: 'This is the content of section 3.' },
  ];

  return (
    <div className='w-full'>
      <Navbar />
      <div className='faq-banner'>
        <h2>
          Frequently Asked Questions
        </h2>
        <div>
          <p>Find answers to common questions about our services.</p>

        </div>
      </div>


      <div className='pb-20'>
        <div className="faqAccordion pt-10">
          <h3>Getting Started</h3>
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              title={item.title}
              content={item.content}
              isOpen={openIndex === index}
              onClick={() => toggle(index)}
            />
          ))}
        </div>


        <div className="faqAccordion">
          <h3>Product & Installation</h3>
          {itemsProduct.map((item, index) => (
            <AccordionItem
              key={index}
              title={item.title}
              content={item.content}
              isOpen={openIndex === index}
              onClick={() => toggle(index)}
            />
          ))}
        </div>


        <div className="faqAccordion">
          <h3>Shipping & Delivery</h3>
          {itemShipping.map((item, index) => (
            <AccordionItem
              key={index}
              title={item.title}
              content={item.content}
              isOpen={openIndex === index}
              onClick={() => toggle(index)}
            />
          ))}
        </div>

      </div>
      <Refer />
      <Footer />
    </div>
  )
}

export default page
