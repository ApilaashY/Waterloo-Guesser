import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user");

  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  const userRequest = await fetch(
    `https://graph.microsoft.com/v1.0/users/${userId}@uwaterloo.ca?$select=mail,department`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );
  const retrievedUserData = await userRequest.json();
  const userData = {
    email: retrievedUserData.mail,
    department: (retrievedUserData.department ?? "")
      .split(" ")[0]
      .split("/")[1],
  };

  if (retrievedUserData.error) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  console.log(userData);

  return new Response(JSON.stringify(userData), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}
