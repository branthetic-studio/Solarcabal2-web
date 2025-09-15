export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward authorization headers if needed
          ...(request.headers.get("authorization") && {
            Authorization: request.headers.get("authorization"),
          }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        errors: [{ message: "Failed to fetch from GraphQL endpoint" }],
      },
      { status: 500 }
    );
  }
}
