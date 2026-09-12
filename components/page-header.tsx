export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--warm)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">{description}</p>
      ) : null}
    </header>
  );
}
