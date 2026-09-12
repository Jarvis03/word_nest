import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function TodayPage() {
  return (
    <>
      <PageHeader eyebrow="Good evening" title="Today" description="A calm place for the English you want to keep." />
      <section className="px-5 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--accent)] p-7 text-white shadow-[0_22px_60px_rgba(49,92,66,0.18)]">
          <Sparkles className="mb-8 text-[#b9d4bd]" />
          <p className="text-sm font-semibold text-[#dce9de]">Words to review</p>
          <p className="mt-1 text-6xl font-semibold tracking-[-0.06em]">0</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#dce9de]">
            Your first saved word will arrive here the following day.
          </p>
          <Link
            href="/add"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[var(--accent)]"
          >
            Add your first word <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["Difficult words", "Nothing here yet"],
            ["Recently added", "Your new words will appear here"],
          ].map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-5 text-sm text-[var(--muted)]">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
