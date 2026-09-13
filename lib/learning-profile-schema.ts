import { z } from "zod";

export const learningProfileSchema = z.object({
  primaryUseCases: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
  preferredExamples: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
  interests: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  explanationLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  listeningFocus: z.enum(["daily", "workplace", "news", "academic"]).default("daily"),
  dailyMinutes: z.number().int().min(5).max(120).default(15),
});

export const learningProfileUpdateSchema = z.object({
  learningProfile: learningProfileSchema,
  voiceName: z.string().trim().max(120).nullable(),
  playbackRate: z.number().min(0.5).max(1.5),
});

export type LearningProfile = z.infer<typeof learningProfileSchema>;
