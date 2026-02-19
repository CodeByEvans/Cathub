import { notesService } from "../services/notes.service";
import { Input } from "@/globals/components/atoms/input";
import React from "react";
import { Button } from "@/globals/components/atoms/button";
import { Send } from "lucide-react";

export const NoteInput = () => {
  const [note, setNote] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    notesService.sendNote(note);
    setNote("");
  };
  return (
    <form className="flex items-center gap-2 mt-2" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Escribe una nota..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="flex-1 h-8 text-sm bg-input/50 border-border/50 focus:border-primary/50"
      />
      <Button
        type="submit"
        size="sm"
        className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
        disabled={!note.trim()}
      >
        <Send className="w-4 h-4" />
        <span className="sr-only">Enviar nota</span>
      </Button>
    </form>
  );
};
