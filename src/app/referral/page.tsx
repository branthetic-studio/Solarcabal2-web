"use client";

import { useMemo, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import Refer from "../../Components/Suscribe/Suscribe";
import "./Referral.css";
import Image from "next/image";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Copy, Check } from "lucide-react";
import { useUser } from "@/context/UserContext";
import AuthModal from "@/Components/AuthModal";
import { MY_REFERRAL_EARNING } from "@/graphql/queries";

const GET_MY_REFERRAL_CODE = gql`
  query GetMyReferralCode {
    activeCustomer {
      id
      customFields {
        referralCode
      }
    }
  }
`;

type ReferralEarning = {
  id: string;
  amount: number;
  level: number;
  status: string;
  createdAt: string;
  order?: { code?: string | null } | null;
};

type ReferralQueryResponse = {
  myReferralEarnings: ReferralEarning[];
};

const ReferralPage = () => {
  const { customer, loading: authLoading } = useUser();

  const { data, loading, error } = useQuery<ReferralQueryResponse>(
    MY_REFERRAL_EARNING,
    {
      fetchPolicy: "network-only",
      skip: authLoading || !customer,
    }
  );

  const { data: referralCodeData, loading: codeLoading } = useQuery(
    GET_MY_REFERRAL_CODE,
    {
      skip: authLoading || !customer,
      fetchPolicy: "cache-and-network",
    }
  );

  const referralCode = (referralCodeData as any)?.activeCustomer?.customFields
    ?.referralCode as string | undefined;

  const referrals = data?.myReferralEarnings ?? [];

  const totalInvites = useMemo(() => referrals.length, [referrals]);

  const activeInvites = useMemo(
    () => referrals.filter((r) => r.status.toLowerCase() === "active").length,
    [referrals]
  );

  const level1Earnings = useMemo(
    () =>
      referrals
        .filter((r) => r.level === 1)
        .reduce((sum, r) => sum + r.amount, 0),
    [referrals]
  );

  const level2Earnings = useMemo(
    () =>
      referrals
        .filter((r) => r.level === 2)
        .reduce((sum, r) => sum + r.amount, 0),
    [referrals]
  );

  const premiumData = useMemo(
    () => [
      {
        title: "Premium 1 Earning",
        price: `₦${level1Earnings.toLocaleString()}`,
        text: "Total invites",
        num: totalInvites.toString(),
      },
      {
        title: "Premium 2 Earning",
        price: `₦${level2Earnings.toLocaleString()}`,
        text: "Active invites",
        num: activeInvites.toString(),
      },
    ],
    [level1Earnings, level2Earnings, totalInvites, activeInvites]
  );

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main>
      <Navbar />

      <div className="relative bg-[#181818] py-10 md:py-16 pt-20 md:pt-30 px-4 overflow-hidden">
        {/* ✅ FIX: added pointer-events-none to both decoration divs */}
        <div className="absolute bottom-0 left-0 opacity-100 z-10 pointer-events-none">
          <Image src="/footershadow2.png" alt="Background decoration" width={300} height={300} />
        </div>
        <div className="absolute top-0 right-0 opacity-100 z-100 pointer-events-none">
          <Image src="/footershadow1.png" alt="Background decoration" width={300} height={300} />
        </div>

        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
          <Image
            src="/bonus.gif"
            alt="Rewards"
            className="w-28 h-28 md:w-36 md:h-36 object-contain"
            width={60}
            height={60}
          />
          <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Refer a Friend & Earn Rewards
          </h4>
          <p className="text-xl md:text-xl text-[#ffffff] leading-relaxed max-w-4xl">
            Share your referral code and earn rewards when your friends order.
          </p>

          {authLoading ? null : customer ? (
            <div className="w-full max-w-md bg-[#2c2929] rounded-xl flex items-center justify-between px-5 py-4 mt-2 min-h-16">
              {codeLoading ? (
                <span className="text-white/70 text-sm animate-pulse">Loading your referral code...</span>
              ) : referralCode ? (
                <>
                  <span className="text-white text-base md:text-lg font-medium break-all">{referralCode}</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors ml-4 shrink-0"
                  >
                    {copied ? (
                      <><Check className="w-5 h-5" /><span className="text-sm font-medium">Copied!</span></>
                    ) : (
                      <><Copy className="w-5 h-5" /><span className="text-sm font-medium">Copy</span></>
                    )}
                  </button>
                </>
              ) : (
                <span className="text-white/70 text-sm">No referral code available.</span>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md bg-[#2c2929] rounded-xl px-5 py-4 mt-2 text-white/90">
              <p className="text-sm">Log in to view and copy your referral code, and to see your earnings.</p>
              <div className="mt-4 flex justify-center">
                <AuthModal
                  trigger={
                    <button className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Log in / Sign up
                    </button>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {customer && (
        <>
          <h3 className="text-center mt-8 py-3">Earnings Overview</h3>

          <section className="premium-data relative bg-[#181818]">
            {premiumData.map((item, index) => (
              <div key={index} className={index === 1 ? "data" : "data1"}>
                <div>
                  <span className="title">{item.title}</span>
                  <p className="data-price">{item.price}</p>
                </div>
                <hr />
                <div className="flex flex-col justify-center align-middle">
                  <span className="text">{item.text}</span>
                  <p className="num">{item.num}</p>
                </div>
              </div>
            ))}
          </section>

          {loading && (
            <p style={{ textAlign: "center", marginTop: "20px" }} className="my-12 text-xl pt-6 font-semibold">
              Loading referral data...
            </p>
          )}
          {error && (
            <p style={{ color: "red", textAlign: "center" }} className="my-12 text-xl pt-6 font-semibold">
              Failed to load referral data.
            </p>
          )}
          {!loading && !error && referrals.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "20px" }} className="my-12 text-xl pt-6 font-semibold">
              No referral earnings yet.
            </p>
          )}
          {!loading && !error && referrals.length > 0 && (
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
                    <td className="table-id">{ref.id}</td>
                    <td className="table-price">₦{ref.amount.toLocaleString()}</td>
                    <td>{ref.level}</td>
                    <td>{ref.order?.code ?? "-"}</td>
                    <td className={ref.status.toLowerCase()}>{ref.status}</td>
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