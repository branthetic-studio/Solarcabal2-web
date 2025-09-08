"use client";

import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Refer/Refer";
import "./Referral.css";
import arrow from "../../Assets/arrow-right.png";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

// ✅ Your backend query
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

// ✅ Define the TypeScript type for the query response
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
  const { data, loading, error } =
    useQuery<ReferralQueryResponse>(MY_REFERRAL_EARNING);

  if (loading) return <p className="loading">Loading referrals...</p>;

  // If unauthorized, show empty state instead of crashing
  if (error) {
    if (error.message.includes("not currently authorized")) {
      return (
        <main>
          <Navbar />
          <Refer />

          <section className="premium-data">
            <div className="data1">
              <div>
                <span className="title">Premium 1 Earning</span>
                <p className="data-price">₦0</p>
              </div>
              <hr />
              <div>
                <span className="text">Total invites</span>
                <p className="num">0</p>
              </div>
            </div>
            <div className="data">
              <div>
                <span className="title">Premium 2 Earning</span>
                <p className="data-price">₦0</p>
              </div>
              <hr />
              <div>
                <span className="text">Active invites</span>
                <p className="num">0</p>
              </div>
            </div>
          </section>

          <section className="referrals">
            <p>Referrals</p>
            <div className="button">
              <span>see all</span>
              <a href="#">
                <Image src={arrow} alt="See all referrals" />
              </a>
            </div>
          </section>

          <p style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
            You need to log in to see your referral details.
          </p>

          <Footer />
        </main>
      );
    }

    // fallback for other errors
    return <p className="error">Failed to fetch referrals: {error.message}</p>;
  }

  // ✅ if authorized, render as before
  const referrals = data?.myReferralEarningsDetails || [];

  // Premium data calculation
  const premiumData = [
    {
      title: "Premium 1 Earning",
      price: `₦${referrals.length * 1005}`,
      text: "Total invites",
      num: referrals.length.toString(),
    },
    {
      title: "Premium 2 Earning",
      price: `₦${referrals.filter((r) => r.status === "active").length * 630}`,
      text: "Active invites",
      num: referrals.filter((r) => r.status === "active").length.toString(),
    },
  ];

  return (
    <main>
      <Navbar />
      <Refer />

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

      <section className="referrals">
        <p>Referrals</p>
        <div className="button">
          <span>see all</span>
          <a href="#">
            <Image src={arrow} alt="See all referrals" />
          </a>
        </div>
      </section>

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

      <Footer />
    </main>
  );
};

export default ReferralPage;
