import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * This middleware is the FIRST line of defense, not the only one.
 * Every server action and route handler underneath also re-checks role
 * server-side (see lib/auth-guard.ts) because middleware alone would
 * violate §4's "do not rely only on frontend route protection" — a
 * redirect here is a UX nicety, the guard in the handler is what actually
 * protects the data.
 *
 * It only verifies the JWT cookie issued by the backend (shared AUTH_SECRET);
 * the backend re-checks the role on every API call.
 */

const AUTH_COOKIE = "ielts_token";

async function readRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET ?? ""));
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student",
  TEACHER: "/teacher",
  ADMIN: "/admin",
};

function roleForPath(pathname: string): "STUDENT" | "TEACHER" | "ADMIN" | null {
  if (pathname.startsWith("/student")) return "STUDENT";
  if (pathname.startsWith("/exam")) return "STUDENT";
  if (pathname.startsWith("/teacher")) return "TEACHER";
  if (pathname.startsWith("/admin")) return "ADMIN";
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = roleForPath(pathname);
  if (!requiredRole) return NextResponse.next();

  const role = await readRole(request);

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role !== requiredRole) {
    const home = ROLE_HOME[role] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*", "/exam/:path*"],
};
