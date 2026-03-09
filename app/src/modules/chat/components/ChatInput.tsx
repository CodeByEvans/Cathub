import { useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/globals/components/atoms/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
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

  return (
    <div className="flex items-center gap-1.5 border-t border-border/40 px-2 py-1.5">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Escribe algo..."
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 disabled:opacity-40"
        maxLength={200}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <SendHorizonal className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
