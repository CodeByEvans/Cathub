import z from "zod";

export const noteSchema = z.object({
  id: z.int(),
  author_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  connection_id: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

export type Notes = Note[];
