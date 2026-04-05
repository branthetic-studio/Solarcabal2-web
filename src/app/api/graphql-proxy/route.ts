import { NextRequest, NextResponse } from "next/server";

// app/api/graphql/route.ts

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const cookies = request.headers.get("cookie") ?? "";
    const auth = request.headers.get("authorization");

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (cookies) headers.set("Cookie", cookies);
    if (auth) headers.set("Authorization", auth);

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    // ✅ Always try to parse and forward the real Vendure response,
    //    even on 4xx/5xx — this exposes the actual error message
    let data: unknown;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Non-JSON body (rare) — capture as text so you can read it
      const text = await response.text();
      console.error("Vendure non-JSON response:", text);
      data = { errors: [{ message: text || "Upstream error" }] };
    }

    // ✅ Log when Vendure itself returns an error status
    if (!response.ok) {
      console.error("Vendure error status:", response.status, JSON.stringify(data));
    }

    const nextResponse = NextResponse.json(data, { status: response.status });

    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("Set-Cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    // ✅ Log the full error so you can actually debug it
    console.error("GraphQL Proxy Error:", error);
    return NextResponse.json(
      { errors: [{ message: "Failed to fetch from GraphQL endpoint" }] },
      { status: 500 }
    );
  }
}

// ✅ Handle OPTIONS for CORS preflight if needed
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