import { useEffect, useState } from "react";

import { Note as NoteType } from "../@types/notes.types";
import { notesService } from "../services/notes.service";
import { NoteInput } from "./NoteInput";

interface Note {
  id: number;
  content: string;
  timestamp: Date;
}

export function NotesSection() {
  const [latestNote, setLatestNote] = useState<Note | null>(null);

  // Obtener la última nota del otro usuario al montar
  useEffect(() => {
    const fetchLastNote = async () => {
      try {
        const data: NoteType = await notesService.getLastPartnerNote();
        setLatestNote({
          id: data.id,
          content: data.content,
          timestamp: new Date(data.created_at),
        });
      } catch (error) {
        console.log("No hay notas disponibles aún");
      }
    };

    fetchLastNote();

    // Suscribirse a nuevas notas del otro usuario
    const unsubscribe = notesService.suscribeChannel((notes, type) => {
      if (type === "INSERT" && notes.length > 0) {
        const newNoteData = notes[0];
        setLatestNote({
          id: newNoteData.id,
          content: newNoteData.content,
          timestamp: new Date(newNoteData.created_at),
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col h-full flex-1 min-w-0 px-2">
      {/* Notes display area with paper texture */}
      <div className="flex-1 paper-texture rounded-lg overflow-hidden border border-border shadow-inner">
        <div className="h-full p-3 overflow-y-auto">
          {latestNote ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {latestNote.content}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {latestNote.timestamp.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center pt-6">
              Sin notas aún...
            </p>
          )}
        </div>
      </div>

      {/* Input area */}
      <NoteInput />
    </div>
  );
}
