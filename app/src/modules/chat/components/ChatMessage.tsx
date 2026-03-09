import { Message } from "../@types/chat.types";

interface ChatMessageProps {
  message: Message;
  partnerName: string;
}

export function ChatMessage({ message, partnerName }: ChatMessageProps) {
  const isMe = message.sender === "me";

  const time = new Date(message.timestamp).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3 py-1.5 rounded-2xl text-sm leading-relaxed break-words ${
            isMe
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          }`}
        >
          {message.message}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {isMe ? "tú" : partnerName} · {time}
        </span>
      </div>
    </div>
  );
}
