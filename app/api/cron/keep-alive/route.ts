import { createClient } from "@supabase/supabase-js";
import { isAuthorizedCron } from "@/lib/cron-auth";

export async function GET(request: Request) {
  if (!isAuthorizedCron(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    return Response.json(
      { ok: false, error: "Supabase environment variables are missing." },
      { status: 500 },
    );
  }

  const supabase = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.rpc("record_system_heartbeat");

  if (error) {
    return Response.json(
      { ok: false, error: "Supabase heartbeat failed." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { ok: true, lastSeenAt: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
