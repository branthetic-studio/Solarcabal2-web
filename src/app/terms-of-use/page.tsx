"use client";

import React, { useState } from "react";
import Navbar from "@/Components/Navbar/Navbar";
import Suscribe from "@/Components/Suscribe/Suscribe";
import Footer from "@/Components/Footer/Footer";

interface Section {
  id: number;
  title: string;
  content: string | string[];
}

interface ContactRow {
  label: string;
  value: string;
  href?: string;
}

const sections: Section[] = [
  {
    id: 1,
    title: "Eligibility",
    content: [
      "Be at least 18 years old.",
      "Provide accurate and complete information.",
      "Have legal capacity to enter binding agreements.",
      "Not use the Services for illegal or fraudulent purposes.",
      "We reserve the right to approve or reject any user.",
    ],
  },
  {
    id: 2,
    title: "Account Registration",
    content: [
      "Provide accurate information.",
      "Keep your password secure.",
      "Be responsible for all activities on your account.",
      "You are liable for all actions taken using your account.",
    ],
  },
  {
    id: 3,
    title: "Identity Verification (KYC)",
    content: [
      "Government ID.",
      "BVN or NIN.",
      "Address verification.",
      "Selfie verification.",
      "We may approve, reject, or suspend accounts at our discretion.",
    ],
  },
  {
    id: 4,
    title: "E-Commerce Purchases",
    content: [
      "Individual solar products (Direct Product Purchase).",
      "Full solar system packages with installation (Service Package).",
      "You agree to pay all applicable fees.",
      "We may cancel or refuse any order.",
    ],
  },
  {
    id: 5,
    title: "Payment Terms",
    content: [
      "Card, Bank transfer, Wallet, or Buy Now Pay Later (BNPL).",
      "Failure to pay may result in account suspension, legal recovery action, or product repossession.",
    ],
  },
  {
    id: 6,
    title: "Wallet Terms",
    content: [
      "Receive referral rewards, refunds, make purchases, and withdraw eligible funds.",
      "Wallet balances are not bank deposits and are not insured.",
      "Funds may be reversed if credited in error.",
      "Wallet may be frozen for suspected fraud or abuse.",
      "Minimum withdrawal: ₦5,000.",
      "Processing time: 2–5 working days.",
    ],
  },
  {
    id: 7,
    title: "Referral Program",
    content: [
      "Rewards are earned when referred users complete qualifying actions (registration, KYC, purchase, BNPL).",
      "Rewards are credited to your wallet and withdrawable after ₦10,000.",
      "A 5% Withholding Tax (WHT) applies and will be remitted by SolarCabal.",
      "Prohibited: self-referral, fake accounts, referral abuse, BNPL abuse.",
      "Violations may result in reversed rewards, suspension, or permanent ban.",
      "Rewards may be reversed for cancellations, refunds, BNPL default, or fraud.",
    ],
  },
  {
    id: 8,
    title: "Buy Now Pay Later (BNPL)",
    content: [
      "You must repay all installments fully and on time.",
      "You accept legal liability for repayment.",
      "Default may lead to suspension, legal action, debt recovery, credit reporting, or repossession.",
    ],
  },
  {
    id: 9,
    title: "Product Ownership Under BNPL",
    content: [
      "Products remain the property of the financing partner until fully paid.",
      "SolarCabal acts only as a facilitator.",
      "Products may be repossessed in case of default.",
      "Customers are responsible for products while in possession.",
    ],
  },
  {
    id: 10,
    title: "Delivery Terms",
    content: [
      "Delivery is made to the provided address.",
      "We are not responsible for wrong addresses or courier delays/damages.",
    ],
  },
  {
    id: 11,
    title: "Installation & Confirmation",
    content: [
      "Installation is done by authorized technicians.",
      "Customer must confirm via app, signature, OTP, or handover form.",
      "Confirmation activates warranty and installer payment.",
      "Failure to confirm does not invalidate verified installation.",
    ],
  },
  {
    id: 12,
    title: "Product Warranty (Direct Purchase)",
    content: [
      "Covers manufacturing defects.",
      "Requires proof of purchase.",
      "Does not cover misuse, electrical damage, or unauthorized repairs.",
      "May include repair or replacement.",
    ],
  },
  {
    id: 13,
    title: "Installed System Warranty",
    content: [
      "Starts after installation and customer acceptance.",
      "Covers solar panels, batteries, and inverters.",
      "Includes remote and on-site support.",
      "Only approved technicians allowed.",
      "Unauthorized repairs void warranty.",
      "Post-warranty services are chargeable.",
    ],
  },
  {
    id: 14,
    title: "After-Sales Support",
    content: "Response time is 2–5 working days. Emergency response is not guaranteed.",
  },
  {
    id: 15,
    title: "Prohibited Activities",
    content: [
      "Fraud or deceptive activity.",
      "Referral abuse.",
      "False information submission.",
      "BNPL default.",
      "System hacking or disruption.",
    ],
  },
  {
    id: 16,
    title: "Account Suspension",
    content: "Accounts may be suspended for fraud, BNPL default, violation of terms, or unpaid debts.",
  },
  {
    id: 17,
    title: "Fraud & Security Rights",
    content: [
      "Freeze accounts.",
      "Reverse rewards.",
      "Delay withdrawals.",
      "Investigate transactions.",
    ],
  },
  {
    id: 18,
    title: "Intellectual Property",
    content: "All platform content belongs to SolarCabal and cannot be used without permission.",
  },
  {
    id: 19,
    title: "Disclaimer",
    content: "Services are provided 'as-is' without guarantees of uptime or reliability.",
  },
  {
    id: 20,
    title: "Limitation of Liability",
    content: "Liability is limited to the amount paid for the service. No indirect damages covered.",
  },
  {
    id: 21,
    title: "Indemnification",
    content: "You agree to cover any losses arising from misuse, fraud, or BNPL default.",
  },
  {
    id: 22,
    title: "Privacy",
    content: "Use of services is governed by our Privacy Policy.",
  },
  {
    id: 23,
    title: "Governing Law",
    content: "These Terms are governed by applicable laws of Nigeria.",
  },
  {
    id: 24,
    title: "Dispute Resolution",
    content: "Disputes will first go through negotiation, then courts if unresolved.",
  },
  {
    id: 25,
    title: "Changes to Terms",
    content: "We may update these Terms anytime. Continued use means acceptance.",
  },
  {
    id: 26,
    title: "User Acceptance",
    content: "By using our services, you agree to these Terms.",
  },
];

const contacts: ContactRow[] = [
  { label: "Email", value: "support@solarcabal.com", href: "mailto:support@solarcabal.com" },
  { label: "Phone", value: "07074907903 · 07074728575" },
  { label: "Address", value: "1A Isolo Road, Mushin, Lagos" },
];

function Item({ s }: { s: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid #eee" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 0",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 12, color: "#bbb", minWidth: 24 }}>
          {String(s.id).padStart(2, "0")}
        </span>
        <span style={{ flex: 1, fontWeight: 600 }}>{s.title}</span>
        <span style={{ color: "#ff0000", transform: open ? "rotate(90deg)" : "none" }}>›</span>
      </button>

      {open && (
        <div style={{ padding: "0 0 16px 36px" }}>
          {Array.isArray(s.content) ? (
            <ul>
              {s.content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{s.content}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div>
      <Navbar />

      <header style={{ textAlign: "center", padding: 28, display: "flex", flexDirection: "column", gap: 16, borderBottom: "2px solid #ff0000" }}>
        <h1 className="text-4xl">Terms of Service</h1>
        <p>SolarCabal Technology Limited</p>
        <p style={{  padding: "4px 12px", color: "#ff0000" }}>
          Effective: 10 April 2026
        </p>
      </header>

      <main className="py-16 px-16">
        {sections.map((s) => (
          <Item key={s.id} s={s} />
        ))}
      </main>

      <div className="py-16 px-16">
        <h2>Contact Us</h2>
        {contacts.map(({ label, value }) => (
          <p key={label}>
            <strong>{label}:</strong> {value}
          </p>
        ))}
      </div>

      <Suscribe />
      <Footer />
    </div>
  );
}