import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { type SessionData, getSessionOptions } from "@/lib/session";

function isAdminApiRoute(pathname: string, method: string) {
  if (pathname === "/api/bookings" && method === "GET") return true;
  if (pathname.startsWith("/api/bookings/") && method !== "GET") return true;
  if (pathname.startsWith("/api/upload")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  let session: SessionData;

  try {
    session = await getIronSession<SessionData>(request, response, getSessionOptions());
  } catch {
    if (pathname.startsWith("/admin") || isAdminApiRoute(pathname, request.method)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const isLoggedIn = Boolean(session.isLoggedIn);

  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminApiRoute(pathname, request.method) && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return response;
}

export { proxy as middleware };

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/api/bookings",
    "/api/bookings/:path*",
    "/api/upload",
    "/api/upload/:path*",
  ],
};
