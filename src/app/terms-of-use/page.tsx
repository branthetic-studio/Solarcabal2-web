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
  { id: 1, title: "Eligibility", content: ["Be at least 18 years old.", "Provide accurate and complete information.", "Have legal capacity to enter binding agreements.", "Not use the Services for illegal or fraudulent purposes.", "We reserve the right to approve or reject any user."] },
  { id: 2, title: "Account Registration", content: ["Provide accurate information.", "Keep your password secure.", "Be responsible for all activities on your account.", "You are liable for all actions taken using your account."] },
  { id: 3, title: "Identity Verification (KYC)", content: ["Government ID.", "BVN or NIN.", "Address verification.", "Selfie verification.", "We may approve, reject, or suspend accounts at our discretion."] },
  { id: 4, title: "E-Commerce Purchases", content: ["Individual solar products (Direct Product Purchase).", "Full solar system packages with installation (Service Package).", "You agree to pay all applicable fees. We may cancel or refuse any order."] },
  { id: 5, title: "Payment Terms", content: ["Payments may be made via: Card, Bank transfer, Wallet, or Buy Now Pay Later (BNPL).", "Failure to pay may result in account suspension, legal recovery action, or product repossession where applicable."] },
  { id: 6, title: "Wallet Terms", content: ["Your SolarCabal Wallet may be used to receive referral rewards, refunds, make purchases, and withdraw eligible funds.", "Wallet balances are not bank deposits and are not insured as such.", "Funds may be reversed if credited in error. Wallet may be frozen for suspected fraud or abuse.", "Minimum withdrawal: ₦5,000. Processing time: 2–5 working days."] },
  { id: 7, title: "Referral Program Terms", content: ["Rewards are earned when referred users complete qualifying actions: registration, KYC, product purchase, successful payment, or BNPL activation.", "Rewards are credited to your Wallet and withdrawable only after reaching ₦10,000.", "SolarCabal will deduct applicable Withholding Tax (WHT) at the time of payment and issue a WHT receipt.", "Prohibited: self-referral, multiple accounts, fake purchases, referral farming, and BNPL abuse.", "Violations may result in reversed rewards, suspension, withdrawal cancellation, or permanent ban.", "Rewards may be reversed for order cancellations, refunds, BNPL default, or detected fraud."] },
  { id: 8, title: "Buy Now Pay Later (BNPL) Terms", content: ["BNPL allows installment payments. You agree to repay all installments fully and on time.", "You accept legal liability for repayment.", "Failure to repay may result in: account suspension, legal action, debt recovery, credit reporting, or product repossession."] },
  { id: 9, title: "Product Ownership Under BNPL", content: ["All BNPL-financed products remain the property of the financing organization until full payment.", "SolarCabal acts solely as a facilitator for sales and payments.", "In the event of non-payment, the financing organization may repossess products in coordination with SolarCabal.", "Customers are responsible for all products while in their possession."] },
  { id: 10, title: "Delivery Terms", content: ["Delivery will be made to the address specified by the customer.", "SolarCabal is not responsible for errors in the delivery address, or delays and damages from courier services or events outside our control."] },
  { id: 11, title: "Installation, Handover & Customer Confirmation", content: ["Installation is performed by authorized technicians.", "Upon completion, the customer must confirm via: in-app confirmation, digital signature, OTP, or signed handover form.", "Confirmation authorizes release of installer payment and activation of warranty.", "Failure to confirm without valid reason will not invalidate completion where system functionality is verified."] },
  { id: 12, title: "Product Warranty — Direct Purchase", content: ["Warranty covers manufacturing defects with proof of purchase and no unauthorized repairs.", "Warranty does not cover misuse, electrical damage, unauthorized repair, accidents, or natural disasters.", "Remedy may include repair or replacement at Company discretion."] },
  { id: 13, title: "Package-Level Warranty — Installed Systems", content: ["Warranty begins after installation completion, successful testing, and customer acceptance.", "Covers: solar panels, batteries, and inverters.", "Support includes remote troubleshooting, on-site inspection, and repair or replacement of covered components.", "Only SolarCabal-approved technicians may service the system; unauthorized repairs void the warranty.", "After installation, customers bear transportation costs for component repairs.", "Warranty is void for unauthorized repairs, tampering, or relocation without written approval.", "Post-warranty support will be charged at SolarCabal's prevailing rates."] },
  { id: 14, title: "After-Sales Support Response Time", content: "We aim to respond to inquiries within 2–5 working days. Emergency or urgent responses are not guaranteed." },
  { id: 15, title: "Prohibited Activities", content: ["Commit fraud or deceptive activity.", "Exploit or abuse the referral program.", "Submit false or misleading information.", "Willfully default on BNPL repayments.", "Tamper with, hack, or disrupt the Services or platform infrastructure."] },
  { id: 16, title: "Account Suspension and Termination", content: "SolarCabal may suspend or restrict your account for suspected fraud, BNPL default, violation of these Terms, or outstanding unpaid debts." },
  { id: 17, title: "Fraud and Security Rights", content: ["SolarCabal may freeze accounts, reverse rewards, delay withdrawals, and investigate users and transactions.", "These actions may be taken to ensure compliance, prevent fraud, or protect the platform."] },
  { id: 18, title: "Intellectual Property", content: "All content, materials, and assets on the platform are the exclusive property of SolarCabal. You may not copy, reproduce, or distribute any content without prior written permission." },
  { id: 19, title: "Disclaimer", content: "The Services are provided on an as-is and as-available basis. SolarCabal makes no warranties regarding availability, reliability, or uninterrupted operation." },
  { id: 20, title: "Limitation of Liability", content: "SolarCabal shall not be liable for any loss of revenue, profit, or indirect damages. Maximum liability shall not exceed the total amount paid in connection with the relevant transaction." },
  { id: 21, title: "Indemnification", content: "You agree to indemnify and hold SolarCabal harmless from any claims, losses, or expenses arising from fraud, platform misuse, BNPL default, or referral system abuse." },
  { id: 22, title: "Privacy", content: "Your use of Services is governed by our Privacy Policy." },
  { id: 23, title: "Governing Law", content: "These Terms shall be governed by the applicable laws of the jurisdiction in which SolarCabal Technology Limited is incorporated." },
  { id: 24, title: "Dispute Resolution", content: "Disputes shall first be resolved through good faith negotiations. If unresolved, the matter shall be submitted to the competent courts for resolution." },
  { id: 25, title: "Changes to Terms", content: "SolarCabal reserves the right to amend these Terms at any time. Continued use after changes are published constitutes acceptance of the updated Terms." },
  { id: 26, title: "User Acceptance", content: "By creating an account or using the Services, you confirm that you have read, understood, and agreed to be bound by these Terms." },
];

const contacts: ContactRow[] = [
  { label: "Email", value: "support@solarcabal.com", href: "mailto:support@solarcabal.com" },
  { label: "Phone", value: "07074907903 · 07074728575" },
  { label: "Address", value: "1A Isolo Road, Mushin, Lagos" },
];

function Item({ s }: { s: Section }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div style={{ borderBottom: "1px solid #eee" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "18px 0", textAlign: "left" }}
      >
        <span style={{ fontSize: 12, color: "#bbb", minWidth: 24, fontFamily: "monospace" }}>
          {String(s.id).padStart(2, "0")}
        </span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{s.title}</span>
        <span style={{ color: "#ff0000", fontSize: 18, display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: ".2s" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "0 0 16px 36px", fontSize: 14, color: "#555", lineHeight: 1.75 }}>
          {Array.isArray(s.content)
            ? <ul style={{ paddingLeft: 16 }}>{s.content.map((item, i) => <li key={i}>{item}</li>)}</ul>
            : <p>{s.content}</p>}
        </div>
      )}
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div>
      <Navbar />
      <header style={{ textAlign: "center", paddingBottom: 28, borderBottom: "2px solid #ff0000", marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Terms of Service</h1>
        <p style={{ color: "#777", fontSize: 14 }}>SolarCabal Technology Limited</p>
        <span style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 20, background: "", border: "1px solid #ff0000", fontSize: 13, color: "#ff0000" }}>
          Effective: 1 March 2026
        </span>
        <p style={{ marginTop: 20, fontSize: 14, color: "#555", maxWidth: 580, margin: "20px auto 0", lineHeight: 1.7 }}>
          These Terms govern your access to and use of the SolarCabal app, website, wallet, referral program, BNPL services, and solar installation services. By using our Services, you agree to be legally bound by these Terms.
        </p>
      </header>

      <main className="py-16 px-16">{sections.map((s) => <Item key={s.id} s={s} />)}</main>

      <div className="py-16 px-16" style={{ marginTop: 48, background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: 10, padding: 48 }}>
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Contact Us</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {contacts.map(({ label, value, href }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 14 }}>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#aaa", marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 14, color: "#333" }}>
                {href ? <a href={href} style={{ color: "#ff0000", textDecoration: "none" }}>{value}</a> : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Suscribe />
      <Footer />
    </div>
  );
}
