"use client";

import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Refer/Refer";
import "./Enquiries.css";
import Image from "next/image";
// (Removed GraphQL imports)
// import { useMutation } from "@apollo/client/react";
// import { gql } from "@apollo/client";
// import { Mail, Phone, MapPin, Handshake, Package } from "lucide-react";

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
    <div>
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
                <div className="rounded-md bg-gray-100 p-3">
                  <Image src="/email.png" alt="" width={30} height={30} />
                </div>

                <div>
                  <h6>Email</h6>
                  <p>support@solarcabal.com</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-md bg-gray-100 p-3">
                  <Image src="/rename.png" alt="" width={30} height={30} />
                </div>

                <div>
                  <h6>Phone</h6>
                  <p>+234 123 123 4567</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-md bg-gray-100 p-3">
                  <Image src="/location.png" alt="" width={30} height={30} />
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
                <div className="rounded-md bg-gray-100 p-3">
                  <Image src="/partner.png" alt="" width={30} height={30} />
                </div>

                <div>
                  <h6>Partnerships</h6>
                  <p>partnerships@solarcabal.com</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-md bg-gray-100 p-3">
                  <Image src="/box.png" alt="" width={30} height={30} />
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
              <input
                type="tel"
                placeholder="+1 2345 678 4321"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
      <Footer />
    </div>
  );
};

export default Page;
