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

  useEffect(() => {
    const fetchLastNote = async () => {
      try {
        const data: NoteType = await notesService.getLastPartnerNote();
        setLatestNote({
          id: data.id,
          content: data.content,
          timestamp: new Date(data.created_at),
        });
      } catch {
        console.log("No hay notas disponibles aún");
      }
    };

    fetchLastNote();

    const unsubscribe = notesService.subscribeChannel((notes, type) => {
      if (type === "INSERT" && notes.length > 0) {
        const newNoteData = notes[0];
        setLatestNote({
          id: newNoteData.id,
          content: newNoteData.content,
          timestamp: new Date(newNoteData.created_at),
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full flex-1 min-w-0 px-2 gap-1">
      {/* Paper note */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-md border shadow-sm pb-2 bg-note-bg"
        style={{
          fontFamily: "'Caveat', cursive",
          background: "var(--note-bg, #fdf9f0)",
          borderColor: "var(--note-border, #e8dcc8)",
          boxShadow:
            "2px 2px 8px rgba(0,0,0,0.08), inset 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "0 0 18px 18px",
            borderColor:
              "transparent transparent var(--note-border, #e8dcc8) transparent",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "1px",
            right: "1px",
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: "0 0 16px 16px",
            borderColor:
              "transparent transparent var(--note-fold, #f5ede0) transparent",
          }}
        />

        {latestNote ? (
          <>
            <p className="m-0 px-3 text-center leading-relaxed text-2xl">
              {latestNote.content}
            </p>
            <span className="absolute bottom-1.5 left-2.5 text-[11px] text-muted-foreground">
              {latestNote.timestamp.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </>
        ) : (
          <p
            className="m-0 text-sm italic text-center"
            style={{ color: "var(--note-muted, #b0a090)" }}
          >
            Sin notas aún...
          </p>
        )}
      </div>

      <NoteInput />
    </div>
  );
}
