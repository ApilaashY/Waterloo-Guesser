export async function GET(request: Request) {
  const userId = request.headers.get("user");
  if (!userId) {
    return new Response("User ID is required", { status: 400 });
  }

  console.log(process.env.ACCESS_TOKEN);

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
    department: retrievedUserData.department,
  };

  if (!userData) {
    return new Response("User not found", { status: 404 });
  }

  console.log(userData);

  return new Response(JSON.stringify(userData), {
    headers: { "Content-Type": "application/json" },
  });
}
