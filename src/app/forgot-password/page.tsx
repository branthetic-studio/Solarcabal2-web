"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { REQUEST_PASSWORD_RESET } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";

/* ---------- Manual types (no codegen) ---------- */
type RequestPasswordResetPayload =
  | { __typename: "Success"; success: boolean; message?: string | null }
  | {
      __typename: "ErrorResult";
      errorCode?: string | null;
      message?: string | null;
    };

type RequestPasswordResetResult = {
  requestPasswordReset: RequestPasswordResetPayload;
};

type RequestPasswordResetVars = {
  emailAddress: string;
};
/* ----------------------------------------------- */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [requestReset, { data, loading, error }] = useMutation<
    RequestPasswordResetResult,
    RequestPasswordResetVars
  >(REQUEST_PASSWORD_RESET);

  const payload = data?.requestPasswordReset;
  const isSuccess = payload?.__typename === "Success";
  const successMsg =
    isSuccess && payload?.message
      ? payload.message
      : isSuccess
      ? "If the email exists, a reset link has been sent."
      : null;

  const errMsg =
    error?.message ||
    (payload?.__typename === "ErrorResult"
      ? payload.message || "Request failed."
      : null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestReset({ variables: { emailAddress: email } });
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Faded Navbar */}
      <div className="opacity-40">
        <Navbar />
      </div>

      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Enter the email associated with your account. We'll send you a reset
            link.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-neutral-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>

          {errMsg && <p className="mt-3 text-sm text-red-600">❌ {errMsg}</p>}
          {isSuccess && (
            <p className="mt-3 text-sm text-green-700">✅ {successMsg}</p>
          )}

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-neutral-600 hover:underline"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </div>

      {/* Faded Footer */}
      <div className="opacity-40">
        <Footer />
      </div>
    </main>
  );
}