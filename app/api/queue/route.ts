// app/api/queue/route.ts
import { NextRequest } from "next/server";

// In-memory queue for demo purposes (use Redis or DB for production)
const queue: { sessionId: string; partnerId?: string }[] = [];

function generateSessionId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  // Create a new session and add to queue
  const sessionId = generateSessionId();
  queue.push({ sessionId });
  return new Response(JSON.stringify({ sessionId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Missing sessionId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Find self in queue
  const self = queue.find((q) => q.sessionId === sessionId);
  if (!self) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Try to find a partner
  if (self.partnerId) {
    return new Response(JSON.stringify({ partnerId: self.partnerId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Find another waiting user
  const other = queue.find((q) => q.sessionId !== sessionId && !q.partnerId);
  if (other) {
    // Pair them
    self.partnerId = other.sessionId;
    other.partnerId = self.sessionId;
    return new Response(JSON.stringify({ partnerId: other.sessionId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  // No partner yet
  return new Response(JSON.stringify({ partnerId: null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
