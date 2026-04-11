import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward incoming cookies + auth header
    const incomingCookies = request.headers.get("cookie") ?? "";
    const authHeader = request.headers.get("authorization");

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    if (incomingCookies) {
      headers.set("Cookie", incomingCookies);
    }

    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    // Call your Vendure backend
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      credentials: "include", // 🔥 important
    });

    // Parse response safely
    let data: unknown;
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("❌ Vendure returned non-JSON:", text);
      data = { errors: [{ message: text || "Upstream error" }] };
    }

    if (!response.ok) {
      console.error(
        "❌ Vendure error:",
        response.status,
        JSON.stringify(data, null, 2)
      );
    }

    // Create Next response
    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // 🔥 CRITICAL FIX: Forward ALL cookies correctly
    // Works in modern Node / Next
    const setCookies = (response.headers as any).getSetCookie?.();

    if (setCookies && setCookies.length > 0) {
      setCookies.forEach((cookie: string) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    } else {
      // 🔁 Fallback (older environments)
      const raw = response.headers.get("set-cookie");

      if (raw) {
        raw.split(/,(?=\s*\w+=)/).forEach((cookie) => {
          nextResponse.headers.append("Set-Cookie", cookie);
        });
      }
    }

    return nextResponse;
  } catch (error: any) {
    console.error("🔥 GraphQL Proxy Error:", error);

    return NextResponse.json(
      {
        errors: [
          {
            message:
              error?.message ||
              "Failed to fetch from GraphQL endpoint",
          },
        ],
      },
      { status: 500 }
    );
  }
}

// ✅ Handle OPTIONS (CORS / preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}