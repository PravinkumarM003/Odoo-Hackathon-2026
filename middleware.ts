import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "./lib/auth";

const PUBLIC_PATHS = ["/signin", "/signup", "/api/auth/signin", "/api/auth/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    // Redirect to signin for page routes, 401 for API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Block employees from HR pages
  if (pathname.startsWith("/hr") && session.role !== "HR") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
