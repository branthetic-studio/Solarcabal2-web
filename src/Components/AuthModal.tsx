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
import { MdEmail } from "react-icons/md";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";

// --- GraphQL Mutation for Register ---
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
  open?: boolean; // controlled open
  onOpenChange?: (open: boolean) => void; // controlled setter
};

export default function AuthModal({ trigger, open: controlledOpen, onOpenChange }: AuthModalProps) {
  const apollo = useApolloClient();
  const { login, loading: userLoading, customer } = useUser();

  // Tabs
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // --- Login State ---
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // --- Register State ---
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    agree: false,
    referCode: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [
    register,
    { loading: registerLoading, error: registerError, data: registerData },
  ] = useMutation(REGISTER_MUTATION);

  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginSubmitting(true);
    try {
      await login(loginForm.email, loginForm.password, rememberMe);
      toast("✅ Login successful");

      await apollo.refetchQueries({ include: [GET_ACTIVE_ORDER] });

      // close modal on success
      onOpenChange?.(false);
    } catch (err: any) {
      console.error(err);
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

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-black"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* Tabs */}
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
                activeTab === "register" ? "border-b border-black font-light" : "text-gray-500"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
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
              {loginErr && <p className="text-red-500">{loginErr}</p>}
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              {/* Name, Email, Password, Referral, Terms Checkbox */}
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

              <div className="relative">
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
                  className="absolute right-3 top-3 text-gray-500"
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
                <p className="text-xs">I agree to all </p>
                <a href="#" className="underline font-medium ml-1 text-xs">Terms & Conditions</a>
              </label>

              <button
                type="submit"
                disabled={registerLoading || !registerForm.agree}
                className="w-full rounded-full bg-red-600 py-2 text-white text-sm font-semibold disabled:opacity-60"
              >
                {registerLoading ? "Creating..." : "Create an Account"}
              </button>

              {registerError && <p className="text-red-500">{registerError.message}</p>}
              {registerData?.registerCustomerAccount?.__typename === "Success" && (
                <p className="text-green-600">
                  Registered! Please check your email to verify your account.
                </p>
              )}

              {/* Social login */}
              <div className="flex items-center my-2">
                <div className="flex-1 border-t" />
                <span className="px-2 text-gray-500 text-sm">Or Sign Up with</span>
                <div className="flex-1 border-t" />
              </div>

              <div className="flex gap-3">
                <button type="button" className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 bg-black text-white text-xs">
                  <MdEmail /> Email
                </button>
                <button type="button" onClick={() => signIn("google")} className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2 text-xs">
                  <FaGoogle /> Continue with Google
                </button>
              </div>

              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <button type="button" onClick={() => setActiveTab("login")} className="text-[#FF0000] font-medium">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
