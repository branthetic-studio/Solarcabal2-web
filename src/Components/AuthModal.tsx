"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { X, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { useSignIn, useSignUp, useClerk, useAuth } from "@clerk/nextjs";
import { GET_ACTIVE_ORDER, CLERK_AUTHENTICATE } from "@/graphql/queries";

type AuthenticateResult = {
  authenticate:
  | { __typename: "CurrentUser"; id: string; identifier: string }
  | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthenticateVars = {
  token: string;
  referralCode?: string;
};

type AuthModalProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const isValidFullName = (name: string) =>
  /^[a-zA-Z\s'\-]{2,}$/.test(name.trim()) &&
  name.trim().split(/\s+/).length >= 2;

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPassword = (password: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

const getPasswordStrength = (
  password: string
): { label: string; color: string; width: string } => {
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

export default function AuthModal({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AuthModalProps) {
  const apollo = useApolloClient();
  const { refetchUser } = useUser();

  const { signIn, isLoaded: signInLoaded } = useSignIn() as any;
  const { signUp, isLoaded: signUpLoaded } = useSignUp() as any;
  const clerk = useClerk() as any;
  const { getToken, isSignedIn } = useAuth() as any;

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [googleLoading, setGoogleLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

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

  const [verifyStep, setVerifyStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [forgotStep, setForgotStep] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [authenticate] = useMutation<AuthenticateResult, AuthenticateVars>(
    CLERK_AUTHENTICATE
  );

  const passwordStrength = getPasswordStrength(registerForm.password);

  // ─── Core: Clerk JWT → Vendure session ──────────────────────────────────
  const authenticateWithVendure = async (referralCode?: string) => {
    const token = await getToken();
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

  // ─── Validation ─────────────────────────────────────────────────────────
  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!registerForm.fullName.trim()) {
      errors.fullName = "Full name is required.";
    } else if (!isValidFullName(registerForm.fullName)) {
      errors.fullName = "Enter your first and last name using letters only.";
    }
    if (!registerForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(registerForm.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!registerForm.password) {
      errors.password = "Password is required.";
    } else if (!isValidPassword(registerForm.password)) {
      errors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
    }
    if (!registerForm.agree) {
      errors.agree = "You must agree to the Terms & Conditions.";
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── LOGIN ───────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginSubmitting(true);

    try {
      const existingToken = await getToken();
      if (existingToken) {
        await authenticateWithVendure();
        toast.success("Welcome back!");
        onOpenChange?.(false);
        return;
      }

      if (!signIn || !signInLoaded) throw new Error("Auth not ready. Please wait.");

      const result = await signIn.create({
        identifier: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (result.status === "complete") {
        try {
          await clerk.setActive({ session: result.createdSessionId });
        } catch (e: any) {
          if (!e?.message?.includes("plain objects")) throw e;
        }
        await new Promise((r) => setTimeout(r, 300));
        await authenticateWithVendure();
        toast.success("Welcome back!");
        onOpenChange?.(false);
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
        setLoginErr("Incorrect email or password. Please try again.");
      } else if (/verif/i.test(msg)) {
        setLoginErr("Please verify your email before logging in.");
      } else {
        setLoginErr(msg);
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  // ─── REGISTER ────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setRegisterLoading(true);

    const nameParts = registerForm.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    try {
      if (!signUp || !signUpLoaded) throw new Error("Auth not ready. Please wait.");

      const result = await signUp.create({
        emailAddress: registerForm.email.trim(),
        password: registerForm.password,
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
        await new Promise((r) => setTimeout(r, 300));
        await authenticateWithVendure(registerForm.referCode.trim() || undefined);
        toast.success("Account created! Welcome 🎉", { duration: 5000 });
        onOpenChange?.(false);
        return;
      }

      throw new Error("Registration incomplete. Please try again.");
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err?.message ??
        "Registration failed.";
      const clerkError = err?.errors?.[0];

      if (
        clerkError?.code === "form_identifier_exists" ||
        clerkError?.code === "identifier_exists" ||
        /already|exists|taken|in use/i.test(message)
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

  // ─── OTP VERIFY ──────────────────────────────────────────────────────────
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
      await new Promise((r) => setTimeout(r, 300));
      await authenticateWithVendure(registerForm.referCode.trim() || undefined);
      toast.success("Account created! Welcome 🎉", { duration: 5000 });
      onOpenChange?.(false);
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

  // ─── RESEND OTP ───────────────────────────────────────────────────────────
  const handleResendCode = async () => {
    setResendLoading(true);
    setOtpError(null);
    try {
      if (!signUp || !signUpLoaded) throw new Error("Auth not ready.");
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setOtpCode("");
      toast.info("A new code has been sent to your email.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resend.");
    } finally {
      setResendLoading(false);
    }
  };

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
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

  // ─── GOOGLE SSO ───────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      if (isSignedIn) {
        toast.success("You're already signed in!");
        onOpenChange?.(false);
        return;
      }

      if (!signIn || !signInLoaded) throw new Error("Auth not ready.");

      // ✅ Capture referral code from whichever tab is active
      const trimmedReferCode = registerForm.referCode?.trim();
      if (trimmedReferCode) {
        sessionStorage.setItem("pendingReferralCode", trimmedReferCode);
      } else {
        sessionStorage.removeItem("pendingReferralCode");
      }

      const baseUrl = window.location.origin; // http://localhost:3000

      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${baseUrl}/sso-callback`,
        redirectUrlComplete: `${baseUrl}/`,
      });

      // browser leaves here — no code below runs
    } catch (err: any) {
      if (err?.message?.includes("already signed in")) {
        toast.success("You're already signed in!");
        onOpenChange?.(false);
        return;
      }
      toast.error(err?.message ?? "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  // ─── RESET STATE ON CLOSE ─────────────────────────────────────────────────
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setActiveTab("login");
      setLoginForm({ email: "", password: "" });
      setShowLoginPassword(false);
      setLoginErr(null);
      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
        agree: false,
        referCode: "",
      });
      setRegisterErrors({});
      setShowRegisterPassword(false);
      setVerifyStep(false);
      setOtpCode("");
      setOtpError(null);
      setForgotStep(false);
      setForgotEmail("");
      setForgotSent(false);
    }
    onOpenChange?.(open);
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-red-500 text-xs mt-1 pl-1">{msg}</p> : null;

  const GoogleButton = (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={googleLoading || !signInLoaded}
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

  return (
    <Dialog.Root open={controlledOpen} onOpenChange={handleOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <Dialog.Title>Authentication</Dialog.Title>
            <Dialog.Description>
              Log in or create an account to continue.
            </Dialog.Description>
          </VisuallyHidden>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-black"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* ── FORGOT PASSWORD ── */}
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
                    <span className="font-semibold text-neutral-800">
                      {forgotEmail}
                    </span>
                    , we've sent a password reset link. Check your spam folder too.
                  </p>
                  <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(false);
                      setForgotSent(false);
                      setForgotEmail("");
                      onOpenChange?.(false);
                      window.location.href = "/reset-password";
                    }}
                    className="flex items-center gap-1 text-sm text-red-600 font-medium mt-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Change Password
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h2 className="font-semibold text-lg">Reset your password</h2>
                    <p className="text-sm text-gray-500">
                      Enter your email and we'll send you a reset link.
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
          ) : verifyStep ? (
            /* ── OTP VERIFY ── */
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1C1C1C] text-lg">
                    Check your email
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">We sent a 6-digit code to</p>
                  <p className="font-semibold text-sm text-[#1C1C1C] mt-0.5">
                    {registerForm.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1C1C1C]">
                    Verification Code
                  </label>
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
                    className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-3 text-center text-xl font-bold tracking-[0.4em] focus:outline-none ${otpError ? "border-red-400" : "border-[#E5E5E5]"
                      }`}
                  />
                  {otpError && (
                    <p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length < 6}
                  className="w-full rounded-full bg-red-600 py-3 text-white font-semibold disabled:opacity-60 transition-opacity"
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Create Account"
                  )}
                </button>
              </form>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-[#FF0000] font-medium disabled:opacity-60"
                  >
                    {resendLoading ? "Sending..." : "Resend code"}
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => { setVerifyStep(false); setOtpCode(""); setOtpError(null); }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to registration
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── TABS ── */}
              <div className="flex mb-6 border-b">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-2 text-center ${activeTab === "login"
                    ? "border-b border-[#3C3C3C] font-semibold"
                    : "text-gray-500"
                    }`}
                >
                  Log in
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-2 text-center ${activeTab === "register"
                    ? "border-b border-black font-semibold"
                    : "text-gray-500"
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
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      className="w-full rounded-full border px-4 py-3 focus:outline-none focus:border-red-400"
                      required
                    />
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                        className="w-full rounded-full border px-4 py-3 pr-10 focus:outline-none focus:border-red-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
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
                      disabled={loginSubmitting || !signInLoaded}
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
                    {loginErr && (
                      <p className="text-red-500 text-sm text-center">{loginErr}</p>
                    )}
                  </form>
                  <p className="text-center text-sm">
                    Don't have an account?{" "}
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
                      <label className="text-xs font-semibold text-[#1C1C1C]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={registerForm.fullName}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, fullName: e.target.value });
                          if (registerErrors.fullName)
                            setRegisterErrors((p) => ({ ...p, fullName: "" }));
                        }}
                        className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none ${registerErrors.fullName ? "border-red-400" : "border-[#E5E5E5]"
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
                          if (registerErrors.email)
                            setRegisterErrors((p) => ({ ...p, email: "" }));
                        }}
                        className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none ${registerErrors.email ? "border-red-400" : "border-[#E5E5E5]"
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
                            if (registerErrors.password)
                              setRegisterErrors((p) => ({ ...p, password: "" }));
                          }}
                          className={`w-full rounded-full border bg-[#FAFAFA] px-4 py-2 text-xs font-semibold pr-10 focus:outline-none ${registerErrors.password ? "border-red-400" : "border-[#E5E5E5]"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-2 text-gray-500"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
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
                          <p
                            className={`text-xs font-medium pl-1 ${passwordStrength.label === "Weak"
                              ? "text-red-500"
                              : passwordStrength.label === "Fair"
                                ? "text-yellow-500"
                                : "text-green-600"
                              }`}
                          >
                            {passwordStrength.label} password
                          </p>
                        </div>
                      )}
                      <FieldError msg={registerErrors.password} />
                    </div>

                    {/* ✅ Referral code — shared between email and Google signup */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1C1C1C]">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Referral Code"
                        value={registerForm.referCode}
                        onChange={(e) => {
                          // Sanitize: only alphanumeric + hyphens, uppercase, max 20 chars
                          const sanitized = e.target.value
                            .replace(/[^a-zA-Z0-9-]/g, "")
                            .toUpperCase()
                            .slice(0, 20);
                          setRegisterForm({ ...registerForm, referCode: sanitized });
                        }}
                        className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none"
                      />
                      {/* No error shown — invalid/empty codes are silently ignored on the backend */}
                    </div>

                    <div>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={registerForm.agree}
                          onChange={(e) => {
                            setRegisterForm({ ...registerForm, agree: e.target.checked });
                            if (registerErrors.agree)
                              setRegisterErrors((p) => ({ ...p, agree: "" }));
                          }}
                          className="mt-0.5 mr-1"
                        />
                        <span className="text-xs">
                          I agree to all{" "}
                          <a href="#" className="underline font-medium">
                            Terms & Conditions
                          </a>
                        </span>
                      </label>
                      <FieldError msg={registerErrors.agree} />
                    </div>

                    {registerErrors.general && (
                      <p className="text-red-500 text-xs text-center">
                        {registerErrors.general}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={registerLoading || !signUpLoaded}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}