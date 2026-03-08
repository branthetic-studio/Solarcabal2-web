"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useApolloClient } from "@apollo/client/react";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { X, Eye, EyeOff } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useUser } from "@/context/UserContext";
import { GET_ACTIVE_ORDER } from "@/graphql/queries";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { useSignIn, useClerk, useAuth } from "@clerk/nextjs";

// ---------------------------------------------------------------------------
// GraphQL
// ---------------------------------------------------------------------------
const REGISTER_MUTATION: TypedDocumentNode<
  {
    registerCustomerAccount:
    | { __typename: "Success"; success: boolean }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
  },
  {
    input: {
      emailAddress: string;
      firstName: string;
      lastName: string;
      password: string;
      referCode?: string;
    };
  }
> = gql`
  mutation Register($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

type AuthModalProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function AuthModal({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AuthModalProps) {
  const apollo = useApolloClient();
  const { login, loading: userLoading } = useUser();

  const { signIn } = useSignIn();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    agree: false,
    referCode: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [register, { loading: registerLoading, error: registerError, data: registerData }] =
    useMutation(REGISTER_MUTATION);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginSubmitting(true);
    try {
      await login(loginForm.email, loginForm.password, rememberMe);
      toast.success("✅ Login successful");
      await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });
      onOpenChange?.(false);
    } catch (err: any) {
      setLoginErr(err?.message ?? "Login failed");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...lastNameParts] = registerForm.fullName.trim().split(/\s+/);
    await register({
      variables: {
        input: {
          emailAddress: registerForm.email,
          firstName: firstName ?? "",
          lastName: lastNameParts.join(" "),
          password: registerForm.password,
          referCode: registerForm.referCode || undefined,
        },
      },
    });
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // If Clerk already has a session (e.g. Vendure verification failed last time),
      // sign out of Clerk first so we can restart the OAuth flow cleanly.
      if (isSignedIn) {
        await signOut();
      }

      if (!signIn) {
        toast.error("Auth not ready, please try again.");
        setGoogleLoading(false);
        return;
      }

      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/",
      });

      if (error) {
        console.error("Google SSO error:", error);
        toast.error("Google sign-in failed. Please try again.");
        setGoogleLoading(false);
      }
      // On success the browser navigates away — don't reset googleLoading
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      toast.error(err?.errors?.[0]?.message ?? err?.message ?? "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Shared UI
  // ---------------------------------------------------------------------------
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

  return (
    <Dialog.Root open={controlledOpen} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-xl">
          <VisuallyHidden>
            <Dialog.Title>Authentication</Dialog.Title>
            <Dialog.Description>Log in or create an account to continue.</Dialog.Description>
          </VisuallyHidden>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 text-gray-400 hover:text-black" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Tabs */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-center ${activeTab === "login" ? "border-b border-[#3C3C3C] font-semibold" : "text-gray-500"}`}
            >
              Log in
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-center ${activeTab === "register" ? "border-b border-black font-light" : "text-gray-500"}`}
            >
              Create Account
            </button>
          </div>

          {/* LOGIN TAB */}
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
                  className="w-full rounded-full border px-4 py-3 focus:outline-none"
                  required
                />
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full rounded-full border px-4 py-3 pr-10 focus:outline-none"
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
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  Keep me logged in
                </label>
                <a href="/forgot-password" className="text-red-600 hover:underline font-medium text-sm">
                  Forgot password?
                </a>
                <button
                  type="submit"
                  disabled={loginSubmitting || userLoading}
                  className="w-full rounded-full bg-red-600 py-3 text-white font-semibold disabled:opacity-60"
                >
                  {loginSubmitting || userLoading ? "Logging in..." : "Sign in"}
                </button>
                {loginErr && <p className="text-red-500 text-sm">{loginErr}</p>}
              </form>
              <p className="text-center text-sm">
                Don't have an account?{" "}
                <button type="button" onClick={() => setActiveTab("register")} className="text-[#FF0000] font-medium">
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === "register" && (
            <div className="flex flex-col gap-3">
              {GoogleButton}
              {Divider}
              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1C1C1C]">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter Full Name"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1C1C1C]">Email</label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>
                <div className="relative flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1C1C1C]">Password</label>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-xs font-semibold pr-10 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 bottom-2 text-gray-500"
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1C1C1C]">Referral Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter Referral Code"
                    value={registerForm.referCode}
                    onChange={(e) => setRegisterForm({ ...registerForm, referCode: e.target.value })}
                    className="w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={registerForm.agree}
                    onChange={(e) => setRegisterForm({ ...registerForm, agree: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-xs">I agree to all </span>
                  <a href="#" className="underline font-medium ml-1 text-xs">Terms & Conditions</a>
                </label>
                <button
                  type="submit"
                  disabled={registerLoading || !registerForm.agree}
                  className="w-full rounded-full bg-red-600 py-2 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {registerLoading ? "Creating..." : "Create an Account"}
                </button>
                {registerError && <p className="text-red-500 text-sm">{registerError.message}</p>}
                {registerData?.registerCustomerAccount?.__typename === "Success" && (
                  <p className="text-green-600 text-sm">
                    Registered! Please check your email to verify your account.
                  </p>
                )}
              </form>
              <p className="text-center text-sm mt-2">
                Already have an account?{" "}
                <button type="button" onClick={() => setActiveTab("login")} className="text-[#FF0000] font-medium">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* Required by Clerk for bot protection on custom flows */}
          <div id="clerk-captcha" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}