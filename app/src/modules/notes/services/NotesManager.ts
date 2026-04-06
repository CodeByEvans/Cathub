import { IAudioService } from "@/shared/interfaces/IAudioService";
import { Notes } from "../@types/notes.types";
import { NotesChannelManager } from "./NotesChannelManager";
import { INotesRepository } from "./interfaces/INotesRepository";

export class NotesManager {
  lastSentRef = { timestamp: 0 };
  COOLDOWN = 4000; // 2 segundos
  constructor(
    private readonly repository: INotesRepository,
    private readonly channel: NotesChannelManager,
    private readonly audio: IAudioService,
  ) {}

  async start(
    callback: (
      notes: Notes,
      type: "INSERT" | "UPDATE" | "DELETE",
      id?: number,
    ) => void,
  ) {
    const notes = await this.repository.getNotes();
    await this.channel.connect((notes, type, id) => {
      if (type === "INSERT") {
        this.audio.play("incomingNote", { volume: 0.1 });
      }
      callback(notes, type, id);
    });

    return notes;
  }

  async sendNote(content: string) {
    try {
      if (Date.now() - this.lastSentRef.timestamp < this.COOLDOWN) {
        throw new Error("Espera un momento antes de enviar otra nota.");
      }
      const note = await this.repository.sendNote(content);
      this.audio.play("send", { volume: 0.1 });
      this.lastSentRef.timestamp = Date.now();
      return note;
    } catch (error) {
      this.audio.play("error", { volume: 0.1 });
      throw error;
    }
  }

  async stop() {
    await this.channel.disconnect();
  }
}
