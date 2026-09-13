import Link from "next/link";

export function WordListItem({
  id,
  word,
  chineseHint,
  source,
  due,
}: {
  id: string;
  word: string;
  chineseHint: string;
  source: string;
  due?: string | null;
}) {
  return (
    <Link
      href={`/words/${id}`}
      className="block rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[#bec7bc]"
    >
      <div className="flex flex-col items-start gap-3 min-[360px]:flex-row min-[360px]:justify-between min-[360px]:gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold">{word}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{chineseHint}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold capitalize text-[var(--accent)]">
          {source.replace("_", " ")}
        </span>
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Next review: {due ? new Date(due).toLocaleDateString("en-US") : "Not scheduled"}
      </p>
    </Link>
  );
}
