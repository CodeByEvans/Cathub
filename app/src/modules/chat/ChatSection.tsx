import { ChatMessageList } from "./components/ChatMessageList";
import { ChatInput } from "./components/ChatInput";
import { Message } from "./@types/chat.types";

interface ChatSectionProps {
  partnerName: string;
  messages: Message[];
  sendChatMessage: (message: string) => void;
  isConnected?: boolean;
  unreadFromIndex?: number;
}

export function ChatSection({
  partnerName,
  messages,
  sendChatMessage,
  isConnected = true,
  unreadFromIndex,
}: ChatSectionProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ChatMessageList
        messages={messages}
        partnerName={partnerName}
        unreadFromIndex={unreadFromIndex}
      />
      <ChatInput onSend={sendChatMessage} disabled={!isConnected} />
    </div>
  );
}
