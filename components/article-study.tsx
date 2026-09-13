"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, LoaderCircle, Pencil, Play, Save, X } from "lucide-react";
import type { ArticleKeyword } from "@/lib/article-schema";
import { speakEnglish } from "@/lib/speech";

function parseKeywords(value: string): ArticleKeyword[] {
  const seen = new Set<string>();
  return value.split("\n").map((line) => { const [keyword, ...note] = line.split("|"); return { keyword: keyword.trim().toLowerCase(), note: note.join("|").trim() }; }).filter((item) => item.keyword && !seen.has(item.keyword) && seen.add(item.keyword));
}

export function ArticleStudy({ id, title, content, source, initialKeywords }: { id: string; title: string; content: string; source: string; initialKeywords: ArticleKeyword[] }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [recite, setRecite] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [keywordText, setKeywordText] = useState(initialKeywords.map((item) => `${item.keyword}${item.note ? ` | ${item.note}` : ""}`).join("\n"));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const keywordSet = useMemo(() => new Set(keywords.map((item) => item.keyword.toLowerCase())), [keywords]);

  async function saveKeywords() {
    const next = parseKeywords(keywordText);
    if (!next.length) return;
    setSaving(true); setMessage(null);
    const response = await fetch(`/api/articles/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keywords: next }) });
    if (response.ok) { setKeywords(next); setEditing(false); setMessage("Keywords saved."); }
    else setMessage("Unable to save keywords.");
    setSaving(false);
  }

  return (
    <div className="px-5 pb-8 pt-8 sm:px-8">
      <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]"><ArrowLeft size={17} /> Article packs</Link>
      <article className="mt-5 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]">
        <header className="border-b border-[var(--line)] p-6 sm:p-8"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--warm)]">{source.replace("_", " ")}</span><h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{title}</h1><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => speakEnglish(content)} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white"><Play size={16} /> Listen</button><button type="button" onClick={() => { setRecite(!recite); setRevealed(false); }} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold">{recite ? <Eye size={16} /> : <EyeOff size={16} />}{recite ? "Reading mode" : "Recite mode"}</button>{recite ? <button type="button" onClick={() => setRevealed(!revealed)} className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold">{revealed ? "Hide answers" : "Reveal answers"}</button> : null}</div></header>
        <div className="space-y-6 p-6 sm:p-8">{content.split(/\n{2,}/).map((paragraph, index) => <p key={index} className="text-lg leading-9">{paragraph.split(/([A-Za-z]+(?:'[A-Za-z]+)?)/).map((part, partIndex) => { const target = keywordSet.has(part.toLowerCase()); if (!target) return part; if (recite && !revealed) return <span key={partIndex} className="mx-1 inline-block min-w-16 border-b-2 border-[var(--accent)] text-transparent">{part}</span>; return <mark key={partIndex} className="rounded bg-[var(--accent-soft)] px-1 text-[var(--accent)]">{part}</mark>; })}</p>)}</div>
      </article>
      <section className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6"><div className="flex items-center justify-between"><h2 className="font-semibold">Your keywords</h2><button type="button" onClick={() => setEditing(!editing)} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--accent)]">{editing ? <X size={15} /> : <Pencil size={15} />}{editing ? "Cancel" : "Edit"}</button></div>{editing ? <><textarea value={keywordText} onChange={(event) => setKeywordText(event.target.value)} rows={8} className="mt-4 w-full rounded-2xl border border-[var(--line)] bg-white p-4 font-mono text-sm leading-6" /><button type="button" onClick={() => void saveKeywords()} disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white">{saving ? <LoaderCircle className="animate-spin" size={15} /> : <Save size={15} />} Save keywords</button></> : <div className="mt-4 flex flex-wrap gap-2">{keywords.map((item) => <span key={item.keyword} title={item.note} className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)]">{item.keyword}{item.note ? ` · ${item.note}` : ""}</span>)}</div>}{message ? <p className="mt-4 flex items-center gap-2 text-sm text-[var(--accent)]"><Check size={15} /> {message}</p> : null}</section>
    </div>
  );
}
