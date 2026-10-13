import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverFetch, roleHomePath } from "@/lib/server-api";

export type AppRole = "STUDENT" | "TEACHER" | "ADMIN";

export type SessionUser = {
  id: string;
  role: AppRole;
  organizationId: string;
  organizationName: string | null;
  email: string;
  name: string;
};

/** Current user from the backend (redirects to /login if signed out). */
export const requireUser = cache(async (): Promise<SessionUser> => {
  const { user } = await serverFetch<{ user: SessionUser }>("/api/auth/me");
  return user;
});

export async function requireRole(role: AppRole | AppRole[]): Promise<SessionUser> {
  const user = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) redirect(roleHomePath(user.role));
  return user;
}

export function roleHome(role: AppRole): string {
  return roleHomePath(role);
}

/** For public pages (landing): the signed-in user, or null. Never redirects. */
export async function getOptionalUser(): Promise<SessionUser | null> {
  const { cookies } = await import("next/headers");
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;
  const res = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:4000"}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json()).user as SessionUser;
}
