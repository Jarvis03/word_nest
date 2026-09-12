"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Pencil, Trash2, Volume2, X } from "lucide-react";
import {
  entryTypeValues,
  partOfSpeechValues,
  type WordCardDraft,
} from "@/lib/word-card-schema";

type Relationship = WordCardDraft["relatedWords"][number]["relationship"];

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRelated(value: string): WordCardDraft["relatedWords"] {
  const allowed = new Set<Relationship>(["related", "confusing", "synonym"]);
  return lines(value).map((line) => {
    const [word, rawRelationship] = line.split("|").map((item) => item.trim());
    const relationship = allowed.has(rawRelationship as Relationship)
      ? (rawRelationship as Relationship)
      : "related";
    return { word, relationship };
  });
}

export function WordDetailManager({
  wordId,
  initialDraft,
  source,
  originalContext,
  nextReview,
}: {
  wordId: string;
  initialDraft: WordCardDraft;
  source: string;
  originalContext: string | null;
  nextReview: string | null;
}) {
  const router = useRouter();
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [draft, setDraft] = useState(initialDraft);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof WordCardDraft>(key: K, value: WordCardDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      const body = (await response.json()) as { draft?: WordCardDraft; error?: string };
      if (!response.ok || !body.draft) throw new Error(body.error || "Unable to update this card.");
      setDraft(body.draft);
      setSavedDraft(body.draft);
      setEditing(false);
      setMessage("Changes saved.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update this card.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/words/${wordId}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Unable to delete this word.");
      }
      router.push("/words");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete this word.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="px-5 pb-8 sm:px-8">
      <Link href="/words" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
        <ArrowLeft size={17} /> My Words
      </Link>

      <article className="mt-5 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_60px_rgba(38,44,35,0.08)]">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em]">{draft.word}</h1>
              <button
                type="button"
                onClick={() => speak(draft.word)}
                aria-label={`Play ${draft.word}`}
                className="grid size-10 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
              >
                <Volume2 size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {draft.partOfSpeech.replace("_", " ")} · {draft.entryType}
            </p>
          </div>
          <span className="rounded-full bg-[#f1e8dc] px-3 py-1 text-xs font-bold capitalize text-[var(--warm)]">
            {source.replace("_", " ")}
          </span>
        </header>

        <div className="space-y-7 p-6 sm:p-8">
          {editing ? (
            <EditForm draft={draft} update={update} />
          ) : (
            <CardContent draft={draft} originalContext={originalContext} nextReview={nextReview} />
          )}

          {message ? <p role="status" className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">{message}</p> : null}
          {error ? <p role="alert" className="rounded-2xl bg-[#f8e5df] px-4 py-3 text-sm text-[#8b392b]">{error}</p> : null}
        </div>

        <footer className="border-t border-[var(--line)] p-5">
          {confirmingDelete ? (
            <div className="rounded-2xl bg-[#f8e5df] p-4">
              <p className="text-sm font-semibold text-[#8b392b]">Delete this word and all of its review history?</p>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => setConfirmingDelete(false)} disabled={deleting} className="rounded-full border border-[#c99184] px-4 py-2 text-sm font-bold text-[#8b392b]">Cancel</button>
                <button type="button" onClick={() => void remove()} disabled={deleting} className="inline-flex items-center gap-2 rounded-full bg-[#8b392b] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                  {deleting ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  {deleting ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {editing ? (
                <>
                  <button type="button" onClick={() => { setDraft(savedDraft); setEditing(false); setError(null); }} disabled={saving} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold"><X size={16} /> Cancel</button>
                  <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    {saving ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setEditing(true); setMessage(null); }} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white"><Pencil size={16} /> Edit card</button>
                  <button type="button" onClick={() => setConfirmingDelete(true)} className="inline-flex items-center gap-2 rounded-full border border-[#c99184] px-4 py-2.5 text-sm font-bold text-[#8b392b]"><Trash2 size={16} /> Delete</button>
                </>
              )}
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}

function CardContent({ draft, originalContext, nextReview }: { draft: WordCardDraft; originalContext: string | null; nextReview: string | null }) {
  return (
    <>
      <Section label="Core meaning"><p className="text-xl leading-8">{draft.coreMeaning}</p><p className="mt-2 font-medium text-[var(--warm)]">{draft.chineseHint}</p></Section>
      <Section label="Think of it as"><div className="flex flex-wrap gap-2">{draft.mentalModel.map((item) => <span key={item} className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">{item}</span>)}</div></Section>
      <Section label="Common patterns"><div className="flex flex-wrap gap-2">{draft.collocations.map((item) => <span key={item} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm">{item}</span>)}</div></Section>
      <Example label="Example" sentence={draft.examples.common} />
      <Example label="Contextual example" sentence={draft.examples.contextual} />
      {originalContext ? <Section label="Original context"><p className="leading-7 text-[var(--muted)]">{originalContext}</p></Section> : null}
      {draft.relatedWords.length ? <Section label="Related"><div className="flex flex-wrap gap-3">{draft.relatedWords.map((item) => <span key={`${item.word}-${item.relationship}`} className="text-sm"><strong>{item.word}</strong> <span className="text-[var(--muted)]">{item.relationship}</span></span>)}</div></Section> : null}
      <p className="text-xs text-[var(--muted)]">Next review: {nextReview ? new Date(nextReview).toLocaleDateString("en-US") : "Not scheduled"}</p>
    </>
  );
}

function EditForm({ draft, update }: { draft: WordCardDraft; update: <K extends keyof WordCardDraft>(key: K, value: WordCardDraft[K]) => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Word" value={draft.word} onChange={(value) => update("word", value)} />
      <Field label="Lemma" value={draft.lemma} onChange={(value) => update("lemma", value)} />
      <SelectField label="Entry type" value={draft.entryType} values={entryTypeValues} onChange={(value) => update("entryType", value as WordCardDraft["entryType"])} />
      <SelectField label="Part of speech" value={draft.partOfSpeech} values={partOfSpeechValues} onChange={(value) => update("partOfSpeech", value as WordCardDraft["partOfSpeech"])} />
      <Field wide label="Core meaning" value={draft.coreMeaning} onChange={(value) => update("coreMeaning", value)} multiline />
      <Field wide label="Chinese hint" value={draft.chineseHint} onChange={(value) => update("chineseHint", value)} />
      <Field wide label="Mental model — one item per line" value={draft.mentalModel.join("\n")} onChange={(value) => update("mentalModel", lines(value))} multiline />
      <Field wide label="Collocations — one item per line" value={draft.collocations.join("\n")} onChange={(value) => update("collocations", lines(value))} multiline />
      <Field wide label="Common example" value={draft.examples.common} onChange={(value) => update("examples", { ...draft.examples, common: value })} multiline />
      <Field wide label="Contextual example" value={draft.examples.contextual} onChange={(value) => update("examples", { ...draft.examples, contextual: value })} multiline />
      <Field wide label="Related — word | related, confusing, or synonym" value={draft.relatedWords.map((item) => `${item.word} | ${item.relationship}`).join("\n")} onChange={(value) => update("relatedWords", parseRelated(value))} multiline />
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, wide = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; wide?: boolean }) {
  const className = "w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]";
  return <label className={wide ? "block sm:col-span-2" : "block"}><span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</span>{multiline ? <textarea required value={value} onChange={(event) => onChange(event.target.value)} rows={3} className={`${className} resize-y`} /> : <input required value={value} onChange={(event) => onChange(event.target.value)} className={className} />}</label>;
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none">{values.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}</select></label>;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</h2>{children}</section>;
}

function Example({ label, sentence }: { label: string; sentence: string }) {
  return <Section label={label}><div className="flex items-start justify-between gap-4 rounded-2xl bg-[#f3f1ea] p-4"><p className="leading-7">{sentence}</p><button type="button" onClick={() => speak(sentence)} aria-label={`Play ${label.toLowerCase()}`} className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[var(--accent)]"><Volume2 size={16} /></button></div></Section>;
}
