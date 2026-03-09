import { notesService } from "../services/notes.service";
import { Input } from "@/globals/components/atoms/input";
import React from "react";
import { Button } from "@/globals/components/atoms/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { audioService } from "@/services/audio.service";

export const NoteInput = () => {
  const [note, setNote] = React.useState("");
  const play = (key: string) => audioService.play(key, { volume: 0.1 });

  const lastSentRef = React.useRef<number>(0);
  const COOLDOWN_MS = 4000; // 4 segundos entre notas

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSentRef.current < COOLDOWN_MS) {
      toast.warning("Espera un momento antes de enviar otra nota", {
        id: "note-cooldown",
      });
      play("error");
      return;
    }

    try {
      lastSentRef.current = now;
      notesService.sendNote(note);
      toast("Nota enviada con exito", {
        id: "note-success",
        description: note,
      });
      play("send");
      setNote("");
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar la nota 😭");
    }
  };
  return (
    <form className="flex items-center gap-2 mt-2" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Escribe una nota..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="flex-1 h-8 text-primary glass:text-white text-sm bg-input/50 border-border/50 focus:border-primary/50"
      />
      <Button
        type="submit"
        size="sm"
        className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
        disabled={!note.trim()}
      >
        <Send className="w-4 h-4 text-white" />
        <span className="sr-only">Enviar nota</span>
      </Button>
    </form>
  );
};
