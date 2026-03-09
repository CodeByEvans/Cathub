import { callService } from "@/modules/call/services/call.service";
import { appService } from "@/services/app.service";
import { useEffect, useState } from "react";

export const useAppInit = () => {
  const [userLinked, setUserLinked] = useState<boolean>(true);
  const [partnerName, setPartnerName] = useState<string>("Amor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const [inCall, setInCall] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const state = await appService.initialize();
        setUserLinked(state.isLinked);
        setPartnerName(state.partnerName);

        callService.onIncomingCall(() => setIncomingCall(true));
        callService.onCallConnected(() => setInCall(true));
        callService.onCallEnded(() => setInCall(false));
      } catch (error) {
        console.error("❌ Error inicializando app:", error);
        setUserLinked(false);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    return () => callService.destroy();
  }, []);

  return {
    isLoading,
    userLinked,
    partnerName,
    incomingCall,
    setIncomingCall,
    inCall,
    setInCall,
  };
};
