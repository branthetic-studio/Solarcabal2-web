"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Menu, Mail, ArrowLeft as BackIcon } from "lucide-react";
import { useSignIn, useClerk, useAuth } from "@clerk/nextjs";
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

export default function LoginPage() {
  const router = useRouter();
  const apollo = useApolloClient();
  const { refetchUser } = useUser();

  const { signIn, isLoaded: signInLoaded } = useSignIn() as any;
  const clerk = useClerk() as any;
  const { getToken, isSignedIn } = useAuth() as any;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password
  const [forgotStep, setForgotStep] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

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

  const authenticateWithVendure = async () => {
    const token = await getTokenWithRetry();
    if (!token) throw new Error("No Clerk token available");

    const response = await authenticate({ variables: { token } });

    const result = response.data?.authenticate;
    if (!result) throw new Error("No response from server");
    if (result.__typename === "ErrorResult") {
      throw new Error(result.message || "Authentication failed");
    }

    await refetchUser();
    await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignedIn) {
        await authenticateWithVendure();
        toast.success("Welcome back!");
        router.push("/");
        return;
      }

      if (!signIn || !signInLoaded) throw new Error("Auth not ready. Please wait.");

      const result = await signIn.create({
        identifier: form.email.trim(),
        password: form.password,
      });

      if (result.status === "complete") {
        try {
          await clerk.setActive({ session: result.createdSessionId });
        } catch (e: any) {
          if (!e?.message?.includes("plain objects")) throw e;
        }
        await authenticateWithVendure();
        toast.success("Welcome back!");
        router.push("/");
        return;
      }

      throw new Error("Login could not be completed. Please try again.");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        "Login failed.";

      if (/invalid|credentials|no account|identifier/i.test(msg)) {
        setError("Incorrect email or password. Please try again.");
      } else if (/verif/i.test(msg)) {
        setError("Please verify your email before logging in.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      if (!signIn || !signInLoaded) throw new Error("Auth not ready.");
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: forgotEmail.trim(),
      });
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot Password Screen ─────────────────────────────────────────────
  if (forgotStep) {
    return (
      <div className="lg:hidden min-h-screen bg-white flex flex-col px-6 pt-12 pb-10">
        <button
          aria-label="Go back to login"
          onClick={() => {
            setForgotStep(false);
            setForgotSent(false);
            setForgotEmail("");
          }}
          className="mb-8"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>

        {forgotSent ? (
          <div className="flex flex-col items-center gap-4 text-center mt-10">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <Mail className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="font-bold text-xl text-gray-900">Check your inbox</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              If an account exists for{" "}
              <span className="font-semibold text-gray-800">{forgotEmail}</span>
              , we've sent a password reset link. Check your spam folder too.
            </p>
            <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
            <button
              aria-label="Go to change password page"
              onClick={() => {
                setForgotStep(false);
                setForgotSent(false);
                setForgotEmail("");
                router.push("/reset-password");
              }}
              className="flex items-center gap-1 text-sm text-red-600 font-semibold mt-4"
            >
              <BackIcon className="h-4 w-4" /> Change Password
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-4 text-sm focus:outline-none focus:border-red-400"
                required
              />
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-full bg-red-600 py-4 text-white font-semibold disabled:opacity-60"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ── Main Login Screen ──────────────────────────────────────────────────
  return (
    <div className="lg:hidden min-h-screen bg-white flex flex-col px-6 pt-12 pb-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <button
          aria-label="Go back"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button aria-label="Open menu" className="p-2">
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back!</h1>
        <p className="text-gray-500 text-sm">
          Enter your email address and password to login
        </p>
      </div>

      {/* Google SSO */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading || !signInLoaded}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 mb-4"
      >
        {googleLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        ) : (
          <FaGoogle className="text-[#4285F4] text-base" />
        )}
        {googleLoading ? "Redirecting..." : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-gray-400 text-xs">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-5 flex-1">
        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
            Email
          </label>
          <input
            type="email"
            placeholder="Your email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-4 text-sm focus:outline-none focus:border-red-400"
            required
          />
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
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-4 text-sm pr-12 focus:outline-none focus:border-red-400"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-red-600"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setForgotStep(true)}
            className="text-sm text-red-600 font-semibold"
          >
            Forgot Password?
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Spacer pushes button down */}
        <div className="flex-1" />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !signInLoaded}
          className="w-full rounded-full bg-red-600 py-4 text-white font-semibold text-base disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-red-600 font-semibold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}