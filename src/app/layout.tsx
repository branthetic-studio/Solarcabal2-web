import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ApolloWrapper from "./providers";
import UserProvider from "@/context/UserContext";
import CartProvider from "@/context/CartContext";
import FacetsProvider from "@/context/useFacet";
import LocalCartProvider from "@/context/LocalCartContext";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOLAR CABAL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Toaster />

          <ApolloWrapper>
            <UserProvider>
              <FacetsProvider>
                <LocalCartProvider>
                  <CartProvider>{children}</CartProvider>
                </LocalCartProvider>
              </FacetsProvider>
            </UserProvider>
          </ApolloWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}