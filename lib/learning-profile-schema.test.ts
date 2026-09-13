import { describe, expect, it } from "vitest";
import { learningProfileSchema, learningProfileUpdateSchema } from "./learning-profile-schema";

describe("learning profile", () => {
  it("fills defaults for profiles created before personalization", () => {
    const profile = learningProfileSchema.parse({ primaryUseCases: ["workplace English"] });
    expect(profile.explanationLevel).toBe("intermediate");
    expect(profile.listeningFocus).toBe("daily");
    expect(profile.dailyMinutes).toBe(15);
  });

  it("rejects unsafe playback rates", () => {
    const profile = learningProfileSchema.parse({});
    expect(learningProfileUpdateSchema.safeParse({ learningProfile: profile, voiceName: null, playbackRate: 3 }).success).toBe(false);
  });
});
