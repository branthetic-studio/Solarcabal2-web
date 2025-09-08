"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useApolloClient } from "@apollo/client/react";
import { gql, TypedDocumentNode } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { X, Eye, EyeOff } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useUser } from "@/context/UserContext"; 
import { GET_ACTIVE_ORDER, GET_CURRENT_USER } from "@/graphql/queries"; 
import { MdEmail } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";

// --- GraphQL Mutations (Register only here) ---
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

export default function AuthModal({ trigger }: { trigger: React.ReactNode }) {
  const apollo = useApolloClient();
  const { login, loading: userLoading, me } = useUser();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");

  // --- Login form state ---
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // --- Register form state ---
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    agree: false,
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [
    register,
    { loading: registerLoading, error: registerError, data: registerData },
  ] = useMutation(REGISTER_MUTATION);

  // Close modal if already logged in (e.g., after a successful login)
  useEffect(() => {
    if (me && open) {
      setOpen(false);
    }
  }, [me, open]);

  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginSubmitting(true);
    try {
      await login(loginForm.email, loginForm.password, true);
      // Ensure cart & user are fresh in cache after login
      await apollo.refetchQueries({
        include: [GET_CURRENT_USER, GET_ACTIVE_ORDER],
      });
      // The `me` effect will close the modal
    } catch (err: any) {
      setLoginErr(err?.message ?? "Login failed");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...lastNameParts] = registerForm.fullName
      .trim()
      .split(/\s+/);
    await register({
      variables: {
        input: {
          emailAddress: registerForm.email,
          firstName: firstName ?? "",
          lastName: lastNameParts.join(" "),
          password: registerForm.password,
        },
      },
    });
    // After success, do NOT auto-login (Vendure typical flow requires email verify).
    // You can optionally toggle to login tab:
    // if (registerData?.registerCustomerAccount?.__typename === "Success") setActiveTab("login");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-xl">
          {/* Accessibility */}
          <VisuallyHidden>
            <Dialog.Title>Authentication</Dialog.Title>
            <Dialog.Description>
              Log in or create an account to continue.
            </Dialog.Description>
          </VisuallyHidden>

          {/* Close button */}
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
              className={`flex-1 py-2 text-center ${activeTab === "login"
                  ? "border-b-1 border-[#3C3C3C] font-semibold"
                  : "text-gray-500"
                }`}
            >
              Log in
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-center ${activeTab === "register"
                  ? "border-b-1 border-black font-light"
                  : "text-gray-500"
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
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                className="w-full rounded-full border px-4 py-3 focus:outline-none"
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
                  className="w-full rounded-full border px-4 py-3 pr-10 focus:outline-none"
                  required
                />
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={registerForm.agree}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, agree: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Keep me logged in
                </label>
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
                type="submit"
                disabled={loginSubmitting || userLoading}
                className="w-full rounded-full bg-red-600 py-3 text-white font-semibold disabled:opacity-60"
              >
                {loginSubmitting || userLoading ? "Logging in..." : "Sign in"}
              </button>
              {loginErr && <p className="text-red-500">{loginErr}</p>}
              {/* You can also render a subtle success message once me is set */}
              {/* {me && <p className="text-green-600">✅ Welcome {me.identifier}</p>} */}
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter Full Name"
                value={registerForm.fullName}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, fullName: e.target.value })
                }
                className="w-full rounded-full border px-4 py-3 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Enter Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                className="w-full rounded-full border px-4 py-3 focus:outline-none"
                required
              />
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-full border px-4 py-3 pr-10 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showRegisterPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={registerForm.agree}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      agree: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                I agree to all{" "}
                <a href="#" className="underline font-medium ml-1">
                  Terms & Conditions
                </a>
              </label>

              <button
                type="submit"
                disabled={registerLoading || !registerForm.agree}
                className="w-full rounded-full bg-red-600 py-3 text-white font-semibold disabled:opacity-60"
              >
                {registerLoading ? "Creating..." : "Create an Account"}
              </button>

              {registerError && (
                <p className="text-red-500">{registerError.message}</p>
              )}
              {registerData?.registerCustomerAccount?.__typename ===
                "Success" && (
                <p className="text-green-600">
                  ✅ Registered! Please check your email to verify your account.
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center my-2">
                <div className="flex-1 border-t" />
                <span className="px-2 text-gray-500 text-sm">
                  Or Sign Up with
                </span>
                <div className="flex-1 border-t" />
              </div>

              {/* Social buttons (placeholders) */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 flex items-center text-sm justify-center gap-2 rounded-lg border py-1"
                >
                  <MdEmail /> Email
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center test-sm justify-center gap-2 rounded-lg border py-1"
                >
                  <FaGoogle /> Google
                </button>

              </div>

              {/* Switch link */}
              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-[#FF0000] font-medium"
                >
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
