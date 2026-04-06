import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createNotesService } from "../services/ index";
import { Note } from "../@types/notes.types";

function toNote(raw: Note) {
  return {
    id: raw.id,
    content: raw.content,
    timestamp: new Date(raw.created_at),
  };
}

const NotesContext = createContext<{
  notes: ReturnType<typeof toNote>[];
  sendNote: (content: string) => Promise<void>;
} | null>(null);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<ReturnType<typeof toNote>[]>([]);
  const managerRef = useRef<Awaited<
    ReturnType<typeof createNotesService>
  > | null>(null);

  useEffect(() => {
    createNotesService().then((manager) => {
      managerRef.current = manager;
      manager
        .start((incoming, type) => {
          if (type === "INSERT") {
            setNotes((prev) => [toNote(incoming[0]), ...prev].slice(0, 5));
          }
        })
        .then((initialNotes) => {
          if (initialNotes) setNotes(initialNotes.map(toNote));
        });
    });
    return () => {
      managerRef.current?.stop();
    };
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        sendNote: async (content: string): Promise<void> => {
          if (!managerRef.current) return;
          await managerRef.current.sendNote(content);
        },
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};
