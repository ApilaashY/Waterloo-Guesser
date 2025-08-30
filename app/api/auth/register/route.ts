import { getDb } from "@/lib/mongodb";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Extract request data
  let {
    username,
    email,
    department,
    password,
    confirmPassword,
  }: {
    username: string;
    email: string;
    department: string;
    password: string;
    confirmPassword: string;
  } = await request.json();

  // trim all fields
  username = username.trim();
  email = email.trim();
  department = department.trim();
  password = password.trim();
  confirmPassword = confirmPassword.trim();

  // Validate request data
  if (!username || !email || !department || !password || !confirmPassword) {
    return new Response(
      JSON.stringify({
        message: "All fields are required",
      }),
      { status: 400 }
    );
  }

  // Check if username is valid
  if (username.length < 3 || username.length > 20) {
    return new Response(
      JSON.stringify({
        message: "Username must be between 3 and 20 characters",
      }),
      { status: 400 }
    );
  }

  // Check if email is valid
  if (!email.includes("@") || !email.includes(".")) {
    return new Response(
      JSON.stringify({
        message: "Invalid email",
      }),
      { status: 400 }
    );
  }

  // Check if department is valid
  if (
    ![
      "art",
      "engineering",
      "environment",
      "health",
      "mathematics",
      "science",
      "other",
    ].includes(department)
  ) {
    return new Response(
      JSON.stringify({
        message: "Department is invalid",
      }),
      { status: 400 }
    );
  }

  // Check if password is valid
  if (password.length < 8) {
    return new Response(
      JSON.stringify({
        message: "Password must be at least 8 characters",
      }),
      { status: 400 }
    );
  }

  // Check if confirm password is valid
  if (confirmPassword !== password) {
    return new Response(
      JSON.stringify({
        message: "Passwords do not match",
      }),
      { status: 400 }
    );
  }

  // Get accounts with current email
  const db = await getDb();
  const user = await db
    .collection("users")
    .findOne({ email: email.toLowerCase(), password: password.toLowerCase() });

  console.log(user);
  // Check if user already exists
  if (user) {
    return new Response(
      JSON.stringify({
        message: "User already exists",
      }),
      { status: 401 }
    );
  }

  // Create new user account
  const newUser = await db.collection("users").insertOne({
    username,
    email: email.toLowerCase(),
    department,
    password: password.toLowerCase(),
  });
  const newUserRef = await db.collection("user_refs").insertOne({
    user: newUser.insertedId.toString(),
  });

  return new Response(
    JSON.stringify({
      message: `Login successful, Hello ${username}`,
      user: {
        ref: newUserRef.insertedId.toString(),
        id: newUser.insertedId.toString(),
        email: email,
        username: username,
        department: department,
      },
    }),
    { status: 200 }
  );
}
