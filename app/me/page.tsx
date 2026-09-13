import { PageHeader } from "@/components/page-header";
import { LearningProfileForm } from "@/components/learning-profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { learningProfileSchema } from "@/lib/learning-profile-schema";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
  const supabase = await createClient();
  const [{ data: authData }, { count: wordCount }, { count: masteredCount }, { data: storedProfile }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("words").select("id", { count: "exact", head: true }),
    supabase
      .from("word_memory")
      .select("word_id", { count: "exact", head: true })
      .gte("reps", 3)
      .gte("stability", 30),
    supabase.from("profiles").select("learning_profile, voice_name, playback_rate").maybeSingle(),
  ]);
  const profile = learningProfileSchema.parse(storedProfile?.learning_profile ?? {});

  return (
    <>
      <PageHeader eyebrow="Your learning" title="Me" description="A small view of steady progress." />
      <section className="grid gap-4 px-5 sm:grid-cols-3 sm:px-8">
        {[
          ["Words", wordCount ?? 0],
          ["Mastered", masteredCount ?? 0],
          ["Difficult", 0],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{value}</p>
          </article>
        ))}
      </section>
      <LearningProfileForm
        initialProfile={profile}
        initialVoiceName={storedProfile?.voice_name ?? null}
        initialPlaybackRate={Number(storedProfile?.playback_rate ?? 0.92)}
      />
      <section className="mx-5 mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:mx-8">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{String(authData?.claims?.email ?? "Signed in")}</p>
        <SignOutButton />
      </section>
    </>
  );
}
