import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message } from "../@types/chat.types";

interface ChatMessageListProps {
  messages: Message[];
  partnerName: string;
  unreadFromIndex?: number; // índice donde empiezan los no leídos
}

export function ChatMessageList({
  messages,
  partnerName,
  unreadFromIndex,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-xs text-muted-foreground italic">
          Sin mensajes aún...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 scrollbar-none">
      {messages.map((message, i) => (
        <div key={message.timestamp}>
          {/* Separador estilo WhatsApp */}
          {unreadFromIndex !== undefined && i === unreadFromIndex && (
            <div className="flex items-center gap-2 my-1">
              <div
                className="flex-1 h-px"
                style={{ background: "var(--primary)", opacity: 0.4 }}
              />
              <span
                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  color: "var(--primary)",
                  background:
                    "color-mix(in oklch, var(--primary) 12%, transparent)",
                }}
              >
                nuevos
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "var(--primary)", opacity: 0.4 }}
              />
            </div>
          )}
          <ChatMessage message={message} partnerName={partnerName} />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
