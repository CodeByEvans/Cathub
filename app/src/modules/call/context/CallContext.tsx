import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPeerService } from "../services/peer";
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
};

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [isReady, setIsReady] = useState(false);
  const moduleRef = useRef<Awaited<
    ReturnType<typeof createPeerService>
  > | null>(null);

  useEffect(() => {
    createPeerService().then((service) => {
      moduleRef.current = service;
      service.events.onIncomingCall(() => setCallState("incoming"));
      service.events.onOutgoingCall(() => setCallState("outgoing"));
      service.events.onCallConnected(() => setCallState("inCall"));
      service.events.onCallEnded(() => setCallState("idle"));
      service.events.onErrorMessage((msg) => {
        setErrorMessage(msg);
        setCallState("idle");
      });
      setIsReady(true);
    });

    return () => moduleRef.current?.connection.destroy();
  }, []);

  if (!isReady || !moduleRef.current) return null;

  const module = moduleRef.current;
  const callActions: ICallActions = {
    startCall: (audioOnly = true) =>
      module.calls.startCall(
        module.connection.getPeer(),
        module.partnerId,
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
