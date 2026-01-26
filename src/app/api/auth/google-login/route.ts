export async function POST(req: Request) {
  const { token } = await req.json();

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

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
          provider: "google",
          token,
        },
      },
    }),
  });

  return Response.json(await res.json());
}
