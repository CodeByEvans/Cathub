import "./App.css";
import { useState } from "react";
import { IncomingCallModal } from "./modules/call/components/views/IncomingCallModal";
import { InCallScreen } from "./modules/call/components/views/InCallScreen";
import { Button } from "./globals/components/atoms/button";
import { Settings } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { useClampOnMouseUp } from "./hooks/useClampOnMouseUp";
import { MainView } from "./MainView";
import { useSettings } from "./hooks/useSettings";
import { useAppInit } from "./hooks/useAppInit";
import { OutgoingCallModal } from "./modules/call/components/views/OutgoingCallModal";
import { useCall } from "./modules/call/context/CallContext";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

const MAIN_SIZE = new LogicalSize(700, 200);
const EXPANDED_SIZE = new LogicalSize(940, 200);

function App() {
  const { isLoading } = useAppInit();
  const { showSettings, openSettings, closeSettings } = useSettings();
  const { calls, callState } = useCall();
  const [showColorPicker, setShowColorPicker] = useState(false);

  useClampOnMouseUp();

  const openColorPicker = () => {
    setShowColorPicker(true);
    getCurrentWindow().setSize(EXPANDED_SIZE);
  };

  const closeColorPicker = () => {
    setShowColorPicker(false);
    getCurrentWindow().setSize(MAIN_SIZE);
  };

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
          onEndCall={() => {
            calls.endCall();
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
        isVisible
        onCancel={() => {
          calls.cancelCall();
        }}
      />
    );
  }

  if (callState === "incoming") {
    return (
      <IncomingCallModal
        isVisible
        onAccept={() => {
          calls.acceptCall(true);
        }}
        onReject={() => {
          calls.rejectCall();
        }}
        size="lg"
      />
    );
  }

  return (
    <>
      <MainView
        onSimulateIncomingCall={() => calls.simulateIncomingCall?.()}
        onSimulateInCall={() => calls.simulateInCall?.()}
        onSimulateOutgoingCall={() => calls.simulateOutgoingCall?.()}
        showColorPicker={showColorPicker}
        onOpenColorPicker={openColorPicker}
        onCloseColorPicker={closeColorPicker}
      />
    </>
  );
}

export default App;
