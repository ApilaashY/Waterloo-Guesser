import { NextRequest, NextResponse } from "next/server";
import { verifySession, SessionPayload } from "./auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: SessionPayload;
}

/**
 * Middleware to authenticate API routes
 * Use this to protect API endpoints that require authentication
 */
export async function withAuth<T extends any[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  options: {
    required?: boolean;
    roles?: string[];
  } = { required: true }
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const { isAuthenticated, user, error } = await verifySession(req);

    if (options.required && !isAuthenticated) {
      return NextResponse.json(
        { error: error || "Authentication required" },
        { status: 401 }
      );
    }

    if (options.roles && user && !options.roles.includes(user.department)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Add user to request object
    const authenticatedReq = req as AuthenticatedRequest;
    if (user) {
      authenticatedReq.user = user;
    }

    return handler(authenticatedReq, ...args);
  };
}

/**
 * Simple authentication check for API routes
 * Returns user data if authenticated, null otherwise
 */
export async function getAuthenticatedUser(
  req: NextRequest
): Promise<SessionPayload | null> {
  const { isAuthenticated, user } = await verifySession(req);
  return isAuthenticated ? user : null;
}

/**
 * Require authentication for API routes
 * Throws an error if not authenticated
 */
export async function requireAuth(req: NextRequest): Promise<SessionPayload> {
  const { isAuthenticated, user, error } = await verifySession(req);

  if (!isAuthenticated || !user) {
    throw new Error(error || "Authentication required");
  }

  return user;
}

/**
 * Check if user has required permissions
 */
export function hasPermission(
  user: SessionPayload,
  requiredDepartment?: string
): boolean {
  if (!requiredDepartment) return true;
  return user.department === requiredDepartment;
}

/**
 * Create authentication response with token
 */
export function createAuthResponse(
  data: any,
  token: string,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });

  // Set secure HTTP-only cookie
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
}

/**
 * Create logout response
 */
export function createLogoutResponse(): NextResponse {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the session cookie
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
