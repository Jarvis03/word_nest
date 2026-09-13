"use client";

import { useState } from "react";
import { BookOpen, FileText } from "lucide-react";
import { AddWordForm } from "@/components/add-word-form";
import { ArticlePackForm } from "@/components/article-pack-form";

export function AddHub({ initialMode = "word" }: { initialMode?: "word" | "article" }) {
  const [mode, setMode] = useState(initialMode);
  return (
    <>
      <div className="mx-5 mb-6 grid grid-cols-2 rounded-full bg-[#e8e8e1] p-1 sm:mx-8">
        <ModeButton active={mode === "word"} onClick={() => setMode("word")} icon={<BookOpen size={17} />}>Word</ModeButton>
        <ModeButton active={mode === "article"} onClick={() => setMode("article")} icon={<FileText size={17} />}>Article</ModeButton>
      </div>
      {mode === "word" ? <AddWordForm /> : <ArticlePackForm />}
    </>
  );
}

function ModeButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition ${active ? "bg-white text-[var(--accent)] shadow-sm" : "text-[var(--muted)]"}`}>{icon}{children}</button>;
}
