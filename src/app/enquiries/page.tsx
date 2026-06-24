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
        err?.message ?? "Something went wrong. Please try again.",
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
                <div className="rounded-[30px] bg-[#F5F5F5] p-3 flex items-center justify-center h-[45px] w-[45px]">
                  {/* <Image src="/email.png" alt="" width={25} height={25} /> */}
                  <svg
                    width="20"
                    height="15"
                    viewBox="0 0 20 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M18.75 0H0.75C0.335786 0 0 0.335786 0 0.75V13.5C0 14.3284 0.671573 15 1.5 15H18C18.8284 15 19.5 14.3284 19.5 13.5V0.75C19.5 0.335786 19.1642 0 18.75 0ZM9.75 7.98281L2.67844 1.5H16.8216L9.75 7.98281ZM7.00406 7.5L1.5 12.5447V2.45531L7.00406 7.5ZM8.11406 8.51719L9.23906 9.55313C9.52592 9.81645 9.96658 9.81645 10.2534 9.55313L11.3784 8.51719L16.8159 13.5H2.67844L8.11406 8.51719ZM12.4959 7.5L18 2.45437V12.5456L12.4959 7.5Z"
                      fill="#262626"
                    />
                  </svg>
                </div>

                <div>
                  <h6>Email</h6>
                  <p>support@solarcabal.com</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-[30px] bg-[#F5F5F5] p-3 flex items-center justify-center h-[45px] w-[45px]">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M17.8472 12.6056L13.4306 10.6266L13.4184 10.6209C12.9526 10.4217 12.4177 10.4711 11.9963 10.7522C11.9718 10.7683 11.9483 10.7859 11.9259 10.8047L9.64406 12.75C8.19844 12.0478 6.70594 10.5666 6.00375 9.13969L7.95187 6.82312C7.97062 6.79969 7.98844 6.77625 8.00531 6.75094C8.28032 6.3307 8.32677 5.80073 8.12906 5.33906V5.32781L6.14437 0.90375C5.88009 0.293904 5.246 -0.0693076 4.58625 0.01125C1.95833 0.357054 -0.00475144 2.59943 0 5.25C0 12.6938 6.05625 18.75 13.5 18.75C16.1506 18.7548 18.3929 16.7917 18.7388 14.1637C18.8195 13.5042 18.4567 12.8702 17.8472 12.6056ZM13.5 17.25C6.87558 17.2428 1.50723 11.8744 1.5 5.25C1.4927 3.35618 2.89195 1.75108 4.76906 1.5C4.76869 1.50374 4.76869 1.50751 4.76906 1.51125L6.73781 5.9175L4.8 8.23687C4.78033 8.25951 4.76246 8.28364 4.74656 8.30906C4.45961 8.74938 4.42405 9.30777 4.65281 9.78094C5.50219 11.5181 7.2525 13.2553 9.00844 14.1038C9.48515 14.3304 10.0459 14.2898 10.485 13.9969C10.5091 13.9807 10.5322 13.9631 10.5544 13.9444L12.8334 12L17.2397 13.9734C17.2397 13.9734 17.2472 13.9734 17.25 13.9734C17.002 15.8533 15.3962 17.2564 13.5 17.25Z"
                      fill="#262626"
                    />
                  </svg>
                </div>

                <div>
                  <h6>Phone</h6>
                  <p>+234 123 123 4567</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-[30px] bg-[#F5F5F5] p-3 flex items-center justify-center h-[45px] w-[45px]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_15512_12524)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12 6C9.92893 6 8.25 7.67893 8.25 9.75C8.25 11.8211 9.92893 13.5 12 13.5C14.0711 13.5 15.75 11.8211 15.75 9.75C15.75 7.67893 14.0711 6 12 6ZM12 12C10.7574 12 9.75 10.9926 9.75 9.75C9.75 8.50736 10.7574 7.5 12 7.5C13.2426 7.5 14.25 8.50736 14.25 9.75C14.25 10.9926 13.2426 12 12 12ZM12 1.5C7.44579 1.50517 3.75517 5.19579 3.75 9.75C3.75 12.6938 5.11031 15.8138 7.6875 18.7734C8.84552 20.1108 10.1489 21.3151 11.5734 22.3641C11.8318 22.545 12.1757 22.545 12.4341 22.3641C13.856 21.3147 15.1568 20.1104 16.3125 18.7734C18.8859 15.8138 20.25 12.6938 20.25 9.75C20.2448 5.19579 16.5542 1.50517 12 1.5ZM12 20.8125C10.4503 19.5938 5.25 15.1172 5.25 9.75C5.25 6.02208 8.27208 3 12 3C15.7279 3 18.75 6.02208 18.75 9.75C18.75 15.1153 13.5497 19.5938 12 20.8125Z"
                        fill="#262626"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_15512_12524">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
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
                <div className="rounded-[30px] bg-[#F5F5F5] p-3 flex items-center justify-center h-[45px] w-[45px]">
                <svg width="24" height="17" viewBox="0 0 24 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.9716 15.9338C10.8882 16.2677 10.5883 16.5019 10.2441 16.502C10.1809 16.5023 10.118 16.4947 10.0566 16.4795L7.05664 15.7295C6.97312 15.7085 6.89384 15.6733 6.82227 15.6254L4.57227 14.1254C4.22769 13.8955 4.13472 13.4298 4.36461 13.0852C4.5945 12.7407 5.06019 12.6477 5.40477 12.8776L7.54602 14.3054L10.4204 15.0245C10.6144 15.0715 10.7816 15.1939 10.885 15.3646C10.9885 15.5352 11.0197 15.7401 10.9716 15.9338ZM23.4113 6.8907C23.287 7.26825 23.017 7.58046 22.6613 7.75789L20.4413 8.86789L15.2776 14.0326C15.0912 14.2188 14.8207 14.2936 14.5651 14.2295L8.56508 12.7295C8.47383 12.7065 8.38767 12.6668 8.31102 12.6123L3.10602 8.89602L0.829766 7.75789C0.0889753 7.38757 -0.211511 6.48695 0.158516 5.74602L2.4882 1.08758C2.85852 0.346788 3.75914 0.0463018 4.50008 0.416328L6.5682 1.44758L11.537 0.028203C11.6718 -0.0103526 11.8147 -0.0103526 11.9495 0.028203L16.9182 1.44758L18.9863 0.416328C19.7273 0.0463018 20.6279 0.346788 20.9982 1.08758L23.3279 5.74602C23.5074 6.10115 23.5374 6.5133 23.4113 6.8907ZM19.082 8.10383L16.531 3.00195H13.5479L9.49414 6.93945C10.681 7.69789 12.542 7.90695 14.2116 6.22414C14.4817 5.95193 14.9136 5.92726 15.2129 6.16695L18.4388 8.75164L19.082 8.10383ZM1.50008 6.41633L3.15852 7.24602L5.4882 2.58758L3.82977 1.75789L1.50008 6.41633ZM17.3691 9.81383L14.7713 7.73352C12.9395 9.23352 10.6135 9.43133 8.68602 8.20227C8.30196 7.95797 8.04961 7.55249 8.00003 7.10003C7.95044 6.64757 8.10899 6.19707 8.43102 5.87539C8.43327 5.87266 8.43579 5.87015 8.43852 5.86789L12.6441 1.78883L11.7441 1.53195L7.01727 2.88289L4.45133 8.01383L9.06383 11.3091L14.5145 12.6713L17.3691 9.81383ZM21.9854 6.41633L19.6585 1.75789L18.0001 2.58758L20.3298 7.24602L21.9854 6.41633Z" fill="#262626"/>
</svg>

                </div>

                <div>
                  <h6>Partnerships</h6>
                  <p>partnerships@solarcabal.com</p>
                </div>
              </div>

              <div className="flex gap-4 align-center">
                <div className="rounded-[30px] bg-[#F5F5F5] p-3 flex items-center justify-center h-[45px] w-[45px]">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.72 4.69961L10.47 0.185547C10.0219 -0.062034 9.47808 -0.062034 9.03 0.185547L0.78 4.70148C0.300138 4.96404 0.00124168 5.46699 0 6.01398V14.9802C0.00124168 15.5272 0.300138 16.0302 0.78 16.2927L9.03 20.8087C9.47808 21.0563 10.0219 21.0563 10.47 20.8087L18.72 16.2927C19.1999 16.0302 19.4988 15.5272 19.5 14.9802V6.01492C19.4998 5.46692 19.2007 4.96265 18.72 4.69961ZM9.75 1.49805L17.2819 5.62305L14.4909 7.15117L6.95813 3.02617L9.75 1.49805ZM9.75 9.74805L2.21812 5.62305L5.39625 3.88305L12.9281 8.00805L9.75 9.74805ZM1.5 6.93555L9 11.0399V19.0827L1.5 14.9812V6.93555ZM18 14.9774L10.5 19.0827V11.0437L13.5 9.40211V12.748C13.5 13.1623 13.8358 13.498 14.25 13.498C14.6642 13.498 15 13.1623 15 12.748V8.58086L18 6.93555V14.9765V14.9774Z" fill="#262626"/>
</svg>

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
          <form className="contact-formop" onSubmit={handleSubmit}>
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
