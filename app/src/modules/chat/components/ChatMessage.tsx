import { motion } from "framer-motion";
import { Message } from "../@types/chat.types";

interface ChatMessageProps {
  message: Message;
  partnerName: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isMe = message.sender === "me";

  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8, scale: 0.95, x: isMe ? 6 : -6 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <div
        className={`flex items-end gap-1.5 max-w-[80%] px-3 py-1.5 rounded-2xl text-xs leading-relaxed break-words ${
          isMe
            ? "bg-primary text-primary-foreground rounded-br-sm shadow-[0_2px_12px_hsl(var(--primary)/0.25)]"
            : "bg-secondary/80 text-foreground border border-border/40 rounded-bl-sm"
        }`}
      >
        <span>{message.message}</span>
        <span
          className={`text-[9px] font-mono tabular-nums shrink-0 ${
            isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"
          }`}
        >
          {time}
        </span>
      </div>
    </motion.div>
  );
}
