import { useState, useRef, useEffect } from "react";
import { SendHorizonal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onTypingChange?: (typing: boolean) => void;
  disabled?: boolean;
}

const TYPING_IDLE_MS = 2000;
const MAX_LEN = 200;
const COUNTER_FROM = 160;

export function ChatInput({
  onSend,
  onTypingChange,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const emitTyping = (typing: boolean) => {
    if (isTypingRef.current === typing) return;
    isTypingRef.current = typing;
    onTypingChange?.(typing);
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (newValue.trim().length > 0) {
      emitTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () => emitTyping(false),
        TYPING_IDLE_MS,
      );
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      emitTyping(false);
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(false);
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const hasText = value.trim().length > 0;

  return (
    <div className="px-2 py-1.5 border-t border-border/40">
      <div className="flex items-center gap-1 rounded-full bg-input/50 border border-border/50 pl-3 pr-1 py-1 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Escribe algo..."
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-40"
          maxLength={MAX_LEN}
        />
        {value.length > COUNTER_FROM && (
          <span className="text-[9px] font-mono tabular-nums text-muted-foreground shrink-0">
            {value.length}/{MAX_LEN}
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={disabled || !hasText}
          aria-label="Enviar mensaje"
          className={cn(
            "h-7 w-7 shrink-0 rounded-full flex items-center justify-center transition-all",
            hasText
              ? "bg-primary text-primary-foreground shadow-[0_2px_10px_hsl(var(--primary)/0.35)]"
              : "text-muted-foreground/40",
          )}
        >
          <SendHorizonal className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </div>
  );
}
