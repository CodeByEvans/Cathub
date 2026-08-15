import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPeerService } from "../services/peer";
import { toast } from "@/components/ui/sonner";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { ICallActions } from "../interfaces/ICallActions";
import { IDeviceActions } from "../interfaces/IDeviceActions";
import { CallState } from "../types";

type CallContextType = {
  callState: CallState;
  partnerId: string;
  calls: ICallActions;
  devices: IDeviceActions;
  onChatMessage: (cb: (message: string) => void) => void;
  errorMessage: string | null;
  partnerMuted: boolean;
  partnerDeafened: boolean;
  partnerTyping: boolean;
};

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [isReady, setIsReady] = useState(false);
  const [partnerMuted, setPartnerMuted] = useState(false);
  const [partnerDeafened, setPartnerDeafened] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moduleRef = useRef<Awaited<
    ReturnType<typeof createPeerService>
  > | null>(null);

  useEffect(() => {
    createPeerService()
      .then((service) => {
        moduleRef.current = service;
        service.events.onIncomingCall(() => setCallState("incoming"));
        service.events.onOutgoingCall(() => setCallState("outgoing"));
        service.events.onCallConnected(() => setCallState("inCall"));
        service.events.onCallEnded(() => {
          setCallState("idle");
          setPartnerMuted(false);
          setPartnerDeafened(false);
          setPartnerTyping(false);
        });
        service.events.onErrorMessage((msg) => {
          setErrorMessage(msg);
          setCallState("idle");
        });
        service.events.onPartnerMuted((muted) => setPartnerMuted(muted));
        service.events.onPartnerDeafened((deafened) => setPartnerDeafened(deafened));
        service.events.onPartnerTyping((typing) => {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          setPartnerTyping(typing);
          if (typing) {
            // Red de seguridad: si el "false" se pierde, auto-limpiar a los 5s
            typingTimeoutRef.current = setTimeout(
              () => setPartnerTyping(false),
              5000,
            );
          }
        });
        setIsReady(true);
      })
      .catch((error) => handleAppError(error, "call", "call/failed"));

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      moduleRef.current?.signaling.stop();
    };
  }, []);

  // Drenar el canal de errores de llamada al sistema de toasts
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage]);

  if (!isReady || !moduleRef.current) return null;

  const module = moduleRef.current;
  const callActions: ICallActions = {
    startCall: (audioOnly = true) =>
      module.calls.startCall(
        audioOnly,
        module.devices.getMicConstraints(),
        module.devices.speakerId,
      ),
    acceptCall: (audioOnly = true) =>
      module.calls.acceptCall(
        audioOnly,
        module.devices.getMicConstraints(),
        module.devices.speakerId,
      ),
    endCall: () => module.calls.endCall(),
    rejectCall: () => module.calls.rejectCall(),
    cancelCall: () => module.calls.cancelCall(),
    toggleMute: () => module.calls.toggleMute(),
    toggleDeaf: () => module.calls.toggleDeaf(),
    toggleVideo: () => module.calls.toggleVideo(),
    sendChatMessage: (msg) => module.calls.sendChatMessage(msg),
    sendTypingStatus: (isTyping) => module.calls.sendTypingStatus(isTyping),
    simulateIncomingCall: () => module.calls.simulateIncomingCall(),
    simulateInCall: () => module.calls.simulateInCall(),
    simulateOutgoingCall: () => module.calls.simulateOutgoingCall(),
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        calls: callActions,
        devices: module.devices,
        partnerId: module.partnerId,
        onChatMessage: (cb) => module.events.onChatMessage(cb),
        errorMessage,
        partnerMuted,
        partnerDeafened,
        partnerTyping,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCall debe usarse dentro de CallProvider");
  return context;
};
