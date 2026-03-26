import { createContext, useContext, useEffect, useState } from "react";
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
};

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [callState, setCallState] = useState<CallState>("idle");
  const [peerModule, setPeerModule] = useState<Awaited<
    ReturnType<typeof createPeerService>
  > | null>(null);

  useEffect(() => {
    createPeerService().then((module) => {
      module.events.onIncomingCall(() => setCallState("incoming"));
      module.events.onOutgoingCall(() => setCallState("outgoing"));
      module.events.onCallConnected(() => setCallState("inCall"));
      module.events.onCallEnded(() => setCallState("idle"));
      setPeerModule(module);
    });

    return () => peerModule?.connection.destroy();
  }, []);

  if (!peerModule) return null;

  const callActions: ICallActions = {
    startCall: (audioOnly = true) =>
      peerModule.calls.startCall(
        peerModule.connection.getPeer(),
        peerModule.partnerId,
        audioOnly,
        peerModule.devices.getMicConstraints(),
        peerModule.devices.speakerId,
      ),
    acceptCall: (audioOnly = true) =>
      peerModule.calls.acceptCall(
        audioOnly,
        peerModule.devices.getMicConstraints(),
        peerModule.devices.speakerId,
      ),
    endCall: () => peerModule.calls.endCall(),
    rejectCall: () => peerModule.calls.rejectCall(),
    cancelCall: () => peerModule.calls.cancelCall(),
    toggleMute: () => peerModule.calls.toggleMute(),
    toggleDeaf: () => peerModule.calls.toggleDeaf(),
    toggleVideo: () => peerModule.calls.toggleVideo(),
    sendChatMessage: (msg) => peerModule.calls.sendChatMessage(msg),
    simulateIncomingCall: () => peerModule.calls.simulateIncomingCall(),
    simulateInCall: () => peerModule.calls.simulateInCall(),
    simulateOutgoingCall: () => peerModule.calls.simulateOutgoingCall(),
  };

  // los callbacks van aquí
  peerModule.events.onIncomingCall(() => setCallState("incoming"));

  return (
    <CallContext.Provider
      value={{
        callState,
        calls: callActions,
        devices: peerModule.devices,
        partnerId: peerModule.partnerId,
        onChatMessage: (cb) => peerModule.events.onChatMessage(cb),
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
