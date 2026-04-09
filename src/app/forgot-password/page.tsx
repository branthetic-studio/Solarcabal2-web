"use client";

import React, { useState } from "react";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import Link from "next/link";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLoading(true);
    try {
      await fetch("https://api.clerk.com/v1/client/sign_ins", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          strategy: "reset_password_email_code",
          identifier: email.trim(),
        }),
        credentials: "include",
      });
      // Always show success to avoid email enumeration
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">

          {!submitted ? (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-neutral-900">
                  Forgot your password?
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                  Enter the email address linked to your account and we'll send
                  you a code to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="name@example.com"
                    className={`w-full rounded-full border px-4 py-3 text-sm focus:outline-none transition-colors ${
                      emailError
                        ? "border-red-400 focus:border-red-500"
                        : "border-neutral-300 focus:border-red-400"
                    }`}
                  />
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-500 pl-1">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending…
                    </span>
                  ) : (
                    "Send reset code"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-500">
                Remember your password?{" "}
                <Link href="/" className="text-red-600 font-medium hover:underline">
                  Back to home
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center py-4 flex flex-col items-center gap-4">
              <div className="text-5xl">📧</div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Check your inbox
              </h2>
              <p className="text-sm text-neutral-500 max-w-xs">
                If an account exists for{" "}
                <span className="font-medium text-neutral-700">{email}</span>,
                we've sent a 6-digit reset code. Check your spam folder if you
                don't see it.
              </p>
              <p className="text-xs text-neutral-400">The code expires in 1 hour.</p>
              <Link
                href="/reset-password"
                className="mt-2 rounded-full bg-red-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Enter reset code
              </Link>
              <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-600">
                Back to home
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}