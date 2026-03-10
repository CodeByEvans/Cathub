import { ChatMessageList } from "./components/ChatMessageList";
import { ChatInput } from "./components/ChatInput";
import { useChat } from "@/hooks/useChat";

interface ChatSectionProps {
  partnerName: string;
  isConnected?: boolean;
}

export function ChatSection({
  partnerName,

  isConnected = true,
}: ChatSectionProps) {
  const { messages, sendChatMessage } = useChat();
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ChatMessageList messages={messages} partnerName={partnerName} />
      <ChatInput onSend={sendChatMessage} disabled={!isConnected} />
    </div>
  );
}
