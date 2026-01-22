"use client";

import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Suscribe/Suscribe";
import "./Enquiries.css";
import Image from "next/image";
// (Removed GraphQL imports)
// import { useMutation } from "@apollo/client/react";
// import { gql } from "@apollo/client";
// import { Mail, Phone, MapPin, Handshake, Package } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const Page = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Local-only state now that GraphQL is removed
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setLoading(true);

    try {
      // No GraphQL call — just simulate success
      await new Promise((r) => setTimeout(r, 600));
      setSuccessMessage("Message sent successfully!");
      // Optionally clear the form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Navbar />
      <div className="enquiries-banner">
        <h2>Reach Us Anytime</h2>
        <div>
          <p>Mon-Fri: 9am - 5pm</p>
          <p>1234 Elm Street, Springfield, USA</p>
        </div>
      </div>

      <div className="enquiries-container">
        <div className="enquiries-content">
          <div className="enquiries-header">
            <h3>Contact Us</h3>
            <p>
              We&apos;re here to help you with any questions or inquiries you
              may have about our solar solutions. Please fill out the form
              below, and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="contact-info">
            <h3>Other Ways to Reach Us</h3>
            <div className="reach-us">
              <div className="contact-info-details flex gap-4 align-center">
                <div className="rounded-full bg-gray-100 p-3 flex items-center justify-center">
                  <Image src="/email.png" alt="" width={25} height={25} />
                </div>

                <div>
                  <h6 >Email</h6>
                  <p>support@solarcabal.com</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-full bg-gray-100 p-3 flex items-center justify-center">
                  <Image src="/rename.png" alt="" width={25} height={25} />
                </div>

                <div>
                  <h6>Phone</h6>
                  <p>+234 123 123 4567</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-full bg-gray-100 p-3 flex items-center justify-center">
                  <Image src="/location.png" alt="" width={25} height={25} />
                </div>

                <div>
                  <h6>Address</h6>
                  <p>123 Solar Street, Energy City, Lagos State</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-info">
            <h3>Partnerships & Bulk Inquiries</h3>
            <div className="reach-us">
              <div className="flex gap-4 align-center">
                <div className="rounded-full bg-gray-100 p-3 flex items-center justify-center">
                  <Image src="/partner.png" alt="" width={25} height={25} />
                </div>

                <div>
                  <h6>Partnerships</h6>
                  <p>partnerships@solarcabal.com</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-full bg-gray-100 p-3 flex items-center justify-center">
                  <Image src="/box.png" alt="" width={25} height={25} />
                </div>

                <div>
                  <h6>Bulk Inquiries</h6>
                  <p>bulk@solarcabal.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Form (no GraphQL) */}
        <div className="enquiries-form">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="name-fields">
              <div className="input-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="Type here..."
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Type here..."
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Your email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <PhoneInput
                defaultCountry="ng"
                value={form.phone}
                onChange={(phone) => setForm({ ...form, phone })}
                className="w-full flex items-center"
                inputClassName="w-full h-[50px] border border-gray-300 rounded-2xl pl-14 text-[16px] bg-[#fafafa]"
                inputStyle={{
                  height: "50px",
                  fontSize: "16px",
                  borderRadius: "24px",
                  // borderLeft: "0px"
                  borderBottomLeftRadius: "0px",
                  borderTopLeftRadius: "0px",
                }}
                countrySelectorStyleProps={{
                  buttonStyle: {
                    height: "50px",
                    width: "55px",
                    borderRadius: "24px",
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                    background: "#fafafa",
                  },
                }}
              />

            </div>

            <div className="input-group">
              <label>Subject</label>
              <input
                type="text"
                placeholder="Enter Subject (optional)"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Message</label>
              <textarea
                placeholder="Enter Message (optional)"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>

            {/* ✅ Submission feedback */}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && (
              <p className="text-green-600">✅ {successMessage}</p>
            )}
          </form>
        </div>
      </div>

      <Refer />
      {/* <Suscribe /> */}
      <Footer />
    </div>
  );
};

export default Page;
