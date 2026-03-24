import "./App.css";
import { IncomingCallModal } from "./modules/call/components/views/IncomingCallModal";
import { InCallScreen } from "./modules/call/components/views/InCallScreen";
import { Button } from "./globals/components/atoms/button";
import { Settings } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { useClampOnMouseUp } from "./hooks/useClampOnMouseUp";
import { MainView } from "./MainView";
import { useSettings } from "./hooks/useSettings";
import { audioService } from "./services/audio.service";
import { peerService } from "./services/peer.service";
import { useAppInit } from "./hooks/useAppInit";
import { OutgoingCallModal } from "./modules/call/components/views/OutgoingCallModal";

function App() {
  const { userLinked, partnerName, callState, setCallState, isLoading } =
    useAppInit();
  const { showSettings, openSettings, closeSettings } = useSettings();

  useClampOnMouseUp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground rounded-xl">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-current border-t-transparent rounded-full mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (callState === "inCall") {
    return (
      <>
        <InCallScreen
          partnerName={partnerName}
          onEndCall={() => {
            peerService.endCall();
            setCallState("idle");
          }}
          settingsButton={
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettings}
              className="absolute top-1 right-1 z-10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings />
            </Button>
          }
        />
        <SettingsPage isOpen={showSettings} onClose={closeSettings} />
      </>
    );
  }

  if (callState === "outgoing") {
    return (
      <OutgoingCallModal
        calleeName={partnerName}
        isVisible
        onCancel={() => {
          peerService.stopRequestCall();
          setCallState("idle");
        }}
      />
    );
  }

  if (callState === "incoming") {
    return (
      <IncomingCallModal
        callerName={partnerName}
        isVisible
        onAccept={async () => {
          try {
            await peerService.acceptCall();
          } catch (err) {
            console.error("❌ Error aceptando llamada:", err);
            setCallState("idle");
          }
        }}
        onReject={() => {
          peerService.rejectCall();
          setCallState("idle");
        }}
        size="lg"
      />
    );
  }

  return (
    <>
      <MainView
        partnerName={partnerName}
        userLinked={userLinked}
        onSimulateIncomingCall={() => peerService.simulateIncomingCall()}
        onSimulateInCall={() => {
          peerService.simulateInCall();
          setCallState("inCall");
          audioService.play("callStarted", { volume: 0.3 });
        }}
        onSimulateOutgoingCall={() => {
          peerService.simulateOutgoingCall();
          setCallState("outgoing");
        }}
      />
    </>
  );
}

export default App;
