# ILEARN Spaces: Frontend

The web app for the IELTS practice platform: landing page, sign-in, student dashboard and exam player, teacher classes, and an admin area for building tests.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zod. The backend lives in `../backend`; see `../backend/README.md`.

---

## How it works

The frontend **never talks to the database**. In `next.config.ts`, every `/api/*` and `/uploads/*` request is proxied to the backend (`BACKEND_URL`). To the browser everything is one origin, so the backend's httpOnly login cookie works without any CORS setup.

`proxy.ts` (Next 16's replacement for middleware) checks the login cookie with `AUTH_SECRET` and redirects people away from `/student`, `/teacher`, `/admin` and `/exam` when they are not signed in. The backend still re-checks every request.

```
app/            routes: / (landing), login, register, forgot-password,
                student/*, teacher/*, admin/*, exam/[attemptId]
components/     landing, ui, dashboard, exam, admin, teacher, questions, auth
lib/            api.ts (browser fetch), server-api.ts (server fetch), auth-guard.ts
proxy.ts        route protection
next.config.ts  the /api and /uploads proxy rewrites
netlify.toml    Netlify build settings
```

The landing page styling is self-contained in `components/landing/` (scoped under the `.lp` class), so it does not affect the app screens.

## Environment variables

| Variable | What it is |
|---|---|
| `BACKEND_URL` | Base URL of the API, e.g. `https://ielts-api.onrender.com` (no trailing slash). **Needed at build time and runtime**: the proxy rules are baked in at build, so changing it means redeploying |
| `AUTH_SECRET` | Must be **identical** to the backend's `AUTH_SECRET` |

For local work copy `.env.example` to `.env`.

## Run locally

```bash
# 1. start the backend first (see ../backend/README.md), then:
npm install
cp .env.example .env     # BACKEND_URL=http://localhost:4000, AUTH_SECRET=<same as backend>
npm run dev              # http://localhost:3000
```

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / run it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Deploy to Netlify

**Deploy the backend first** (you need its Render URL) and have the same `AUTH_SECRET` value ready.

1. Netlify, **Add new site**, **Import an existing project**, choose your Git repo.
2. Build settings:

   | Field | Value |
   |---|---|
   | Base directory | `frontend` |
   | Build command | `npm run build` |
   | Publish directory | leave as detected (`netlify.toml` sets `.next`) |

   Netlify detects Next.js and applies its runtime automatically; no plugin is needed.
3. **Before the first deploy**, open **Site configuration, Environment variables** and add both (leave all scopes ticked):
   ```
   BACKEND_URL=https://<your-service>.onrender.com
   AUTH_SECRET=<same value as on Render>
   ```
4. Click **Deploy**. Copy the resulting `https://<name>.netlify.app` URL.
5. On Render, set `FRONTEND_ORIGIN` to that URL.
6. Test: open the site, register a student, sign in, then sign in as the admin and upload an audio file.

Later changes to either variable need a new deploy (**Deploys, Trigger deploy, Clear cache and deploy site**).

### The 26-second proxy limit (and why it no longer matters for submits)

Netlify cuts proxied requests off after **26 seconds**. Submitting a test used to wait for AI scoring and could hit that. It no longer does: the backend answers the submit at once and scores Writing/Speaking in the background, and the results page refreshes itself until the bands arrive.

What can still reach 26 seconds is the **first request after a free Render instance has been asleep**. Use Render's Starter plan to keep the API awake.

### Alternative: host the frontend on Render

Render dashboard, **New +, Web Service**, same repo:

| Field | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Environment | `BACKEND_URL`, `AUTH_SECRET`, `NODE_VERSION=20` |

Then use this service's URL as `FRONTEND_ORIGIN` on the backend. This is optional now; `next.config.ts` also sets `experimental.proxyTimeout` to 120 seconds for this mode.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `next dev` crashes with `Cannot find module '@vercel/turbopack/postcss'` (often on Windows) | A known Turbopack 16.3 PostCSS problem, not your code. Stop the dev server, delete the `.next` folder, run `npm run dev` again. If it persists, use **`npm run dev:webpack`** (same app, webpack instead of Turbopack). If the *Netlify build* ever shows it, set the build command to `npm run build:webpack` |
| Every API call fails or 404s | `BACKEND_URL` missing or wrong at **build** time; fix it and redeploy |
| Redirected to login right after signing in | `AUTH_SECRET` differs from the backend's |
| Sign-up says "No organization is configured" | Create the admin on the backend (`db:create-admin`) |
| Sign-up or sign-in says "We can't reach the server right now" | The frontend can't reach the backend: start it, check it answers at `<BACKEND_URL>/health`, and make sure `BACKEND_URL` is right (changing it needs a restart in dev, a redeploy on Netlify) |
| Results stay on "Scoring in progress…" | The backend job is still running or the backend restarted; after about a minute it flips to "failed" with a Retry button |
| Writing/Speaking say "Not scored yet" | AI scoring is off on the backend (no `OPENAI_API_KEY`); see the backend README |
| Audio does not load | Check `/uploads/...` opens through the site and that the backend has `STORAGE_*` set |
