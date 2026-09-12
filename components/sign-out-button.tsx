"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/auth");
        router.refresh();
      }}
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-bold"
    >
      <LogOut size={16} /> Sign out
    </button>
  );
}
