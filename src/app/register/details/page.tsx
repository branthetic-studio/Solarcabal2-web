"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Menu, ChevronDown } from "lucide-react";
import { useSignUp, useSignIn, useClerk, useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { GET_ACTIVE_ORDER, CLERK_AUTHENTICATE } from "@/graphql/queries";
import { FaGoogle } from "react-icons/fa";

type AuthenticateResult = {
  authenticate:
    | { __typename: "CurrentUser"; id: string; identifier: string }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthenticateVars = {
  token: string;
  referralCode?: string;
};

const isValidFullName = (name: string) =>
  /^[a-zA-Z\s'\-]{2,}$/.test(name.trim()) &&
  name.trim().split(/\s+/).length >= 2;

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

// Common country codes
const COUNTRY_CODES = [
  { code: "+234", flag: "🇳🇬", name: "NG" },
  { code: "+1", flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "GB" },
  { code: "+233", flag: "🇬🇭", name: "GH" },
  { code: "+27", flag: "🇿🇦", name: "ZA" },
  { code: "+254", flag: "🇰🇪", name: "KE" },
];

export default function RegisterDetailsPage() {
  const router = useRouter();
  const apollo = useApolloClient();
  const { refetchUser } = useUser();

  const { signUp, isLoaded: signUpLoaded } = useSignUp() as any;
  const { signIn, isLoaded: signInLoaded } = useSignIn() as any;
  const clerk = useClerk() as any;
  const { getToken, isSignedIn } = useAuth() as any;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referCode: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP step
  const [verifyStep, setVerifyStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(
    CLERK_AUTHENTICATE
  );

  const getTokenWithRetry = async (
    maxAttempts = 8,
    delayMs = 400
  ): Promise<string> => {
    for (let i = 0; i < maxAttempts; i++) {
      const token = await getToken({ skipCache: true });
      if (token) return token;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error("Unable to retrieve session token. Please try again.");
  };

  const authenticateWithVendure = async (referralCode?: string) => {
    const token = await getTokenWithRetry();
    if (!token) throw new Error("No Clerk token available");

    const response = await authenticate({
      variables: {
        token,
        ...(referralCode && referralCode.trim().length >= 3
          ? { referralCode: referralCode.trim() }
          : {}),
      },
    });

    const result = response.data?.authenticate;
    if (!result) throw new Error("No response from server");
    if (result.__typename === "ErrorResult") {
      throw new Error(result.message || "Authentication failed");
    }

    await refetchUser();
    await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) {
      e.fullName = "Full name is required.";
    } else if (!isValidFullName(form.fullName)) {
      e.fullName = "Enter your first and last name using letters only.";
    }
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    } else if (!isValidPassword(form.password)) {
      e.password =
        "Min 8 chars, uppercase, lowercase, number & special character.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    try {
      if (!signUp || !signUpLoaded) throw new Error("Auth not ready.");

      const result = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName,
        lastName,
      });

      if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setVerifyStep(true);
        toast.info("Check your email for a 6-digit verification code.");
        return;
      }

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
        await authenticateWithVendure(form.referCode.trim() || undefined);
        toast.success("Account created! Welcome 🎉", { duration: 5000 });
        router.push("/");
        return;
      }

      throw new Error("Registration incomplete. Please try again.");
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        "Registration failed.";

      if (/already|exists|taken|in use/i.test(message)) {
        setErrors((p) => ({
          ...p,
          email: "This email is already registered. Please log in instead.",
        }));
      } else {
        setErrors((p) => ({ ...p, general: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);

    try {
      if (!signUp || !signUpLoaded) throw new Error("Auth not ready.");

      const result = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      });

      if (result.status !== "complete") {
        throw new Error("Verification incomplete. Please try again.");
      }

      await clerk.setActive({ session: result.createdSessionId });
      await authenticateWithVendure(form.referCode.trim() || undefined);
      toast.success("Account created! Welcome 🎉", { duration: 5000 });
      router.push("/");
    } catch (err: any) {
      setOtpError(
        err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          err?.message ??
          "Invalid code. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      if (isSignedIn) {
        await authenticateWithVendure();
        toast.success("You're already signed in!");
        router.push("/");
        return;
      }
      if (!signIn || !signInLoaded) throw new Error("Auth not ready.");
      const baseUrl = window.location.origin;
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${baseUrl}/sso-callback`,
        redirectUrlComplete: `${baseUrl}/`,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-red-500 text-xs mt-1 pl-1">{msg}</p> : null;

  // ── OTP Step ──────────────────────────────────────────────────────────────
  if (verifyStep) {
    return (
      <div className="lg:hidden min-h-screen bg-white flex flex-col px-6 pt-12 pb-10">
        <button onClick={() => setVerifyStep(false)} className="mb-8">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-gray-500 text-sm mb-1">
          We sent a 6-digit code to
        </p>
        <p className="font-semibold text-sm text-gray-900 mb-8">{form.email}</p>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            autoFocus
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (otpError) setOtpError(null);
            }}
            className={`w-full rounded-full border bg-gray-50 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-red-400 ${
              otpError ? "border-red-400" : "border-gray-200"
            }`}
          />
          {otpError && (
            <p className="text-red-500 text-xs text-center">{otpError}</p>
          )}
          <button
            type="submit"
            disabled={otpLoading || otpCode.length < 6}
            className="w-full rounded-full bg-red-600 py-4 text-white font-semibold text-base disabled:opacity-60 mt-2"
          >
            {otpLoading ? "Verifying..." : "Verify & Create Account"}
          </button>
        </form>
      </div>
    );
  }

  // ── Main Register Form ────────────────────────────────────────────────────
  return (
    <div className="lg:hidden min-h-screen bg-white flex flex-col">
      {/* Hero Header */}
      <div className="relative h-48 w-full">
        <Image
          src="/solar-hero.jpg"
          alt="Solar panels"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-white text-3xl font-bold">Sign Up</h1>
            <p className="text-white/80 text-sm mt-1">
              It only takes a minute to create your account
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-6 pb-10 overflow-y-auto">
        {/* Google SSO */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || !signInLoaded}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 mb-5"
        >
          {googleLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          ) : (
            <FaGoogle className="text-[#4285F4] text-base" />
          )}
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-gray-400 text-xs">or</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={form.fullName}
              onChange={(e) => {
                setForm({ ...form, fullName: e.target.value });
                if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
              }}
              className={`w-full rounded-full border bg-gray-50 px-4 py-3.5 text-sm focus:outline-none focus:border-red-400 ${
                errors.fullName ? "border-red-400" : "border-gray-200"
              }`}
            />
            <FieldError msg={errors.fullName} />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              placeholder="Your email address"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              className={`w-full rounded-full border bg-gray-50 px-4 py-3.5 text-sm focus:outline-none focus:border-red-400 ${
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
              Phone Number
            </label>
            <div
              className={`w-full flex items-center rounded-full border bg-gray-50 overflow-hidden ${
                errors.phone ? "border-red-400" : "border-gray-200"
              }`}
            >
              {/* Country selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-1 px-3 py-3.5 text-sm border-r border-gray-200 bg-transparent"
                >
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 min-w-[160px] overflow-hidden">
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="font-medium text-gray-700">
                          {c.code}
                        </span>
                        <span className="text-gray-400 text-xs">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Code + input */}
              <div className="flex items-center flex-1 px-3">
                <span className="text-gray-500 text-sm mr-1">
                  {selectedCountry.code}
                </span>
                <input
                  type="tel"
                  placeholder="2345 678 4321"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="flex-1 bg-transparent text-sm focus:outline-none py-3.5"
                />
              </div>
            </div>
            <FieldError msg={errors.phone} />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: "" }));
                }}
                className={`w-full rounded-full border bg-gray-50 px-4 py-3.5 text-sm pr-12 focus:outline-none focus:border-red-400 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  if (errors.confirmPassword)
                    setErrors((p) => ({ ...p, confirmPassword: "" }));
                }}
                className={`w-full rounded-full border bg-gray-50 px-4 py-3.5 text-sm pr-12 focus:outline-none focus:border-red-400 ${
                  errors.confirmPassword ? "border-red-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError msg={errors.confirmPassword} />
          </div>

          {errors.general && (
            <p className="text-red-500 text-xs text-center">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading || !signUpLoaded}
            className="w-full rounded-full bg-red-600 py-4 text-white font-semibold text-base disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-red-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}