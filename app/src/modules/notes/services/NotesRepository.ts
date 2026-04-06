import { SupabaseClient } from "@supabase/supabase-js";
import { Note, Notes, noteSchema } from "../@types/notes.types";

export class NotesRepository {
  constructor(
    private readonly db: SupabaseClient,
    private readonly userId: string,
    private readonly connectionId: string,
  ) {}

  async getNotes(): Promise<Notes | null> {
    try {
      const { data, error } = await this.db
        .from("notes")
        .select("*")
        .eq("connection_id", this.connectionId)
        .neq("author_id", this.userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      const notes = data.map((n) => noteSchema.parse(n));
      return notes;
    } catch (error) {
      console.error("❌ Error en getNotes:", error);
      return null;
    }
  }

  async sendNote(content: string): Promise<Note | null> {
    const { data, error } = await this.db
      .from("notes")
      .insert({
        connection_id: this.connectionId,
        author_id: this.userId,
        content,
      })
      .select()
      .single();
    if (error) throw error;
    if (!data) throw new Error("No se pudo enviar la nota");
    return noteSchema.parse(data);
  }
}
