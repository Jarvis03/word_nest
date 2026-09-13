function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-[#dedfd8] ${className}`} />;
}

export function PageLoading({ cards = 2 }: { cards?: number }) {
  return (
    <div role="status" aria-label="Loading page" className="px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
      <Bar className="h-3 w-24" />
      <Bar className="mt-4 h-10 w-48 max-w-full" />
      <Bar className="mt-4 h-4 w-72 max-w-full" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="animate-pulse rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="h-5 w-1/3 rounded-full bg-[#dedfd8]" />
            <div className="mt-4 h-4 w-3/4 rounded-full bg-[#e6e7e1]" />
            <div className="mt-3 h-3 w-1/2 rounded-full bg-[#e6e7e1]" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
