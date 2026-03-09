import { useEffect, useRef } from "react";

import { ChatMessage } from "./ChatMessage";
import { Message } from "../@types/chat.types";

interface ChatMessageListProps {
  messages: Message[];
  partnerName: string;
}

export function ChatMessageList({
  messages,
  partnerName,
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
      {messages.map((message) => (
        <ChatMessage
          key={message.timestamp}
          message={message}
          partnerName={partnerName}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
