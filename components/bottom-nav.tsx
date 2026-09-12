"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Plus, RotateCcw, UserRound } from "lucide-react";

const items = [
  { href: "/today", label: "Today", icon: CalendarDays, primary: false },
  { href: "/words", label: "Words", icon: BookOpen, primary: false },
  { href: "/add", label: "Add", icon: Plus, primary: true },
  { href: "/review", label: "Review", icon: RotateCcw, primary: false },
  { href: "/me", label: "Me", icon: UserRound, primary: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[rgba(255,254,250,0.94)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto grid h-20 max-w-3xl grid-cols-5 items-center px-3">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-colors ${
                active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              <span
                className={`grid place-items-center ${
                  primary
                    ? "-mt-7 size-14 rounded-full bg-[var(--accent)] text-white shadow-[0_8px_24px_rgba(49,92,66,0.3)] group-active:scale-95"
                    : "size-7"
                }`}
              >
                <Icon size={primary ? 28 : 21} strokeWidth={primary ? 2.2 : 1.9} />
              </span>
              <span className={primary ? "mt-0.5" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
