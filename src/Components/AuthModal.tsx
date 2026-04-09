"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { X, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { useClerk, useAuth } from "@clerk/nextjs";

import {
  GET_ACTIVE_ORDER,
  CLERK_AUTHENTICATE,
  REGISTER_CUSTOMER,
  LOGIN,
  REQUEST_PASSWORD_RESET,
} from "@/graphql/queries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuthenticateResult = {
  authenticate:
    | { __typename: "CurrentUser"; id: string; identifier: string }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthenticateVars = {
  input: { token: string; referralCode?: string };
};

type LoginResult = {
  login:
    | { __typename: "CurrentUser"; id: string; identifier: string }
    | { __typename: "InvalidCredentialsError"; errorCode: string; message: string }
    | { __typename: "NotVerifiedError"; errorCode: string; message: string };
};

type RegisterResult = {
  registerCustomerAccount:
    | { __typename: "Success"; success: boolean }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthModalProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const isValidFullName = (name: string) =>
  /^[a-zA-Z\s'\-]{2,}$/.test(name.trim()) && name.trim().split(/\s+/).length >= 2;

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuthModal({ trigger, open: controlledOpen, onOpenChange }: AuthModalProps) {
  const apollo = useApolloClient();
  const { refetchUser } = useUser();
  const clerk = useClerk();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Login state ──
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // ── Register state ──
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    agree: false,
    referCode: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // ── Forgot password state ──
  const [forgotStep, setForgotStep] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Mutations — all imported from queries.ts ──
  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(CLERK_AUTHENTICATE);
  const [loginMutation] = useMutation<LoginResult>(LOGIN);
  const [registerMutation] = useMutation<RegisterResult>(REGISTER_CUSTOMER);
  const [requestPasswordResetMutation] = useMutation(REQUEST_PASSWORD_RESET);

  const passwordStrength = getPasswordStrength(registerForm.password);

  // ---------------------------------------------------------------------------
  // Core: exchange Clerk JWT for Vendure session (Google SSO only)
  // ---------------------------------------------------------------------------
  const authenticateWithVendure = async (referralCode?: string) => {
    const token = await getToken();
    if (!token) throw new Error("No Clerk token available");

    const trimmedReferral = referralCode?.trim() || undefined;

    const { data } = await authenticate({
      variables: {
        input: {
          token,
          ...(trimmedReferral ? { referralCode: trimmedReferral } : {}),
        },
      },
    });

    const result = data?.authenticate;
    if (result?.__typename === "ErrorResult") {
      throw new Error(result.message ?? "Authentication failed");
    }

    await refetchUser();
    await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!registerForm.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (!isValidFullName(registerForm.fullName)) {
      errors.fullName = "Enter your first and last name using letters only (no numbers or symbols).";
    }
    if (!registerForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(registerForm.email)) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }
    if (!registerForm.password) {
      errors.password = "Password is required.";
    } else if (!isValidPassword(registerForm.password)) {
      errors.password = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
    }
    if (!registerForm.agree) {
      errors.agree = "You must agree to the Terms & Conditions.";
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------------------------------------------------------------------------
  // LOGIN — uses LOGIN from queries.ts which expects $username, $password, $rememberMe
  // ---------------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginSubmitting(true);

    try {
      const { data } = await loginMutation({
        variables: {
          username: loginForm.email.trim(), // matches $username in LOGIN query
          password: loginForm.password,
          rememberMe: true,
        },
      });

      console.log("[login] response:", JSON.stringify(data, null, 2));

      const result = data?.login;

      if (!result) {
        setLoginErr("No response from server. Please try again.");
        return;
      }

      if (result.__typename === "CurrentUser") {
        await refetchUser();
        await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
        toast.success("Welcome back!");
        onOpenChange?.(false);
        return;
      }

      if (
        result.__typename === "InvalidCredentialsError" ||
        result.__typename === "NotVerifiedError"
      ) {
        const code = result.errorCode;
        if (code === "INVALID_CREDENTIALS_ERROR") {
          setLoginErr("Incorrect email or password. Please try again.");
        } else if (code === "NOT_VERIFIED_ERROR") {
          setLoginErr("Please verify your email before logging in. Check your inbox.");
        } else {
          setLoginErr(result.message ?? "Login failed. Please try again.");
        }
        return;
      }

      setLoginErr("Login failed. Please try again.");
    } catch (err: any) {
      console.error("[login] error:", err);
      setLoginErr(
        err?.graphQLErrors?.[0]?.message ??
        err?.networkError?.message ??
        err?.message ??
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoginSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // REGISTER — Vendure native registration
  // ---------------------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    setRegisterLoading(true);

    const nameParts = registerForm.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            emailAddress: registerForm.email.trim(),
            firstName,
            lastName,
            password: registerForm.password,
            ...(registerForm.referCode.trim()
              ? { customFields: { parrentReferralCode: registerForm.referCode.trim() } }
              : {}),
          },
        },
      });

      console.log("[register] response:", JSON.stringify(data, null, 2));

      const result = data?.registerCustomerAccount;

      if (result?.__typename === "Success") {
        setRegisterSuccess(true);
        return;
      }

      if (result?.__typename === "ErrorResult") {
        const code = result.errorCode;
        if (
          code === "EMAIL_ADDRESS_CONFLICT_ERROR" ||
          result.message?.toLowerCase().includes("already") ||
          result.message?.toLowerCase().includes("exists")
        ) {
          setRegisterErrors((p) => ({
            ...p,
            email: "This email is already registered. Please log in instead.",
          }));
        } else {
          setRegisterErrors((p) => ({ ...p, general: result.message ?? "Registration failed." }));
        }
        return;
      }

      setRegisterErrors((p) => ({ ...p, general: "Registration failed. Please try again." }));
    } catch (err: any) {
      console.error("[register] error:", err);
      const message = err?.graphQLErrors?.[0]?.message ?? err?.message ?? "Registration failed.";
      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("exists") ||
        message.toLowerCase().includes("in use")
      ) {
        setRegisterErrors((p) => ({
          ...p,
          email: "This email is already registered. Please log in instead.",
        }));
      } else {
        setRegisterErrors((p) => ({ ...p, general: message }));
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD — uses REQUEST_PASSWORD_RESET from queries.ts
  // which expects $emailAddress (not $email)
  // ---------------------------------------------------------------------------
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await requestPasswordResetMutation({
        variables: { emailAddress: forgotEmail.trim() }, // matches $emailAddress in queries.ts
      });
      setForgotSent(true);
    } catch (err) {
      // Always show success to avoid email enumeration
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // GOOGLE SSO — Clerk OAuth → Vendure authenticate mutation
  // ---------------------------------------------------------------------------
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const trimmedReferCode = registerForm.referCode.trim();
      if (trimmedReferCode) {
        sessionStorage.setItem("pendingReferralCode", trimmedReferCode);
      } else {
        sessionStorage.removeItem("pendingReferralCode");
      }

      await (clerk as any).openSignIn?.({
        redirectUrl: "/sso-callback",
        appearance: { elements: { rootBox: "hidden" } },
      });

      if (!(clerk as any).openSignIn) {
        await (clerk as any).redirectToSignIn?.({ redirectUrl: "/sso-callback" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Reset all state on modal close
  // ---------------------------------------------------------------------------
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setActiveTab("login");
      setLoginForm({ email: "", password: "" });
      setShowLoginPassword(false);
      setLoginErr(null);
      setRegisterForm({ fullName: "", email: "", password: "", agree: false, referCode: "" });
      setRegisterErrors({});
      setShowRegisterPassword(false);
      setRegisterSuccess(false);
      setForgotStep(false);
      setForgotEmail("");
      setForgotSent(false);
    }
    onOpenChange?.(open);
  };

  // ---------------------------------------------------------------------------
  // Shared UI helpers
  // ---------------------------------------------------------------------------
  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-red-500 text-xs mt-1 pl-1">{msg}</p> : null;

  const GoogleButton = (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={googleLoading}
      className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {googleLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
      ) : (
        <FaGoogle className="text-[#4285F4]" />
      )}
      {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
    </button>
  );

  const Divider = (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-gray-400 text-xs">or</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Dialog.Root open={controlledOpen} onOpenChange={handleOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <Dialog.Title>Authentication</Dialog.Title>
            <Dialog.Description>Log in or create an account to continue.</Dialog.Description>
          </VisuallyHidden>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 text-gray-400 hover:text-black" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* ── FORGOT PASSWORD STEP ── */}
          {forgotStep ? (
            <div className="flex flex-col gap-5">
              {forgotSent ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="font-semibold text-lg">Check your inbox</h2>
                  <p className="text-sm text-gray-500">
                    If an account exists for{" "}
                    <span className="font-semibold text-neutral-800">{forgotEmail}</span>,
                    we've sent a password reset link. Check your spam folder too.
                  </p>
                  <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
                  <button
                    type="button"
                    onClick={() => { setForgotStep(false); setForgotSent(false); setForgotEmail(""); }}
                    className="flex items-center gap-1 text-sm text-red-600 font-medium mt-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to login
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h2 className="font-semibold text-lg">Reset your password</h2>
                    <p className="text-sm text-gray-500">
                      Enter your email and we&apos;ll send you a reset link.
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3 focus:outline-none focus:border-red-400"
                      required
                    />
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full rounded-full bg-red-600 py-3 text-white font-semibold disabled:opacity-60"
                    >
                      {forgotLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => { setForgotStep(false); setForgotEmail(""); }}
                    className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to login
                  </button>
                </>
              )}
            </div>

          ) : registerSuccess ? (
            /* ── REGISTER SUCCESS — awaiting email verification ── */
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="font-semibold text-lg text-[#1C1C1C]">Verify your email</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                We sent a verification link to{" "}
                <span className="font-semibold text-neutral-800">{registerForm.email}</span>.
                Click the link in the email to activate your account, then log in here.
              </p>
              <p className="text-xs text-gray-400">Check your spam folder if you don't see it.</p>
              <button
                type="button"
                onClick={() => {
                  setRegisterSuccess(false);
                  setActiveTab("login");
                  setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
                }}
                className="mt-2 rounded-full bg-red-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Go to login
              </button>
            </div>

          ) : (
            <>
              {/* ── TABS ── */}
              <div className="flex mb-6 border-b">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-2 text-center ${
                    activeTab === "login" ? "border-b border-[#3C3C3C] font-semibold" : "text-gray-500"
                  }`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-2 text-center ${
                    activeTab === "register" ? "border-b border-black font-semibold" : "text-gray-500"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* ── LOGIN TAB ── */}
              {activeTab === "login" && (
                <div className="flex flex-col gap-4">
                  {GoogleButton}
                  {Divider}
                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                      type="email"
                      placeholder="Enter Email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full rounded-full border px-4 py-3 focus:outline-none focus:border-red-400"
                      required
                    />
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full rounded-full border px-4 py-3 pr-10 focus:outline-none focus:border-red-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotStep(true)}
                      className="text-red-600 hover:underline font-medium text-sm text-left"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="submit"
                      disabled={loginSubmitting}
                      className="w-full rounded-full bg-red-600 py-3 text-white font-semibold disabled:opacity-60"
                    >
                      {loginSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Logging in...
                        </span>
                      ) : (
                        "Sign in"
                      )}
                    </button>
                    {loginErr && <p className="text-red-500 text-sm text-center">{loginErr}</p>}
                  </form>
                  <p className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="text-[#FF0000] font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              )}

              {/* ── REGISTER TAB ── */}
              {activeTab === "register" && (
                <div className="flex flex-col gap-3">
                  {GoogleButton}
                  {Divider}
                  <form onSubmit={handleRegister} className="flex flex-col gap-3" noValidate>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1C1C1C]">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={registerForm.fullName}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, fullName: e.target.value });
                          if (registerErrors.fullName) setRegisterErrors((p) => ({ ...p, fullName: "" }));
                        }}
                        className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none ${
                          registerErrors.fullName ? "border-red-400" : "border-[#E5E5E5]"
                        }`}
                      />
                      <FieldError msg={registerErrors.fullName} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1C1C1C]">Email</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={registerForm.email}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, email: e.target.value });
                          if (registerErrors.email) setRegisterErrors((p) => ({ ...p, email: "" }));
                        }}
                        className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none ${
                          registerErrors.email ? "border-red-400" : "border-[#E5E5E5]"
                        }`}
                      />
                      <FieldError msg={registerErrors.email} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1C1C1C]">Password</label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Min 8 chars, upper, lower, number, symbol"
                          value={registerForm.password}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, password: e.target.value });
                            if (registerErrors.password) setRegisterErrors((p) => ({ ...p, password: "" }));
                          }}
                          className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-2 text-xs font-semibold pr-10 focus:outline-none ${
                            registerErrors.password ? "border-red-400" : "border-[#E5E5E5]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-2 text-gray-500"
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerForm.password.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: passwordStrength.width }}
                            />
                          </div>
                          <p className={`text-xs font-medium pl-1 ${
                            passwordStrength.label === "Weak" ? "text-red-500"
                            : passwordStrength.label === "Fair" ? "text-yellow-500"
                            : "text-green-600"
                          }`}>
                            {passwordStrength.label} password
                          </p>
                        </div>
                      )}
                      <FieldError msg={registerErrors.password} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1C1C1C]">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Referral Code"
                        value={registerForm.referCode}
                        onChange={(e) => setRegisterForm({ ...registerForm, referCode: e.target.value })}
                        className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={registerForm.agree}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, agree: e.target.checked });
                            if (registerErrors.agree) setRegisterErrors((p) => ({ ...p, agree: "" }));
                          }}
                          className="mt-0.5 mr-1"
                        />
                        <span className="text-xs">
                          I agree to all{" "}
                          <a href="#" className="underline font-medium">Terms & Conditions</a>
                        </span>
                      </label>
                      <FieldError msg={registerErrors.agree} />
                    </div>

                    {registerErrors.general && (
                      <p className="text-red-500 text-xs text-center">{registerErrors.general}</p>
                    )}

                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="w-full rounded-full bg-red-600 py-2 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {registerLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Creating account...
                        </span>
                      ) : (
                        "Create an Account"
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm mt-2">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-[#FF0000] font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}
            </>
          )}

          <div id="clerk-captcha" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}