"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, ClipboardList, DoorOpen, FileAudio, GraduationCap, HelpCircle, History, LayoutGrid,
  Image as ImageIcon, Menu, PanelLeftClose, PanelLeftOpen, PenLine, Sliders, User, Users, X, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";

export type NavItem = {
  href: string;
  label: string;
};

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Administrator",
};

/** Icons are picked from the label so every role's nav gets one without changing NavItem. */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/dashboard|overview|home/i, LayoutGrid],
  [/mock/i, ClipboardList],
  [/test|practice/i, PenLine],
  [/history|result/i, History],
  [/profile/i, User],
  [/class/i, GraduationCap],
  [/user|student/i, Users],
  [/passage/i, BookOpen],
  [/audio/i, FileAudio],
  [/media|image/i, ImageIcon],
  [/question/i, HelpCircle],
  [/band|conversion/i, Sliders],
];
function iconFor(label: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(label))?.[1] ?? DoorOpen;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function NavList({
  navItems, pathname, collapsed, onNavigate,
}: { navItems: NavItem[]; pathname: string | null; collapsed: boolean; onNavigate?: () => void }) {
  // Highest-specificity match wins so "/student" is not lit up on "/student/tests".
  const best = navItems
    .filter((i) => pathname === i.href || pathname?.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return (
    <nav aria-label="Primary" className="flex-1 space-y-1.5 p-3">
      {navItems.map((item) => {
        const Icon = iconFor(item.label);
        const isActive = best?.href === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={isActive ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors",
              collapsed && "justify-center px-0",
              isActive ? "bg-accent-soft/70 text-foreground" : "text-muted hover:bg-ink-soft hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-accent")} strokeWidth={1.8} />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {isActive && <span aria-hidden className="absolute right-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ role, userName, orgName, collapsed }: { role: string; userName: string; orgName: string; collapsed: boolean }) {
  return (
    <div className="border-t border-border">
      {!collapsed && (
        <div className="m-3 rounded-xl border border-accent/20 bg-accent-soft/50 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent" />{ROLE_LABEL[role]} space
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">{orgName}</p>
        </div>
      )}
      <div className={cn("flex items-center gap-2.5 p-4", collapsed && "justify-center px-2")}>
        <span title={collapsed ? userName : undefined} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
          {initials(userName)}
        </span>
        {!collapsed && <p className="min-w-0 truncate text-sm font-semibold text-foreground">{userName}</p>}
      </div>
    </div>
  );
}

export function DashboardShell({
  navItems,
  role,
  userName,
  orgName,
  children,
}: {
  navItems: NavItem[];
  role: "STUDENT" | "TEACHER" | "ADMIN";
  userName: string;
  orgName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggle = () => setCollapsed((c) => !c);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-300 md:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed ? "justify-center" : "justify-between")}>
          {collapsed ? null : <Logo />}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink-soft hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        <NavList navItems={navItems} pathname={pathname} collapsed={collapsed} />
        <SidebarFooter role={role} userName={userName} orgName={orgName} collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-lift">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Logo />
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-ink-soft"><X className="h-5 w-5" /></button>
            </div>
            <NavList navItems={navItems} pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter role={role} userName={userName} orgName={orgName} collapsed={false} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <button type="button" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-ink-soft"><Menu className="h-5 w-5" /></button>
            <LogoMark className="h-7 w-7" />
          </div>
          <span className="hidden truncate text-sm font-medium text-muted md:block">{orgName}</span>
          <SignOutButton />
        </header>
        <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
