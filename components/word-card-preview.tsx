"use client";

import { Pencil, RotateCw, Save, Volume2, X } from "lucide-react";
import type { WordCardDraft } from "@/lib/word-card-schema";

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

export function WordCardPreview({
  draft,
  editing,
  onEditingChange,
  onChange,
  onRegenerate,
}: {
  draft: WordCardDraft;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onChange: (draft: WordCardDraft) => void;
  onRegenerate: () => void;
}) {
  const update = <K extends keyof WordCardDraft>(key: K, value: WordCardDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_60px_rgba(38,44,35,0.08)]">
      <div className="flex items-start justify-between border-b border-[var(--line)] p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-semibold tracking-[-0.04em]">{draft.word}</h2>
            <button
              type="button"
              onClick={() => speak(draft.word)}
              aria-label={`Play ${draft.word}`}
              className="grid size-10 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
            >
              <Volume2 size={18} />
            </button>
          </div>
          <p className="mt-2 text-sm font-medium text-[var(--muted)]">
            {draft.partOfSpeech.replace("_", " ")} · {draft.entryType}
          </p>
        </div>
        <span className="rounded-full bg-[#f1e8dc] px-3 py-1 text-xs font-bold text-[var(--warm)]">
          Draft
        </span>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {editing ? (
          <div className="space-y-5">
            <EditField
              label="Core meaning"
              value={draft.coreMeaning}
              onChange={(value) => update("coreMeaning", value)}
            />
            <EditField
              label="Chinese hint"
              value={draft.chineseHint}
              onChange={(value) => update("chineseHint", value)}
            />
            <EditField
              label="Common example"
              value={draft.examples.common}
              onChange={(value) => update("examples", { ...draft.examples, common: value })}
            />
            <EditField
              label="Contextual example"
              value={draft.examples.contextual}
              onChange={(value) => update("examples", { ...draft.examples, contextual: value })}
            />
          </div>
        ) : (
          <>
            <CardSection label="Core meaning">
              <p className="text-xl leading-8">{draft.coreMeaning}</p>
              <p className="mt-3 text-base font-medium text-[var(--warm)]">{draft.chineseHint}</p>
            </CardSection>

            <CardSection label="Think of it as">
              <div className="flex flex-wrap items-center gap-2">
                {draft.mentalModel.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">
                      {item}
                    </span>
                    {index < draft.mentalModel.length - 1 ? (
                      <span className="text-[var(--muted)]">→</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardSection>

            <CardSection label="Common patterns">
              <div className="flex flex-wrap gap-2">
                {draft.collocations.map((item) => (
                  <span key={item} className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </CardSection>

            <Example label="Example" sentence={draft.examples.common} />
            <Example label="Contextual example" sentence={draft.examples.contextual} />

            {draft.relatedWords.length > 0 ? (
              <CardSection label="Related">
                <div className="flex flex-wrap gap-3">
                  {draft.relatedWords.map((item) => (
                    <span key={`${item.word}-${item.relationship}`} className="text-sm">
                      <strong>{item.word}</strong>{" "}
                      <span className="text-[var(--muted)]">{item.relationship}</span>
                    </span>
                  ))}
                </div>
              </CardSection>
            ) : null}
          </>
        )}
      </div>

      <div className="grid gap-3 border-t border-[var(--line)] p-5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onEditingChange(!editing)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 text-sm font-bold"
        >
          {editing ? <X size={16} /> : <Pencil size={16} />}
          {editing ? "Done editing" : "Edit"}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 text-sm font-bold"
        >
          <RotateCw size={16} /> Regenerate
        </button>
        <button
          type="button"
          disabled
          title="Supabase persistence is the next implementation slice"
          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white opacity-50"
        >
          <Save size={16} /> Save next
        </button>
      </div>
    </section>
  );
}

function CardSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </h3>
      {children}
    </section>
  );
}

function Example({ label, sentence }: { label: string; sentence: string }) {
  return (
    <CardSection label={label}>
      <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#f3f1ea] p-4">
        <p className="leading-7">{sentence}</p>
        <button
          type="button"
          onClick={() => speak(sentence)}
          aria-label={`Play ${label.toLowerCase()}`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[var(--accent)]"
        >
          <Volume2 size={16} />
        </button>
      </div>
    </CardSection>
  );
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-y rounded-2xl border border-[var(--line)] bg-white px-4 py-3 leading-6 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
      />
    </label>
  );
}
