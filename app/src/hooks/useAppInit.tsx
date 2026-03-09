import { peerService } from "@/services/peer.service";
import { appService } from "@/services/app.service";
import { useEffect, useState } from "react";
import { Message } from "@/modules/chat/@types/chat.types";
import { audioService } from "@/services/audio.service";

export const useAppInit = () => {
  const [userLinked, setUserLinked] = useState<boolean>(true);
  const [partnerName, setPartnerName] = useState<string>("Amor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const [inCall, setInCall] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const state = await appService.initialize();
        setUserLinked(state.isLinked);
        setPartnerName(state.partnerName);

        peerService.onIncomingCall(() => setIncomingCall(true));
        peerService.onCallConnected(() => setInCall(true));
        peerService.onCallEnded(() => setInCall(false));
        peerService.onChatMessageReceived((message) => {
          const newMessage: Message = {
            sender: "partner",
            message,
            timestamp: Date.now(),
          };

          setMessages((prevMessages) => [...prevMessages, newMessage]);
          audioService.play("incomingNote", { volume: 0.1 });
        });
      } catch (error) {
        console.error("❌ Error inicializando app:", error);
        setUserLinked(false);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    return () => peerService.destroy();
  }, []);

  const sendChatMessage = async (message: string) => {
    try {
      await peerService.sendChatMessage(message);
      const newMessage: Message = {
        sender: "me",
        message,
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("❌ Error enviando mensaje de chat:", error);
    }
  };

  return {
    isLoading,
    userLinked,
    partnerName,
    incomingCall,
    setIncomingCall,
    inCall,
    setInCall,
    messages,
    sendChatMessage,
  };
};
