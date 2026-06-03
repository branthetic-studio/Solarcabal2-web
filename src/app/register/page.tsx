"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useSignIn, useClerk, useAuth } from "@clerk/nextjs";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { GET_ACTIVE_ORDER, CLERK_AUTHENTICATE } from "@/graphql/queries";
import { FaGoogle, FaApple } from "react-icons/fa";

type AuthenticateResult = {
  authenticate:
    | { __typename: "CurrentUser"; id: string; identifier: string }
    | { __typename: "ErrorResult"; errorCode: string; message: string };
};

type AuthenticateVars = {
  token: string;
  referralCode?: string;
};

export default function RegisterLandingPage() {
  const router = useRouter();
  const apollo = useApolloClient();
  const { refetchUser } = useUser();

  const { signIn, isLoaded: signInLoaded } = useSignIn() as any;
  const clerk = useClerk() as any;
  const { getToken, isSignedIn } = useAuth() as any;

  const [googleLoading, setGoogleLoading] = useState(false);

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

      const pendingReferral = sessionStorage.getItem("pendingReferralCode");
      if (!pendingReferral) sessionStorage.removeItem("pendingReferralCode");

      const baseUrl = window.location.origin;

      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${baseUrl}/sso-callback`,
        redirectUrlComplete: `${baseUrl}/`,
      });
    } catch (err: any) {
      if (err?.message?.includes("already signed in")) {
        toast.success("You're already signed in!");
        router.push("/");
        return;
      }
      toast.error(err?.message ?? "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  return (
    // Only show on mobile — desktop uses the modal
    <div className="lg:hidden min-h-screen bg-white flex flex-col px-6 pt-6 pb-10">
      {/* Top bar */}
      <div className="flex justify-end mb-10">
        <button className="p-2">
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Logo + Title */}
      <div className="flex flex-col gap-4 flex-1 justify-center">
        <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Image
            src="/solarcabal.png"
            alt="SolarCabal"
            width={36}
            height={36}
            className="brightness-0 invert"
          />
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Welcome To
            <br />
            SolarCabal
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        {/* Continue with Email */}
        <button
          onClick={() => router.push("/register/details")}
          className="w-full bg-gray-900 text-white rounded-full py-4 text-base font-semibold tracking-wide hover:bg-gray-800 transition-colors"
        >
          Continue with Email
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-gray-400 text-sm">Or Continue With</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Social buttons */}
        <div className="flex justify-center gap-4">
          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !signInLoaded}
            className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FaGoogle className="text-white text-xl" />
            )}
          </button>

          {/* Apple */}
          <button className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
            <FaApple className="text-white text-2xl" />
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-red-600 font-semibold">
            Login
          </Link>
        </p>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
          By continuing, you accept the{" "}
          <span className="font-bold text-gray-700">Terms of Use</span> and
          <br />
          <span className="font-bold text-gray-700">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}