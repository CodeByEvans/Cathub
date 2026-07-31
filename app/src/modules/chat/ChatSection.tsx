import { ChatMessageList } from "./components/ChatMessageList";
import { ChatInput } from "./components/ChatInput";
import { Message } from "./@types/chat.types";

interface ChatSectionProps {
  partnerName: string;
  messages: Message[];
  sendChatMessage: (message: string) => void;
  isConnected?: boolean;
  unreadFromIndex?: number;
  partnerTyping?: boolean;
  onTypingChange?: (typing: boolean) => void;
}

export function ChatSection({
  partnerName,
  messages,
  sendChatMessage,
  isConnected = true,
  unreadFromIndex,
  partnerTyping,
  onTypingChange,
}: ChatSectionProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ChatMessageList
        messages={messages}
        partnerName={partnerName}
        unreadFromIndex={unreadFromIndex}
        partnerTyping={partnerTyping}
      />
      <ChatInput
        onSend={sendChatMessage}
        onTypingChange={onTypingChange}
        disabled={!isConnected}
      />
    </div>
  );
}
