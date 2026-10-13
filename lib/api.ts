/**
 * Browser-side API client. Calls go to same-origin `/api/*`, which
 * next.config.ts proxies to the backend; the httpOnly auth cookie rides along.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string, public issues?: unknown) {
    super(message);
  }
}

const SERVER_UNREACHABLE = "We can't reach the server right now. Please try again in a moment.";
const DEV_HINT =
  process.env.NODE_ENV !== "production" ? " (Developer hint: is the backend running, and does BACKEND_URL point to it?)" : "";

/**
 * Message for a failed response. The backend always answers errors with
 * `{ error }`, so prefer that. A 5xx with no such body means the request never
 * reached the backend (the Next.js proxy answers with a bare 500 when the
 * backend is down), which deserves a clear message rather than a vague one.
 */
export function errorMessageFor(status: number, data: { error?: unknown } | null): string {
  if (typeof data?.error === "string" && data.error) return data.error;
  if (status >= 500) return SERVER_UNREACHABLE + DEV_HINT;
  return "Request failed. Please try again.";
}

async function parse(res: Response) {
  const data = await res.json().catch(() => null);
  return data;
}

/** JSON request. Throws ApiError on non-2xx. */
export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "same-origin",
  });
  const data = await parse(res);
  if (!res.ok) throw new ApiError(res.status, errorMessageFor(res.status, data), data?.issues);
  return data as T;
}

/** multipart/form-data upload (audio, speaking recordings). */
export async function apiForm<T = unknown>(path: string, formData: FormData, method = "POST"): Promise<T> {
  const res = await fetch(path, { method, body: formData, credentials: "same-origin" });
  const data = await parse(res);
  if (!res.ok) throw new ApiError(res.status, errorMessageFor(res.status, data), data?.issues);
  return data as T;
}

/**
 * Same result shape the old server actions used: `{ success: true, ... }`
 * or `{ success: false, error }`. Never throws, so existing component
 * code that branches on `result.success` keeps working.
 */
export type ActionResult<T = object> = ({ success: true } & T) | { success: false; error: string };

export async function call<T = object>(
  path: string,
  options: { method?: string; body?: unknown; form?: FormData } = {}
): Promise<ActionResult<T>> {
  try {
    const data = options.form
      ? await apiForm<Record<string, unknown>>(path, options.form, options.method)
      : await api<Record<string, unknown>>(path, { method: options.method, body: options.body });
    return { success: true, ...(data as object) } as ActionResult<T>;
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.message };
    return { success: false, error: "Network error. Please try again." };
  }
}
