"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { RESET_PASSWORD } from "@/graphql/queries";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { Suspense } from "react";

/* ---------- Manual types (no codegen) ---------- */
type ResetPasswordPayload =
  | { __typename: "Success"; success: boolean; message?: string | null }
  | {
      __typename: "ErrorResult";
      errorCode?: string | null;
      message?: string | null;
    };

type ResetPasswordResult = {
  resetPassword: ResetPasswordPayload;
};

type ResetPasswordVars = {
  token: string;
  password: string;
};
/* ----------------------------------------------- */

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Correctly infer token from searchParams
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirm: "" });

  const [reset, { data, loading, error }] = useMutation<
    ResetPasswordResult,
    ResetPasswordVars
  >(RESET_PASSWORD);

  const payload = data?.resetPassword;
  const isSuccess = payload?.__typename === "Success";
  const successMsg =
    isSuccess && payload?.message
      ? payload.message
      : isSuccess
      ? "Password updated successfully."
      : null;

  const errMsg =
    error?.message ||
    (payload?.__typename === "ErrorResult"
      ? payload.message || "Reset failed."
      : null);

  const passwordMismatch = form.password !== form.confirm;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || passwordMismatch) return;
    await reset({ variables: { token, password: form.password } });
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Reset Password
          </h1>

          {!token && (
            <p className="mt-2 text-sm text-neutral-600">
              Missing reset token. Please open the link from your email.
            </p>
          )}

          {token && (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-neutral-700">New password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-700">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:outline-none"
                  placeholder="Re-enter new password"
                />
                {form.confirm.length > 0 && passwordMismatch && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token || passwordMismatch}
                className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}

          {errMsg && <p className="mt-3 text-sm text-red-600">❌ {errMsg}</p>}
          {isSuccess && (
            <>
              <p className="mt-3 text-sm text-green-700">✅ {successMsg}</p>
              <div className="mt-5 flex gap-3">
                <button
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
                  onClick={() => router.push("/login")}
                >
                  Go to sign in
                </button>
                <button
                  className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-50"
                  onClick={() => router.push("/")}
                >
                  Home
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dev hint (optional) */}
        <p className="mt-4 text-xs text-neutral-500">
          Use the token you receive via email (e.g.{" "}
          <code>/reset-password?token=ABC</code>).
        </p>
      </div>

      <Footer />
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading reset form...</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
