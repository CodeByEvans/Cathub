import { Note, Notes } from "../../@types/notes.types";

export interface INotesRepository {
  getNotes(): Promise<Notes>;
  sendNote(content: string): Promise<Note | null>;
}
