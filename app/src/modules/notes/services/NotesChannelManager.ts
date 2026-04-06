import { IRealtimeProvider } from "@/interfaces/IRealtimeProvider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Notes, noteSchema } from "../@types/notes.types";

export class NotesChannelManager {
  private channel: RealtimeChannel | null = null;

  constructor(
    private readonly userId: string,
    private readonly connectionId: string,
    private readonly realtime: IRealtimeProvider,
  ) {}

  async connect(
    callback: (
      notes: Notes,
      type: "INSERT" | "UPDATE" | "DELETE",
      id?: number,
    ) => void,
  ) {
    this.channel = this.realtime.createChannel(`notes:${this.connectionId}`);

    this.channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notes",
        filter: `connection_id=eq.${this.connectionId}`,
      },
      (payload) => {
        const raw = payload.new || payload.old;
        const note = noteSchema.parse(raw);

        if (note.author_id === this.userId) return;

        switch (payload.eventType) {
          case "INSERT":
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
    );

    this.channel.subscribe();
  }

  async disconnect() {
    if (!this.channel) return;
    await this.realtime.removeChannel(this.channel);
    this.channel = null;
  }
}
