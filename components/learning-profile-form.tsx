"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Play, Save } from "lucide-react";
import type { LearningProfile } from "@/lib/learning-profile-schema";
import { saveSpeechPreferences, speakEnglish } from "@/lib/speech";

function lines(value: string) {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

export function LearningProfileForm({
  initialProfile,
  initialVoiceName,
  initialPlaybackRate,
}: {
  initialProfile: LearningProfile;
  initialVoiceName: string | null;
  initialPlaybackRate: number;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [voiceName, setVoiceName] = useState(initialVoiceName ?? "");
  const [playbackRate, setPlaybackRate] = useState(initialPlaybackRate);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveSpeechPreferences(initialVoiceName, initialPlaybackRate);
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en")));
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [initialPlaybackRate, initialVoiceName]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningProfile: profile, voiceName: voiceName || null, playbackRate }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to save your profile.");
      saveSpeechPreferences(voiceName || null, playbackRate);
      setMessage("Learning profile saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-5 mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:mx-8">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-semibold">Your learning profile</h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">Recommendations, examples and listening material will follow these preferences.</p></div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">Personal</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextList label="Main goals" value={profile.primaryUseCases.join(", ")} onChange={(value) => setProfile({ ...profile, primaryUseCases: lines(value) })} placeholder="workplace English, travel" />
        <TextList label="Topics you care about" value={profile.interests.join(", ")} onChange={(value) => setProfile({ ...profile, interests: lines(value) })} placeholder="AI, retail, technology" />
        <label className="block"><FieldLabel>English level</FieldLabel><select value={profile.explanationLevel} onChange={(event) => setProfile({ ...profile, explanationLevel: event.target.value as LearningProfile["explanationLevel"] })} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
        <label className="block"><FieldLabel>Listening focus</FieldLabel><select value={profile.listeningFocus} onChange={(event) => setProfile({ ...profile, listeningFocus: event.target.value as LearningProfile["listeningFocus"] })} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"><option value="daily">Daily conversation</option><option value="workplace">Workplace</option><option value="news">News</option><option value="academic">Academic</option></select></label>
        <label className="block"><FieldLabel>Daily study time</FieldLabel><input type="number" min={5} max={120} value={profile.dailyMinutes} onChange={(event) => setProfile({ ...profile, dailyMinutes: Number(event.target.value) })} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" /></label>
        <TextList label="Preferred example style" value={profile.preferredExamples.join(", ")} onChange={(value) => setProfile({ ...profile, preferredExamples: lines(value) })} placeholder="natural, professional" />
        <label className="block"><FieldLabel>English voice</FieldLabel><select value={voiceName} onChange={(event) => setVoiceName(event.target.value)} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3"><option value="">Automatically choose the best voice</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.name}>{voice.name} ({voice.lang})</option>)}</select></label>
        <label className="block"><FieldLabel>Playback speed · {playbackRate.toFixed(2)}×</FieldLabel><input type="range" min="0.65" max="1.2" step="0.05" value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} className="w-full accent-[var(--accent)]" /></label>
      </div>

      {message ? <p role="status" className="mt-5 flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"><Check size={16} /> {message}</p> : null}
      {error ? <p role="alert" className="mt-5 rounded-2xl bg-[#f8e5df] p-3 text-sm text-[#8b392b]">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => { saveSpeechPreferences(voiceName || null, playbackRate); speakEnglish("This is your personal English voice."); }} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold"><Play size={16} /> Test voice</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}{saving ? "Saving..." : "Save profile"}</button>
      </div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) { return <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{children}</span>; }
function TextList({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="block"><FieldLabel>{label}</FieldLabel><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" /></label>; }
