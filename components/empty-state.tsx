import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  href = "/add",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: string;
  href?: string;
}) {
  return (
    <section className="px-5 sm:px-8">
      <div className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed border-[#c9cbc2] bg-[rgba(255,254,250,0.7)] p-8 text-center">
        <div>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon size={24} />
          </span>
          <h2 className="mt-5 text-xl font-semibold">{title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{body}</p>
          {action ? (
            <Link
              href={href}
              className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
            >
              {action}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
