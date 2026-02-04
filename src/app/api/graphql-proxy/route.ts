import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ✅ Get cookies + auth from the incoming request
    const cookies = request.headers.get("cookie") ?? "";
    const auth = request.headers.get("authorization");

    // ✅ Build headers safely (no nulls)
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (cookies) headers.set("Cookie", cookies);
    if (auth) headers.set("Authorization", auth);

    const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      // ✅ NOTE: credentials: "include" removed (server-to-server fetch doesn’t use it)
    });

    const data = await response.json();

    // ✅ Create response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // ✅ Forward Set-Cookie headers back to client
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("Set-Cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("GraphQL Proxy Error:", error);
    return NextResponse.json(
      {
        errors: [{ message: "Failed to fetch from GraphQL endpoint" }],
      },
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