import { z } from "zod";

export const CharacterRelationshipSchema = z.object({
  characterId: z.string().min(1),
  relation: z.string().min(1),
  notes: z.string().optional(),
});

export const CharacterInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum([
    "protagonist",
    "antagonist",
    "supporting",
    "mentor",
    "love_interest",
    "rival",
    "other",
  ]),
  age: z.number().int().optional(),
  genderPresentation: z.string().optional(),
  visualDescription: z.string().min(1),
  personality: z.array(z.string().min(1)).default([]),
  motivation: z.string().optional(),
  fear: z.string().optional(),
  secret: z.string().optional(),
  voice: z.string().optional(),
  relationshipNotes: z.string().optional(),
  relationships: z.array(CharacterRelationshipSchema).default([]),
});
