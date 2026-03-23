import { getValue } from "@/services/store.service";
import { supabase } from "../../../services/supabaseClient";
import { Note, Notes, noteSchema } from "../@types/notes.types";
import { audioService } from "@/services/audio.service";

class NotesService {
  private connectionId: string | null = null;
  private myUserId: string | null = null;
  private cachedNotes: Note[] = [];

  getCachedNotes(): Note[] {
    return this.cachedNotes;
  }

  async initialize() {
    if (!this.connectionId) {
      this.connectionId = (await getValue("connection_id")) as string | null;
      if (!this.connectionId) throw new Error("No hay conexión establecida");
    }
    if (!this.myUserId) {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Usuario no autenticado");
      this.myUserId = user.id;
    }
  }

  async getLastPartnerNotes(limit = 5): Promise<Note[]> {
    await this.initialize();
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("connection_id", this.connectionId)
      .neq("author_id", this.myUserId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No hay notas disponibles");

    const notes = data.map((n) => noteSchema.parse(n));
    this.cachedNotes = notes;
    return notes;
  }

  async sendNote(content: string) {
    await this.initialize();
    const { data, error } = await supabase
      .from("notes")
      .insert({
        connection_id: this.connectionId,
        author_id: this.myUserId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No se pudo enviar la nota");
    return noteSchema.parse(data);
  }

  subscribeChannel(
    callback: (
      notes: Notes,
      type: "INSERT" | "UPDATE" | "DELETE",
      id?: number,
    ) => void,
  ): () => void {
    const channel = supabase
      .channel("public:notes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `connection_id=eq.${this.connectionId}`,
        },
        async (payload) => {
          await this.initialize();
          const note = noteSchema.parse(payload.new || payload.old);
          if (note.author_id === this.myUserId) return;

          switch (payload.eventType) {
            case "INSERT":
              this.cachedNotes = [note, ...this.cachedNotes].slice(0, 5);
              audioService.play("incomingNote", { volume: 0.1 });
              callback([note], "INSERT", note.id);
              break;
            case "UPDATE":
              callback([note], "UPDATE", note.id);
              break;
            case "DELETE":
              callback([note], "DELETE", note.id);
              break;
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}

export const notesService = new NotesService();
