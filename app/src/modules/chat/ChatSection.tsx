import { ChatMessageList } from "./components/ChatMessageList";
import { ChatInput } from "./components/ChatInput";
import { Message } from "./@types/chat.types";

interface ChatSectionProps {
  messages: Message[];
  partnerName: string;
  onSendMessage: (message: string) => void;
  isConnected?: boolean;
}

export function ChatSection({
  messages,
  partnerName,
  onSendMessage,
  isConnected = true,
}: ChatSectionProps) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ChatMessageList messages={messages} partnerName={partnerName} />
      <ChatInput onSend={onSendMessage} disabled={!isConnected} />
    </div>
  );
}
