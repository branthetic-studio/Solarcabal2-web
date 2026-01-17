"use client";

import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Suscribe/Suscribe";
import "./Referral.css";
import arrow from "../../Assets/arrow-right.png";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

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

  return (
    <main>
      <Navbar />


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
      {!token && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
          Login to view your referral details.
        </p>
      )}

      {/* TABLE ONLY IF LOGGED IN */}
      {token && (
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
      )}
      <Refer />
      <Footer />
    </main>
  );
};

export default ReferralPage;
