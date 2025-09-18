import { createLogoutResponse } from "@/lib/middleware";

export async function POST() {
  return createLogoutResponse();
}
