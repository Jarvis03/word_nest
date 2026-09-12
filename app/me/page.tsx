import { PageHeader } from "@/components/page-header";

export default function MePage() {
  return (
    <>
      <PageHeader eyebrow="Your learning" title="Me" description="A small view of steady progress." />
      <section className="grid gap-4 px-5 sm:grid-cols-3 sm:px-8">
        {[
          ["Words", "0"],
          ["Mastered", "0"],
          ["Difficult", "0"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{value}</p>
          </article>
        ))}
      </section>
      <section className="mx-5 mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:mx-8">
        <h2 className="font-semibold">Settings</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Voice, playback speed, learning profile, and account settings will connect here.
        </p>
      </section>
    </>
  );
}
