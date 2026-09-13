import { NextResponse } from "next/server";
import { learningProfileUpdateSchema } from "@/lib/learning-profile-schema";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const input = learningProfileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "The learning profile contains invalid values." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      learning_profile: input.data.learningProfile,
      voice_name: input.data.voiceName,
      playback_rate: input.data.playbackRate,
    })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: "Unable to save your learning profile." }, { status: 500 });
  return NextResponse.json({ profile: input.data });
}
