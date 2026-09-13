"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { invalidateWordsCache } from "@/lib/words-cache";

export function AuthForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (
      mode === "sign-up" &&
      (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    ) {
      setError("Password must be at least 8 characters and include a letter and a number.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    if (mode === "sign-up") {
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", redirectTo);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback.toString() },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        invalidateWordsCache();
        router.push(redirectTo);
        router.refresh();
      } else {
        setMessage("Account created. Check your email to confirm it, then sign in.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Unable to sign in. Check your email, password, and email confirmation.");
      } else {
        invalidateWordsCache();
        router.push(redirectTo);
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_22px_70px_rgba(38,44,35,0.1)] sm:p-8">
      <div className="grid grid-cols-2 rounded-full bg-[#eeede7] p-1">
        {(["sign-in", "sign-up"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setError(null);
              setMessage(null);
            }}
            className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
              mode === value ? "bg-white text-[var(--ink)] shadow-sm" : "text-[var(--muted)]"
            }`}
          >
            {value === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Password</span>
          <input
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
            minLength={mode === "sign-up" ? 8 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
          />
          {mode === "sign-up" ? (
            <span className="mt-2 block text-xs text-[var(--muted)]">
              At least 8 characters, including a letter and a number.
            </span>
          ) : null}
        </label>

        {error ? (
          <p role="alert" className="rounded-2xl bg-[#f8e5df] px-4 py-3 text-sm text-[#8b392b]">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-bold text-white disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : mode === "sign-in" ? (
            <LogIn size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
