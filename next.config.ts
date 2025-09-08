import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "staging-backend.solarcabal.com",
        port: "",
        pathname: "/assets/**",
      },
      // Add more patterns if needed
      {
        protocol: "https",
        hostname: "staging-backend.solarcabal.com",
        port: "",
        pathname: "/**", // Allow all paths from this domain
      },
    ],
    // Alternative: using domains (deprecated but still works)
    // domains: ['staging-backend.solarcabal.com'],
  },
};

export default nextConfig;
