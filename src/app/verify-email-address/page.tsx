"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import Navbar from "@/Components/Navbar/Navbar";
import Footer from "@/Components/Footer/Footer";
import { Suspense } from "react";

/* ---------- GraphQL Mutations ---------- */
const VERIFY_CUSTOMER_ACCOUNT = gql`
  mutation VerifyToken($token: String!) {
    verifyCustomerAccount(token: $token) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LogIn(
    $emailAddress: String!
    $password: String!
    $rememberMe: Boolean!
  ) {
    login(
      username: $emailAddress
      password: $password
      rememberMe: $rememberMe
    ) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const REFRESH_VERIFICATION = gql`
  mutation RefreshCustomerVerification($email: String!) {
    refreshCustomerVerification(emailAddress: $email) {
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

/* ---------- Types ---------- */
type CurrentUser = {
  __typename: "CurrentUser";
  id: string;
  identifier: string;
};

type ErrorResult = {
  __typename: "ErrorResult";
  errorCode?: string | null;
  message?: string | null;
};

type VerifyResult = {
  verifyCustomerAccount: CurrentUser | ErrorResult;
};

type LoginResult = {
  login: CurrentUser | ErrorResult;
};

type RefreshResult = {
  refreshCustomerVerification:
  | { __typename: "Success"; success: boolean }
  | ErrorResult;
};

/* ---------- Inner Component that uses useSearchParams ---------- */
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || "";

  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "verified" | "error" | "expired" | "need-refresh"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Mutations
  const [verifyAccount, { loading: verifyLoading }] = useMutation<VerifyResult>(
    VERIFY_CUSTOMER_ACCOUNT
  );

  const [refreshVerification, { loading: refreshLoading }] =
    useMutation<RefreshResult>(REFRESH_VERIFICATION);

  // Auto-verify when component mounts and token exists
  useEffect(() => {
    if (token && verificationState === "idle") {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    if (!token) return;

    setVerificationState("verifying");

    try {
      const result = await verifyAccount({
        variables: { token },
      });

      const response = result.data?.verifyCustomerAccount;

      if (response?.__typename === "CurrentUser") {
        // Verification successful - user is now logged in
        setVerificationState("verified");

        // Redirect to dashboard/home after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else if (response?.__typename === "ErrorResult") {
        handleVerificationError(response.errorCode, response.message);
      }
    } catch (error) {
      setVerificationState("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleVerificationError = (
    errorCode?: string | null,
    message?: string | null
  ) => {
    switch (errorCode) {
      case "VerificationTokenExpiredError":
        setVerificationState("expired");
        setShowEmailInput(true);
        break;

      case "MissingPasswordError":
      case "NativeAuthStrategyError":
      case "PasswordAlreadySetError":
      case "PasswordValidationError":
      case "VerificationTokenInvalidError":
        setVerificationState("error");
        setErrorMessage(message || "Verification failed. Please try again.");
        break;

      default:
        setVerificationState("error");
        setErrorMessage(message || "An error occurred during verification.");
    }
  };

  const handleRefreshVerification = async () => {
    if (!userEmail.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      const result = await refreshVerification({
        variables: { email: userEmail.trim() },
      });

      const response = result.data?.refreshCustomerVerification;

      if (response?.__typename === "Success") {
        setVerificationState("need-refresh");
        setErrorMessage("");
      } else if (response?.__typename === "ErrorResult") {
        setErrorMessage(
          response.message || "Failed to send new verification email."
        );
      }
    } catch (error) {
      setErrorMessage(
        "Failed to send new verification email. Please try again."
      );
    }
  };

  const renderContent = () => {
    if (!token) {
      return (
        <p className="mt-3 text-sm text-neutral-600">
          Missing verification token. Please open the link from your email.
        </p>
      );
    }

    switch (verificationState) {
      case "idle":
      case "verifying":
        return (
          <p className="mt-3 text-sm text-neutral-600">
            Verifying your email address...
          </p>
        );

      case "verified":
        return (
          <>
            <p className="mt-3 text-sm text-green-700">
              ✅ Email verified successfully! You are now logged in.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Redirecting you to the homepage...
            </p>
            <div className="mt-5">
              <button
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => router.push("/")}
              >
                Go to Home
              </button>
            </div>
          </>
        );

      case "expired":
        return (
          <>
            <p className="mt-3 text-sm text-amber-600">
              ⚠️ Your verification token has expired.
            </p>
            {showEmailInput && (
              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    Enter your email to receive a new verification link:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <button
                  onClick={handleRefreshVerification}
                  disabled={refreshLoading}
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {refreshLoading
                    ? "Sending..."
                    : "Send New Verification Email"}
                </button>
                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
            )}
          </>
        );

      case "need-refresh":
        return (
          <>
            <p className="mt-3 text-sm text-green-700">
              ✅ New verification email sent! Please check your inbox.
            </p>
            <div className="mt-5">
              <button
                className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-50"
                onClick={() => router.push("/")}
              >
                Go to Home
              </button>
            </div>
          </>
        );

      case "error":
      default:
        return (
          <>
            <p className="mt-3 text-sm text-red-600">
              ❌ {errorMessage || "Verification failed. Please try again."}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-50"
                onClick={handleVerification}
                disabled={verifyLoading}
              >
                {verifyLoading ? "Trying..." : "Try Again"}
              </button>
              <button
                className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold hover:bg-neutral-50"
                onClick={() => router.push("/")}
              >
                Go to Home
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Verify Email Address
        </h1>

        {renderContent()}
      </div>

      {/* Dev hint */}
      <p className="mt-4 text-xs text-neutral-500">
        Local test:{" "}
        <code>
          http://localhost:3000/verify-email-address?token=YOUR_TOKEN
        </code>
      </p>
    </div>
  );
}

/* ---------- Main Page Component ---------- */
export default function VerifyEmailAddressPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Navbar />

      <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-12"><p className="text-center">Loading verification...</p></div>}>
        <VerifyEmailContent />
      </Suspense>

      <Footer />
    </main>
  );
}