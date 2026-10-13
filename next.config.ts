import type { NextConfig } from "next";

/**
 * The frontend never talks to the database. Every `/api/*` request (and
 * uploaded media under `/uploads/*`) is proxied to the standalone backend,
 * so the browser sees a single origin and the backend's httpOnly auth
 * cookie "just works" without any CORS dance.
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  experimental: {
    // Only used when you run `next start` yourself (e.g. on Render). Next's built-in proxy
    // gives up after 30s by default, which is too short for AI scoring on exam submit.
    // Netlify ignores this: its own proxy limit is a fixed 26s (see README).
    proxyTimeout: 120_000,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
