import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** Original flat-shape composition for the auth side panel. */
function ShapePanel() {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <rect width="400" height="600" fill="#f6efe2" />
      {/* plum half-disc rising from the bottom-left */}
      <path d="M-40 600a150 150 0 0 1 300 0Z" fill="#5b3a8e" />
      <circle cx="110" cy="600" r="48" fill="#f6efe2" />
      {/* teal doorway arch, top-right, echoing the logo */}
      <path d="M230 250V130a90 90 0 0 1 180 0v120Z" fill="#0e8479" />
      <path d="M290 250v-60a30 30 0 0 1 60 0v60Z" fill="#f6efe2" />
      {/* chartreuse scalloped flower */}
      <g transform="translate(95 150)" fill="#d4e84a">
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={Math.cos((i * Math.PI) / 4) * 46} cy={Math.sin((i * Math.PI) / 4) * 46} r="34" />
        ))}
        <circle r="46" />
      </g>
      <circle cx="95" cy="150" r="16" fill="#16213a" />
      {/* persimmon tilted square */}
      <rect x="250" y="360" width="150" height="150" rx="28" transform="rotate(14 325 435)" fill="#ee6c4d" />
      {/* peach stripes */}
      <g fill="#f6b9a4">
        {[0, 1, 2, 3].map((i) => (<rect key={i} x={40 + i * 26} y="290" width="14" height="90" rx="7" />))}
      </g>
      <circle cx="350" cy="320" r="14" fill="#16213a" />
    </svg>
  );
}

export function AuthShell({
  mode,
  children,
  title,
  subtitle,
}: {
  mode: "login" | "register" | "other";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-12">
        <Link href="/" aria-label="ILEARN Spaces home"><Logo /></Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          {mode !== "login" && <Link href="/login" className="text-foreground hover:text-brand">Log in</Link>}
          {mode !== "register" && (
            <Link href="/register" className="rounded-full bg-brand px-5 py-2.5 text-white transition-transform hover:-translate-y-0.5">Try it for free</Link>
          )}
        </nav>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8 md:py-14">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-lift md:grid-cols-2">
          <div className="p-6 sm:p-9">
            <h1 className="text-center text-3xl font-extrabold">{title}</h1>
            <p className="mt-1 text-center text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <div className="hidden min-h-[480px] md:block"><ShapePanel /></div>
        </div>
      </main>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-sm text-muted">
      <span className="h-px flex-1 bg-border" />Or continue with<span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleButton() {
  return (
    <button
      type="button"
      disabled
      title="Google sign-in is coming soon"
      className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground/60"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-70" aria-hidden="true">
        <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.700 3.3-8.100Z" />
        <path fill="#34A853" d="M12 23c3 0 5.500-1 7.300-2.700l-3.500-2.700c-1 .7-2.200 1-3.800 1-2.900 0-5.400-2-6.300-4.600H2.100v2.800A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.700 14c-.2-.7-.4-1.300-.4-2s.1-1.400.4-2V7.200H2.100a11 11 0 0 0 0 9.600L5.700 14Z" />
        <path fill="#EA4335" d="M12 5.400c1.600 0 3.100.6 4.200 1.700l3.100-3.100A11 11 0 0 0 2.100 7.200L5.700 10c.9-2.600 3.400-4.600 6.300-4.600Z" />
      </svg>
      Google <span className="font-normal">(coming soon)</span>
    </button>
  );
}
