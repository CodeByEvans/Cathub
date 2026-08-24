import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScrollTextIcon,
  XIcon,
  ArrowLeftIcon,
  Pencil,
  Maximize2,
  Send,
  X,
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { toast } from "@/components/ui/sonner";
import { handleAppError } from "@/shared/errors/appErrorHandler";

interface Note {
  id: number;
  content: string;
  timestamp: Date;
}

function formatNoteTime(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  const time = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (diffDays === 0) return time;
  if (diffDays === 1) return `ayer ${time}`;
  if (diffDays < 7)
    return `${date.toLocaleDateString("es-ES", { weekday: "short" })} ${time}`;
  return `${date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} ${time}`;
}

const paperStyle: React.CSSProperties = {
  fontFamily: "'Caveat', cursive",
  background: "var(--note-bg, #fdf9f0)",
  borderColor: "var(--note-border, #e8dcc8)",
  color: "var(--note-text, inherit)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
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

export function NotesSection({
  isCompact = false,
  onToggleCompact,
}: {
  isCompact?: boolean;
  onToggleCompact?: () => void;
}) {
  const { notes, sendNote } = useNotes();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedNote, setExpandedNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);

  const latestNote = notes[0] ?? null;
  const previousNotes = notes.slice(1);

  const startEditing = () => {
    setDraft("");
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    let text = el.innerText;
    if (text.length > 200) {
      text = text.slice(0, 200);
      el.innerText = text;
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setDraft(text);
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    try {
      await sendNote(content);
      toast.success("Nota enviada");
      setDraft("");
      setEditing(false);
    } catch (error) {
      handleAppError(error, "notes.send");
    }
  };

  const handleCancel = () => {
    setDraft("");
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      className={`relative flex flex-col h-full flex-1 min-w-0 ${isCompact ? "px-0" : "px-2"} gap-1`}
      data-tauri-drag-region
    >
      {/* ── Nota principal ── */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-md border shadow-sm  group"
        data-tauri-drag-region
        style={{
          ...paperStyle,
          boxShadow:
            "2px 2px 8px rgba(0,0,0,0.08), inset 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <img
          src="/cat3.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 m-auto pointer-events-none select-none"
          style={{
            width: "55%",
            height: "55%",
            objectFit: "contain",
            opacity: 0.18,
            zIndex: -1,
          }}
        />

        {editing ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div
              ref={inputRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              className="w-full text-center outline-none break-words"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1.4rem",
                lineHeight: 1.5,
                padding: "0 1.25rem",
                color: "var(--note-text, inherit)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "100%",
                overflowY: "auto",
              }}
            />

            {!draft && (
              <span
                className="absolute inset-0 flex items-center justify-center text-center pointer-events-none"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1.4rem",
                  lineHeight: 1.5,
                  padding: "0 1.25rem",
                  color: "var(--note-muted, #b0a090)",
                  whiteSpace: "pre-wrap",
                }}
              >
                Escribe tu nota…
              </span>
            )}

            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/8 text-muted-foreground hover:text-foreground transition-colors z-10"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <motion.button
              initial={false}
              animate={{
                opacity: draft.trim() ? 1 : 0,
                scale: draft.trim() ? 1 : 0.8,
                y: draft.trim() ? 0 : 6,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={handleSend}
              disabled={!draft.trim()}
              style={{ pointerEvents: draft.trim() ? "auto" : "none" }}
              className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-3 py-1 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground text-[11px] font-medium transition-colors glass:text-white z-10"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </motion.button>
          </motion.div>
        ) : (
          <>
            {latestNote ? (
              <>
                <p className="m-0 px-5 text-center leading-relaxed text-2xl glass:text-white">
                  {latestNote.content}
                </p>
                <span className="absolute bottom-1.5 left-2.5 text-[11px] text-muted-foreground">
                  {formatNoteTime(latestNote.timestamp)}
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

            {previousNotes.length > 0 && (
              <button
                onClick={() => setHistoryOpen(true)}
                className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] text-muted-foreground hover:text-foreground hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ScrollTextIcon size={11} />
              </button>
            )}

            <button
              onClick={startEditing}
              className="absolute bottom-2 right-2 p-1.5 rounded-full text-primary-foreground hover:bg-primary hover:shadow-lg hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              title="Enviar nota"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <div style={foldOuter} />
        <div style={foldInner} />

        {!editing && onToggleCompact && (
          <button
            onClick={onToggleCompact}
            className="absolute top-2 left-2 p-1 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300"
            title={isCompact ? "Expandir" : "Compactar"}
          >
            <Maximize2 className={`w-3 h-3 ${isCompact ? "" : "rotate-90"}`} />
          </button>
        )}
      </div>

      {/* ── Drawer historial ── */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div
              className="absolute inset-0 z-10 rounded-md"
              style={{
                background: "rgba(0,0,0,0.15)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setHistoryOpen(false);
                setExpandedNote(null);
              }}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 z-20 flex flex-col rounded-t-xl border-t border-x overflow-hidden"
              style={{
                ...paperStyle,
                boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
                maxHeight: "78%",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <AnimatePresence mode="wait">
                {expandedNote ? (
                  /* ── Vista expandida ── */
                  <motion.div
                    key="expanded"
                    className="flex flex-col overflow-hidden"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 shrink-0">
                      <button
                        onClick={() => setExpandedNote(null)}
                        className="p-1 -ml-1 rounded-full hover:bg-black/8 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowLeftIcon size={13} />
                      </button>
                      <span
                        className="text-[10px] text-muted-foreground"
                        style={{ fontFamily: "'Caveat', cursive" }}
                      >
                        {formatNoteTime(expandedNote.timestamp)}
                      </span>
                    </div>

                    <div
                      className="mx-3 mb-2 h-px"
                      style={{ background: "var(--note-border, #e8dcc8)" }}
                    />

                    {/* Contenido scrollable */}
                    <div
                      className="mx-3 mb-3 rounded-lg overflow-y-auto"
                      style={{
                        background: "rgba(0,0,0,0.06)",
                        border: "1px solid var(--note-border, #e8dcc8)",
                        maxHeight: "calc(78vh - 52px - 1.75rem)",
                        minHeight: "60px",
                      }}
                    >
                      <p
                        className="m-0 p-4 leading-relaxed"
                        style={{
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.3rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {expandedNote.content}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Vista lista ── */
                  <motion.div
                    key="list"
                    className="flex flex-col flex-1 overflow-hidden"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
                      <span
                        className="font-medium glass:text-white"
                        style={{
                          fontFamily: "'Caveat', cursive",
                          fontSize: "1.1rem",
                        }}
                      >
                        Notas anteriores
                      </span>
                      <button
                        onClick={() => setHistoryOpen(false)}
                        className="p-1 rounded-full hover:bg-black/8 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>

                    <div
                      className="mx-4 mb-2 h-px"
                      style={{ background: "var(--note-border, #e8dcc8)" }}
                    />

                    <div className="overflow-y-auto flex flex-col gap-2 px-4 pb-4">
                      {previousNotes.map((note, i) => (
                        <motion.div
                          key={note.id}
                          className="relative rounded-md border px-3 py-2.5 cursor-pointer active:scale-[0.98] transition-transform"
                          style={{
                            ...paperStyle,
                            background: `color-mix(in oklch, var(--note-bg, #fdf9f0) ${Math.round((1 - i * 0.18) * 100)}%, transparent)`,
                            opacity: 1,
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setExpandedNote(note)}
                        >
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 0,
                              height: 0,
                              borderStyle: "solid",
                              borderWidth: "0 0 12px 12px",
                              borderColor:
                                "transparent transparent var(--note-border, #e8dcc8) transparent",
                            }}
                          />
                          <p className="m-0 text-lg leading-snug pr-12 line-clamp-2 glass:text-white">
                            {note.content}
                          </p>
                          <span
                            className="absolute bottom-1.5 right-4 text-[10px]"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {formatNoteTime(note.timestamp)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
