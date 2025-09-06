import { getDb } from "@/lib/mongodb";
import { NextRequest } from "next/server";
import { generateSessionToken } from "@/lib/auth";
import { createAuthResponse } from "@/lib/middleware";

export async function POST(request: NextRequest) {
  const { email, password }: { email: string; password: string } =
    await request.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({
        message: "Email and password are required",
      }),
      { status: 400 }
    );
  }

  const db = await getDb();
  const user = await db
    .collection("users")
    .findOne({ email: email.toLowerCase(), password: password.toLowerCase() });

  console.log(user);

  if (!user) {
    return new Response(
      JSON.stringify({
        message: "Invalid email or password",
      }),
      { status: 401 }
    );
  }

  console.log(user._id.toString());

  const ref = await db
    .collection("user_refs")
    .findOne({ user: user._id.toString() });

  if (!ref) {
    return new Response(
      JSON.stringify({
        message: "Internal Cookie Error",
      }),
      { status: 401 }
    );
  }

  // Generate PASETO session token
  const userData = {
    ref: ref._id.toString(),
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    department: user.department,
  };

  try {
    const sessionToken = await generateSessionToken(userData);
    
    return createAuthResponse({
      message: `Login successful, Hello ${user.username}`,
      user: userData,
    }, sessionToken);
  } catch (error) {
    console.error('Error generating session token:', error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}
