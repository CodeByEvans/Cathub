import { peerService } from "@/services/peer.service";
import { appService } from "@/services/app.service";
import { useEffect, useState } from "react";

// useAppInit.ts
type CallState = "idle" | "incoming" | "outgoing" | "inCall";

export const useAppInit = () => {
  const [userLinked, setUserLinked] = useState<boolean>(true);
  const [partnerName, setPartnerName] = useState<string>("Amor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [callState, setCallState] = useState<CallState>("idle");

  useEffect(() => {
    const init = async () => {
      try {
        const state = await appService.initialize();
        setUserLinked(state.isLinked);
        setPartnerName(state.partnerName);

        peerService.onIncomingCall(() => setCallState("incoming"));
        peerService.onOutgoingCall(() => setCallState("outgoing"));
        peerService.onCallConnected(() => setCallState("inCall")); // limpia outgoing automáticamente
        peerService.onCallEnded(() => setCallState("idle"));
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

  return {
    isLoading,
    userLinked,
    partnerName,
    callState,
    setCallState,
  };
};
