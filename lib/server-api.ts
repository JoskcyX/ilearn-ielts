import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

/**
 * Server-component data fetching. Forwards the user's auth cookie to the
 * backend, which is the only thing that touches the database.
 *  - 401 -> /login   - 403 -> that user's role home   - 404 -> notFound()
 */
export async function serverFetch<T>(path: string): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/login");
  if (res.status === 403) {
    const me = await fetch(`${BACKEND_URL}/api/auth/me`, { headers: { cookie: cookieHeader }, cache: "no-store" });
    if (me.ok) {
      const { user } = await me.json();
      redirect(roleHomePath(user.role));
    }
    redirect("/login");
  }
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Backend ${path} failed with ${res.status}`);
  return (await res.json()) as T;
}

export function roleHomePath(role: "STUDENT" | "TEACHER" | "ADMIN"): string {
  return role === "STUDENT" ? "/student" : role === "TEACHER" ? "/teacher" : "/admin";
}
