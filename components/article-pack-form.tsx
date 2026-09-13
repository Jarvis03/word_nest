"use client";

import Link from "next/link";
import { useState } from "react";
import { FileSearch, LoaderCircle, Save } from "lucide-react";
import { extractArticleKeywords, type ArticleKeyword } from "@/lib/article-schema";

const sources = [["reading", "Reading"], ["news", "News"], ["work", "Work"], ["email", "Email"], ["ai_chat", "AI chat"], ["other", "Other"]] as const;

function parseKeywords(value: string): ArticleKeyword[] {
  const seen = new Set<string>();
  return value.split("\n").map((line) => {
    const [keyword, ...note] = line.split("|");
    return { keyword: keyword.trim().toLocaleLowerCase("en-US"), note: note.join("|").trim() };
  }).filter((item) => item.keyword && !seen.has(item.keyword) && seen.add(item.keyword));
}

export function ArticlePackForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("reading");
  const [keywordText, setKeywordText] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function analyze() {
    const keywords = extractArticleKeywords(content);
    setKeywordText(keywords.map((item) => item.keyword).join("\n"));
    setError(keywords.length ? null : "Add a longer English article before extracting keywords.");
  }

  async function save() {
    const keywords = parseKeywords(keywordText);
    if (content.trim().length < 40 || !keywords.length) {
      setError("Enter at least 40 characters and keep at least one keyword.");
      return;
    }
    setSaving(true); setError(null);
    try {
      const response = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim() || content.trim().split(/\s+/).slice(0, 8).join(" "), content, source, keywords }) });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !body.id) throw new Error(body.error || "Unable to save this article.");
      setSavedId(body.id);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save this article."); }
    finally { setSaving(false); }
  }

  return (
    <div className="px-5 pb-8 sm:px-8">
      <div className="mb-4 flex justify-end"><Link href="/articles" className="text-sm font-bold text-[var(--accent)]">My article packs →</Link></div>
      <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <label className="block"><Label>Article title</Label><input value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} placeholder="Optional — generated from the first sentence" className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3" /></label>
        <label className="mt-5 block"><Label>English article</Label><textarea required value={content} maxLength={20000} rows={12} onChange={(event) => { setContent(event.target.value); setSavedId(null); }} placeholder="Paste an article, meeting note, email or passage you want to understand and recite." className="w-full resize-y rounded-2xl border border-[var(--line)] bg-white px-4 py-4 leading-7" /><span className="mt-2 block text-right text-xs text-[var(--muted)]">{content.length}/20,000</span></label>
        <div className="mt-5 flex flex-wrap items-end gap-3"><label className="min-w-44 flex-1"><Label>Source</Label><select value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3">{sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" onClick={analyze} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--line)] px-5 font-bold"><FileSearch size={17} /> Find keywords</button></div>
        {keywordText ? <label className="mt-6 block"><Label>Editable keywords · one per line</Label><textarea value={keywordText} onChange={(event) => setKeywordText(event.target.value)} rows={8} className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 font-mono text-sm leading-6" /><p className="mt-2 text-xs text-[var(--muted)]">Optional note format: <code>keyword | your note</code>. Remove any word you already know.</p></label> : null}
        {error ? <p role="alert" className="mt-5 rounded-2xl bg-[#f8e5df] p-3 text-sm text-[#8b392b]">{error}</p> : null}
        {savedId ? <p role="status" className="mt-5 rounded-2xl bg-[var(--accent-soft)] p-4 text-sm font-semibold text-[var(--accent)]">Article pack saved. <Link href={`/articles/${savedId}`} className="underline">Start studying →</Link></p> : null}
        <button type="button" onClick={() => void save()} disabled={saving || !keywordText} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-6 font-bold text-white disabled:opacity-50">{saving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}{saving ? "Saving..." : "Save article pack"}</button>
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) { return <span className="mb-2 block text-sm font-bold">{children}</span>; }
