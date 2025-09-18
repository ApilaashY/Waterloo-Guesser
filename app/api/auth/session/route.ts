import { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { isAuthenticated, user, error } = await verifySession(request);

  if (isAuthenticated && user) {
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          ref: user.ref,
          email: user.email,
          username: user.username,
          department: user.department,
          waterlooUsername: user.waterlooUsername,
        },
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } else {
    return new Response(
      JSON.stringify({
        error: error || 'Not authenticated',
      }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
