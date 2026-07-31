import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CathubLogoWidget from "@/shared/components/atoms/logo-widget";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { Message } from "../@types/chat.types";

interface ChatMessageListProps {
  messages: Message[];
  partnerName: string;
  unreadFromIndex?: number; // índice donde empiezan los no leídos
  partnerTyping?: boolean;
}

export function ChatMessageList({
  messages,
  partnerName,
  unreadFromIndex,
  partnerTyping,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  if (messages.length === 0) {
    return (
      <motion.div
        className="flex flex-1 flex-col items-center justify-center gap-1 px-4 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <CathubLogoWidget size="sm" className="w-9 h-9" />
        <p className="text-[11px] text-muted-foreground leading-tight">
          Todavía no hay mensajes… di miau 🐾
        </p>
        <p className="text-[9px] text-muted-foreground/60">
          Enter para enviar
        </p>
      </motion.div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 scrollbar-none"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0, black 18px)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 18px)",
      }}
    >
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
      <AnimatePresence>
        {partnerTyping && <TypingIndicator partnerName={partnerName} />}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
