"use client";

/**
 * app/sso-callback/page.tsx
 *
 * Clerk redirects here after the Google OAuth screen.
 * AuthenticateWithRedirectCallback handles the token exchange
 * and then redirects to "/" (set in redirectUrl/redirectUrlComplete).
 */

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}