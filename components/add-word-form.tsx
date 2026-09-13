"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { WordCardPreview } from "@/components/word-card-preview";
import type { WordCardDraft } from "@/lib/word-card-schema";
import { invalidateWordsCache } from "@/lib/words-cache";

const sources = [
  ["other", "Other"],
  ["work", "Work"],
  ["reading", "Reading"],
  ["news", "News"],
  ["email", "Email"],
  ["ai_chat", "AI chat"],
] as const;

export function AddWordForm() {
  const [text, setText] = useState("rollout");
  const [originalContext, setOriginalContext] = useState("");
  const [source, setSource] = useState("other");
  const [draft, setDraft] = useState<WordCardDraft | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    setEditing(false);
    setSavedId(null);

    try {
      const response = await fetch("/api/words/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          originalContext: originalContext || undefined,
          source,
        }),
      });
      const body = (await response.json()) as {
        draft?: WordCardDraft;
        error?: string;
        mode?: string;
      };
      if (!response.ok || !body.draft) throw new Error(body.error || "Unable to generate this card.");
      setDraft(body.draft);
      setMode(body.mode || null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate this card.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          originalContext: originalContext || undefined,
          source,
        }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !body.id) throw new Error(body.error || "Unable to save this card.");
      invalidateWordsCache();
      setSavedId(body.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this card.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 pb-8 sm:px-8">
      <form onSubmit={generate} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Word or phrase</span>
          <input
            required
            maxLength={80}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. rollout or align with"
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-4 text-lg outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>Original context</span>
            <span className="font-normal text-[var(--muted)]">Optional · {originalContext.length}/500</span>
          </span>
          <textarea
            maxLength={500}
            rows={4}
            value={originalContext}
            onChange={(event) => setOriginalContext(event.target.value)}
            placeholder="Paste the sentence where you met it. This helps choose the right meaning."
            className="w-full resize-y rounded-2xl border border-[var(--line)] bg-white px-4 py-3 leading-6 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Don&apos;t include passwords, customer data, or confidential company information.
          </p>
        </label>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:w-52">
            <span className="mb-2 block text-sm font-bold">Source</span>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)]"
            >
              {sources.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-bold text-white shadow-[0_8px_24px_rgba(49,92,66,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Creating your card..." : "Generate"}
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-5 rounded-2xl bg-[#f8e5df] px-4 py-3 text-sm text-[#8b392b]">
            {error}
          </p>
        ) : null}
      </form>

      {mode === "local-preview" ? (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Local preview mode · the validated LLM adapter is the next integration step
        </p>
      ) : null}

      {draft ? (
        <>
          {savedId ? (
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[var(--accent-soft)] px-5 py-4 text-sm text-[var(--accent)]">
              <strong>Added to My Words</strong>
              <Link href="/words" className="font-bold underline underline-offset-4">View words</Link>
            </div>
          ) : null}
          <WordCardPreview
            draft={draft}
            editing={editing}
            onEditingChange={setEditing}
            onChange={setDraft}
            onRegenerate={() => void generate()}
            onSave={() => void save()}
            saving={saving}
            saved={Boolean(savedId)}
          />
        </>
      ) : null}
    </div>
  );
}
