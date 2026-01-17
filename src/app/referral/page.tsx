"use client";

import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Suscribe/Suscribe";
import "./Referral.css";
import arrow from "../../Assets/arrow-right.png";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Copy, Check } from "lucide-react";

// GraphQL Query
const MY_REFERRAL_EARNING = gql`
  query MyReferralEarnings {
    myReferralEarningsDetails {
      id
      amount
      level
      orderCode
      status
      createdAt
    }
  }
`;

type ReferralEarning = {
  id: string;
  amount: number;
  level: number;
  orderCode: string;
  status: string;
  createdAt: string;
};

type ReferralQueryResponse = {
  myReferralEarningsDetails: ReferralEarning[];
};

const ReferralPage = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch only when token exists
  const { data, loading, error } = useQuery<ReferralQueryResponse>(
    MY_REFERRAL_EARNING,
    {
      skip: !token,
    }
  );

  const referrals = token && data ? data.myReferralEarningsDetails : [];

  // Calculate values based on login state
  const totalInvites = referrals?.length || 0;
  const activeInvites = referrals?.filter((r) => r.status === "active").length || 0;

  const premiumData = [
    {
      title: "Premium 1 Earning",
      price: token ? `₦${totalInvites * 1005}` : "₦0",
      text: "Total invites",
      num: totalInvites.toString(),
    },
    {
      title: "Premium 2 Earning",
      price: token ? `₦${activeInvites * 630}` : "₦0",
      text: "Active invites",
      num: activeInvites.toString(),
    },
  ];

  const [copied, setCopied] = useState(false);
  const referralCode = "Solarcabal/jhondea";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <Navbar />
      <div className="relative bg-[#181818] py-10 md:py-16 pt-20 md:pt-30 px-4 overflow-hidden -mx-4">
        {/* Background gradient decorations */}
        <div
          className="absolute bottom-0 left-0  opacity-100 z-10">
          <Image src="/footershadow2.png" alt="Background decoration" width={300} height={300}></Image></div>
        <div
          className="absolute top-0 right-0 opacity-100 z-100">
          <Image src="/footershadow1.png" alt="Background decoration" width={300} height={300}></Image>
        </div>

        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
          {/* Gift Icon */}
          <Image
            src="/bonus.gif"
            alt="Rewards"
            className="w-28 h-28 md:w-36 md:h-36 object-contain"
            width={60}
            height={60}
          />

          {/* Heading */}
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Refer a Friend & Earn Rewards
          </h4>

          {/* Description */}
          <p className="text-xl md:text-xl text-[#ffffff] leading-relaxed max-w-4xl">
            Help your friends go green and save on energy! Share your referral
            code, and you'll both earn rewards.
          </p>

          {/* Referral Code Box */}
          <div className="w-full max-w-md bg-[#2c2929] rounded-xl flex items-center justify-between px-5 py-4 mt-2">
            <span className="text-white text-base md:text-lg font-medium">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Copy referral code"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>


      {/* PREMIUM DATA */}
      <section className="premium-data">
        {premiumData.map((data, index) => (
          <div key={index} className={index === 1 ? "data" : "data1"}>
            <div>
              <span className="title">{data.title}</span>
              <p className="data-price">{data.price}</p>
            </div>
            <hr />
            <div>
              <span className="text">{data.text}</span>
              <p className="num">{data.num}</p>
            </div>
          </div>
        ))}
      </section>

      {/* REFERRALS HEADER */}
      <section className="referrals">
        <p>Referrals</p>
        <div className="button">
          <span>see all</span>
          <a href="#">
            <Image src={arrow} alt="See all referrals" />
          </a>
        </div>
      </section>

      {/* SHOW MESSAGE IF USER NOT LOGGED IN */}
      {
        !token && (
          <p style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
            Login to view your referral details.
          </p>
        )
      }

      {/* TABLE ONLY IF LOGGED IN */}
      {
        token && (
          <>
            {loading && <p className="loading">Loading referrals...</p>}

            {error && (
              <p style={{ color: "red", textAlign: "center" }}>
                Failed to load referral data.
              </p>
            )}

            {!loading && !error && (
              <table>
                <thead>
                  <tr>
                    <th>Referral ID</th>
                    <th>Amount</th>
                    <th>Level</th>
                    <th>Order Code</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id}>
                      <td className="table-id">
                        <span>{ref.id}</span>
                      </td>
                      <td className="table-price">₦{ref.amount}</td>
                      <td>{ref.level}</td>
                      <td>{ref.orderCode}</td>
                      <td className={ref.status}>
                        <div>{ref.status}</div>
                      </td>
                      <td>{new Date(ref.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )
      }
      <Refer />
      <Footer />
    </main >
  );
};

export default ReferralPage;
