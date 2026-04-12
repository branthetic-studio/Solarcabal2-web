"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export function AuthSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refetchUser } = useUser();

  useEffect(() => {
    if (searchParams.get("auth") !== "success") return;

    console.log("🟢 AuthSuccessHandler triggered");

    const run = async () => {
      try {
        console.log("🟢 calling refetchUser...");
        const result = await refetchUser();
        console.log("🟢 refetchUser result:", result);
      } catch (err) {
        console.error("🔴 refetchUser error:", err);
      } finally {
        router.replace("/", { scroll: false });
      }
    };

    run();
  }, [searchParams]);

  return null;
}