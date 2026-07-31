import "./App.css";
import { useState, useEffect } from "react";
import { IncomingCallModal } from "./modules/call/components/views/IncomingCallModal";
import { InCallScreen } from "./modules/call/components/views/InCallScreen";
import { Button } from "./shared/components/atoms/button";
import { Settings } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { useClampOnMouseUp } from "./hooks/useClampOnMouseUp";
import { MainView } from "./MainView";
import { useSettings } from "./hooks/useSettings";
import { OutgoingCallModal } from "./modules/call/components/views/OutgoingCallModal";
import { useCall } from "./modules/call/context/CallContext";
import { windowService } from "./modules/settings/services/window.service";
import { IntroScreen } from "./components/IntroScreen";
import { getCurrentWindow } from "@tauri-apps/api/window";

function App() {
  const { showSettings, openSettings, closeSettings } = useSettings();
  const { calls, callState } = useCall();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    getCurrentWindow().show();
  }, []);

  useEffect(() => {
    if (introDone) {
      document.documentElement.style.backgroundColor = "";
    }
  }, [introDone]);

  useClampOnMouseUp();

  useEffect(() => {
    if (callState === "incoming" && isCompact) {
      toggleCompact();
    }
  }, [callState]);

  const openColorPicker = async () => {
    setShowColorPicker(true);
    await windowService.expandForColorPicker();
  };

  const closeColorPicker = async () => {
    setShowColorPicker(false);
    await windowService.restoreFromColorPicker(isCompact);
  };

  const toggleCompact = async () => {
    if (showColorPicker) {
      await closeColorPicker();
    }
    const next = !isCompact;
    setIsCompact(next);

    if (next) {
      await windowService.enableCompactMode();
    } else {
      await windowService.disableCompactMode();
    }
  };

  useEffect(() => {
    if (isCompact) {
      windowService.startCompactResizeListener();
    }
    return () => {
      windowService.stopCompactResizeListener();
    };
  }, [isCompact]);

  if (!introDone) {
    return (
      <IntroScreen onExitStart={() => {}} onDone={() => setIntroDone(true)} />
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
        isCompact={isCompact}
        onToggleCompact={toggleCompact}
      />
    </>
  );
}

export default App;
