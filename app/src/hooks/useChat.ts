import { useEffect, useState } from "react";
import { Message } from "@/modules/chat/@types/chat.types";
import { audioService } from "@/services/audio.service";
import { logger } from "@/shared/logger";
import { useCall } from "@/modules/call/context/CallContext";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const { onChatMessage, calls, partnerTyping } = useCall();

  useEffect(() => {
    onChatMessage((message) => {
      setMessages((prev) => [
        ...prev,
        { sender: "partner", message, timestamp: Date.now() },
      ]);
      audioService.play("incomingNote", { volume: 0.1 });
    });

    return () =>
      onChatMessage(() => {
        {
        }
      }); // limpia el callback al desmontar
  }, []);

  const sendChatMessage = async (message: string) => {
    try {
      await calls.sendChatMessage(message);
      setMessages((prev) => [
        ...prev,
        { sender: "me", message, timestamp: Date.now() },
      ]);
    } catch (error) {
      logger.error("chat", "Error enviando mensaje", error);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    calls.sendTypingStatus(isTyping);
  };

  return { messages, sendChatMessage, partnerTyping, sendTypingStatus };
};
