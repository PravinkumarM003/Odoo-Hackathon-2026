import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, SessionPayload } from "./auth";

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number
  ) {
    super(message);
  }
}

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// ─── Server Guards ────────────────────────────────────────────────────────────

export async function requireAuth(req: NextRequest): Promise<SessionPayload> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    throw new ApiError("Unauthorized — please sign in", 401);
  }
  return session;
}

export async function requireRole(
  req: NextRequest,
  role: "HR" | "EMPLOYEE"
): Promise<SessionPayload> {
  const session = await requireAuth(req);
  if (session.role !== role) {
    throw new ApiError(`Forbidden — requires ${role} role`, 403);
  }
  return session;
}

export async function requireHR(req: NextRequest): Promise<SessionPayload> {
  return requireRole(req, "HR");
}

export async function requireOwnerOrHR(
  req: NextRequest,
  targetEmployeeId: string
): Promise<SessionPayload> {
  const session = await requireAuth(req);
  if (session.role !== "HR" && session.userId !== targetEmployeeId) {
    throw new ApiError("Forbidden — you can only access your own data", 403);
  }
  return session;
}

// ─── Route Handler Wrapper ─────────────────────────────────────────────────────

type RouteHandler = (
  req: NextRequest,
  ctx: { params?: Record<string, string> }
) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return apiError(error.message, error.status);
      }
      console.error("Unhandled API error:", error);
      return apiError("Internal server error", 500);
    }
  };
}
