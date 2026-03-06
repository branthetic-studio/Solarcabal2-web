export async function POST(req: Request) {
  const { token } = await req.json();

  // ✅ Log 1 — confirm token arrived from NextAuth
  console.log(
    "📥 Token received:",
    token ? `${token.substring(0, 30)}...` : "❌ MISSING",
  );

  const vendureRes = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation Authenticate($input: AuthenticationInput!) {
          authenticate(input: $input) {
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
      `,
      variables: {
        input: {
          google: { token },
        },
      },
    }),
  });

  const data = await vendureRes.json();

  // ✅ Log 2 — see exactly what Vendure responds with
  console.log("📤 Vendure raw response:", JSON.stringify(data, null, 2));

  const result = data?.data?.authenticate;

  if (!result || result.errorCode) {
    return Response.json(
      { error: result?.message ?? "Authentication failed" },
      { status: 401 },
    );
  }

  const setCookie = vendureRes.headers.get("set-cookie");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (setCookie) headers.set("set-cookie", setCookie);

  return new Response(JSON.stringify({ user: result }), {
    status: 200,
    headers,
  });
}
