// hooks/useChat.ts
import { peerService } from "@/services/peer.service";
import { useEffect, useState } from "react";
import { Message } from "@/modules/chat/@types/chat.types";
import { audioService } from "@/services/audio.service";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    peerService.onChatMessageReceived((message) => {
      setMessages((prev) => [
        ...prev,
        { sender: "partner", message, timestamp: Date.now() },
      ]);
      audioService.play("incomingNote", { volume: 0.1 });
    });

    return () => peerService.onChatMessageReceived(() => {}); // limpia el callback al desmontar
  }, []);

  const sendChatMessage = async (message: string) => {
    try {
      await peerService.sendChatMessage(message);
      setMessages((prev) => [
        ...prev,
        { sender: "me", message, timestamp: Date.now() },
      ]);
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
    }
  };

  return { messages, sendChatMessage };
};
