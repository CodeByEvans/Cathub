import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { useNotes } from "../context/NotesContext";

const paperStyle: React.CSSProperties = {
  fontFamily: "'Caveat', cursive",
  background: "var(--note-bg, #fdf9f0)",
  borderColor: "var(--note-border, #e8dcc8)",
  color: "var(--note-text, inherit)",
};

const foldOuter: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  borderStyle: "solid",
  borderWidth: "0 0 18px 18px",
  borderColor:
    "transparent transparent var(--note-border, #e8dcc8) transparent",
};

const foldInner: React.CSSProperties = {
  position: "absolute",
  bottom: "1px",
  right: "1px",
  width: 0,
  height: 0,
  borderStyle: "solid",
  borderWidth: "0 0 16px 16px",
  borderColor: "transparent transparent var(--note-fold, #f5ede0) transparent",
};

interface NoteComposerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoteComposer({ isOpen, onClose }: NoteComposerProps) {
  const { sendNote } = useNotes();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendNote(text.trim());
      toast.success("Nota enviada");
      setText("");
      onClose();
    } catch (error) {
      handleAppError(error, "notes.send");
    }
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 z-20 rounded-md"
            data-tauri-drag-region
            style={{
              background: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center p-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div
              className="relative w-full h-full max-w-full rounded-md border flex flex-col overflow-hidden"
              style={{
                ...paperStyle,
                boxShadow:
                  "4px 4px 16px rgba(0,0,0,0.15), inset 0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={foldOuter} />
              <div style={foldInner} />

              <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
                <span className="font-medium glass:text-white text-sm">
                  Nueva nota
                </span>
                <button
                  onClick={handleClose}
                  className="p-0.5 rounded hover:bg-black/8 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                className="mx-3 h-px"
                style={{ background: "var(--note-border, #e8dcc8)" }}
              />

              <div className="flex-1 relative mx-3 mb-2 mt-2 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "rgba(0,0,0,0.04)",
                    border: "1px solid var(--note-border, #e8dcc8)",
                    borderRadius: "0.5rem",
                  }}
                />

                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe aquí tu nota..."
                  maxLength={200}
                  className="absolute inset-0 w-full h-full resize-none bg-transparent text-center outline-none placeholder:text-muted-foreground/40"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "1.4rem",
                    lineHeight: 1.5,
                    padding: "0.5rem 1rem",
                    color: "var(--note-text, inherit)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-2 pt-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">
                  {text.length}/200
                </span>
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-[11px] font-medium transition-all glass:text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
