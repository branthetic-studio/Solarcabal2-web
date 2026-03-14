"use client"

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
  { id: 1, title: "What Information We Collect", content: ["Account Information: Name, email, phone number, password.", "Ecommerce & Transaction Information: Billing/shipping addresses, order history.", "Financial Information: Bank account details, card information (processed securely via partners).", "Identity Verification (KYC): Government-issued IDs, proof of address.", "Referral & Rewards Data: Codes, referral activity, earned incentives.", "Demographics & Profile Data: Age, gender, location, preferences.", "Usage & Device Data: IP address, device type, app interactions, cookies."] },
  { id: 2, title: "How and Why We Use Your Information", content: ["Create and manage your account.", "Process purchases, payments, and product deliveries.", "Verify identity and prevent fraud.", "Administer referral and BNPL programs.", "Personalize offers, promotions, and content.", "Improve app functionality and user experience.", "Comply with legal obligations and enforce our rights."] },
  { id: 3, title: "Account Registration", content: "Account creation allows you to manage orders, track referrals, and receive personalized offers. We store this information securely." },
  { id: 4, title: "Ecommerce Purchases", content: "We collect necessary data to process your orders and communicate status updates. This includes billing and delivery addresses and purchase history." },
  { id: 5, title: "Identity Verification (KYC)", content: "We may require identity verification documents to comply with regulations, prevent fraud, and ensure the security of financial transactions." },
  { id: 6, title: "Payment Processing & Financial Information", content: "Payments are processed through secure, trusted partners. Full card or bank details are not stored on our servers; only necessary transaction details are retained securely." },
  { id: 7, title: "Product Delivery", content: "Shipping addresses and contact details are used to ensure timely, accurate delivery of purchased products." },
  { id: 8, title: "Referral / Earning Program", content: "Referral and rewards data is collected to track participation, calculate rewards, and distribute incentives according to program rules." },
  { id: 9, title: "Buy Now, Pay Later (BNPL)", content: "BNPL data, including financial history and transaction information, is used to assess eligibility, manage repayments, and comply with applicable financial regulations." },
  { id: 10, title: "Fraud Prevention", content: "We monitor accounts and transactions to prevent fraud, unauthorized access, and misuse of our services." },
  { id: 11, title: "Use of Demographic and Profile Data", content: "Demographic and profile data helps us personalize content, offers, and recommendations, and improve app functionality." },
  { id: 12, title: "Cookies and Similar Technologies", content: "We use cookies to enhance functionality, track app usage, and deliver personalized content. Users may manage cookie preferences in device/browser settings." },
  { id: 13, title: "Governing Principles of Data Processing", content: "We process personal data lawfully, fairly, and transparently. Data collection is limited to what is necessary, maintained accurately, and stored securely." },
  { id: 14, title: "Sharing of Personal Information", content: ["We do not sell personal data. Information may be shared with:", "Service providers (payment processors, delivery partners, analytics).", "Promotional partners (with your consent).", "Legal authorities or regulators, if required by law."] },
  { id: 15, title: "Personal Data Retention Period", content: "We retain data only as long as necessary to provide services, comply with laws, resolve disputes, and enforce agreements. Data is securely deleted or anonymized when no longer needed." },
  { id: 16, title: "Privacy Rights", content: ["Depending on your jurisdiction, you may have the right to:", "Access, correct, or delete your data.", "Object to or restrict processing.", "Receive data portability.", "Contact us at support@solarcabal.com to exercise your rights."] },
  { id: 17, title: "Children", content: "Our app is not intended for children under 18. We do not knowingly collect information from children; if discovered, it will be deleted." },
  { id: 18, title: "Legal Basis for Processing", content: ["Where applicable, we process personal data based on:", "Your consent.", "Performance of a contract.", "Legal obligations.", "Legitimate interests (e.g., fraud prevention, service improvement)."] },
  { id: 19, title: "Links to Other Sites", content: "Our app may link to third-party websites. We are not responsible for their privacy practices; review their policies before sharing personal information." },
  { id: 20, title: "Security Precautions", content: "We implement reasonable technical and organizational measures, such as encryption and access controls, to protect personal information. No system is completely secure." },
  { id: 21, title: "Choice / Opt-Out", content: "You can opt out of marketing communications and limit certain data collection. Some app features may be restricted if you choose to opt out." },
  { id: 22, title: "Advertisements on Our App", content: "Ads may be personalized based on your profile or activity. Third-party ad partners may also serve ads using cookies or similar technologies. Opt-out options may be available." },
  { id: 23, title: "Remedies", content: "If you believe your data rights have been violated, you may contact us at support@solarcabal.com or report to relevant data protection authorities." },
  { id: 24, title: "Questions and Contact", content: ["For questions about this Privacy Policy, contact us at any time:", "Email: support@solarcabal.com", "Phone: 07074907903 or 07074728575", "Address: 1A Isolo Road, Mushin, Lagos"] },
  { id: 25, title: "Notification of Changes", content: "We may update this Privacy Policy at any time. Significant changes will be communicated via the app or email. Continued use indicates acceptance of the updated policy." },
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

export default function PrivacyPolicy() {
  return (
    <div className="">
      <Navbar />
      <header style={{ textAlign: "center", paddingTop: 48, paddingBottom: 28, borderBottom: "2px solid #ff0000", marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>Privacy Policy</h1>
        <p style={{ color: "#777", fontSize: 14 }}>SolarCabal Technology Limited</p>
        <span style={{ display: "inline-block", marginTop: 10, padding: "4px 14px", borderRadius: 20, background: "", border: "1px solid #ff0000", fontSize: 13, color: "#ff0000" }}>
          Effective: 1 March 2026
        </span>
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

