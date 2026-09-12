import { AuthForm } from "@/components/auth-form";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const requestedRedirect = (await searchParams).redirect;
  const redirectTo =
    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/today";

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <section className="w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--warm)]">Word Nest</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Remember what matters.</h1>
        <p className="mb-8 mt-3 leading-7 text-[var(--muted)]">
          Sign in to save your cards and keep your learning in sync.
        </p>
        <AuthForm redirectTo={redirectTo} />
      </section>
    </main>
  );
}
