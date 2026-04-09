"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

/* ── Validation helpers ───────────────────────────────────────────────────── */
const isValidPassword = (p: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p);

const getPasswordStrength = (password: string) => {
  if (!password) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
  if (score <= 3) return { label: "Fair", color: "bg-yellow-400", width: "66%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
};

/* ── Form component ───────────────────────────────────────────────────────── */
function ResetPasswordForm() {
  const router = useRouter();
  const clerk = useClerk();

  const [code, setCode] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    code?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const errs: typeof errors = {};
    if (!code.trim()) {
      errs.code = "Please enter the 6-digit code from your email.";
    }
    if (!form.password) {
      errs.password = "Password is required.";
    } else if (!isValidPassword(form.password)) {
      errs.password =
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
    }
    if (!form.confirm) {
      errs.confirm = "Please confirm your password.";
    } else if (form.password !== form.confirm) {
      errs.confirm = "Passwords do not match.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Use the low-level Clerk client API which works across all versions
      const signIn = await (clerk as any).client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: form.password,
      });

      if (signIn.status === "complete") {
        await (clerk as any).setActive({ session: signIn.createdSessionId });
        setIsSuccess(true);
      } else {
        setServerError("Reset incomplete. Please try again.");
      }
    } catch (err: any) {
      setServerError(
        err?.errors?.[0]?.longMessage ??
        err?.message ??
        "Invalid or expired code. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (isSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-lg font-semibold text-neutral-900">Password updated!</h2>
          <p className="text-sm text-neutral-500">
            Your password has been reset successfully. You can now continue shopping.
          </p>
          <button
            className="mt-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            onClick={() => router.push("/")}
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">Reset your password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter the 6-digit code from your email and choose a new password.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>

          {/* Reset code */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reset code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (errors.code) setErrors((p) => ({ ...p, code: "" }));
                if (serverError) setServerError(null);
              }}
              className={`w-full rounded-full border px-4 py-3 text-center text-xl font-bold tracking-[0.4em] focus:outline-none transition-colors ${
                errors.code
                  ? "border-red-400 focus:border-red-500"
                  : "border-neutral-300 focus:border-red-400"
              }`}
            />
            {errors.code && (
              <p className="mt-1.5 text-xs text-red-500 pl-1">{errors.code}</p>
            )}
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                }}
                placeholder="Min 8 chars, upper, lower, number, symbol"
                className={`w-full rounded-full border px-4 py-3 pr-11 text-sm focus:outline-none transition-colors ${
                  errors.password
                    ? "border-red-400 focus:border-red-500"
                    : "border-neutral-300 focus:border-red-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {form.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p className={`text-xs font-medium pl-1 ${
                  strength.label === "Weak"
                    ? "text-red-500"
                    : strength.label === "Fair"
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}>
                  {strength.label} password
                </p>
              </div>
            )}
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 pl-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => {
                  setForm({ ...form, confirm: e.target.value });
                  if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
                }}
                placeholder="Re-enter your new password"
                className={`w-full rounded-full border px-4 py-3 pr-11 text-sm focus:outline-none transition-colors ${
                  errors.confirm
                    ? "border-red-400 focus:border-red-500"
                    : "border-neutral-300 focus:border-red-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-3 text-neutral-400 hover:text-neutral-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1.5 text-xs text-red-500 pl-1">{errors.confirm}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-600 text-center">⚠ {serverError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating…
              </span>
            ) : (
              "Update password"
            )}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Didn&apos;t get a code?{" "}
            <Link href="/forgot-password" className="text-red-600 font-medium hover:underline">
              Request a new one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────────────────── */
function ResetPasswordLoading() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-4">
        <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="h-12 bg-neutral-200 rounded-full animate-pulse" />
        <div className="h-12 bg-neutral-200 rounded-full animate-pulse" />
        <div className="h-12 bg-neutral-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />
      <Suspense fallback={<ResetPasswordLoading />}>
        <ResetPasswordForm />
      </Suspense>
      <Footer />
    </main>
  );
}