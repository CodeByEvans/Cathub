import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/errors/AppError";
import { Note, Notes, noteSchema } from "../@types/notes.types";

export class NotesRepository {
  constructor(
    private readonly db: SupabaseClient,
    private readonly userId: string,
    private readonly connectionId: string,
  ) {}

  /** Un fallo de la consulta lanza `AppError` — nunca devuelve `null` por error. */
  async getNotes(): Promise<Notes> {
    try {
      const { data, error } = await this.db
        .from("notes")
        .select("*")
        .eq("connection_id", this.connectionId)
        .neq("author_id", this.userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data.map((n) => noteSchema.parse(n));
    } catch (error) {
      throw new AppError("notes/fetch-failed", { cause: error });
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
    if (error) throw new AppError("notes/send-failed", { cause: error });
    if (!data)
      throw new AppError("notes/send-failed", {
        message: "El insert no devolvió la nota creada",
      });
    return noteSchema.parse(data);
  }
}
