import "./App.css";
import { useState, useEffect } from "react";
import { IncomingCallModal } from "./modules/call/components/views/IncomingCallModal";
import { InCallScreen } from "./modules/call/components/views/InCallScreen";
import { Button } from "./shared/components/atoms/button";
import { YarnBall } from "./shared/components/atoms/yarn-ball";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { useClampOnMouseUp } from "./hooks/useClampOnMouseUp";
import { MainView } from "./MainView";
import { useSettings } from "./hooks/useSettings";
import { OutgoingCallModal } from "./modules/call/components/views/OutgoingCallModal";
import { useCall } from "./modules/call/context/CallContext";
import { windowService } from "./modules/settings/services/window.service";
import { IntroScreen } from "./components/IntroScreen";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ControlsPosition } from "./@types/window.types";

function App() {
  const { showSettings, openSettings, closeSettings } = useSettings();
  const { calls, callState } = useCall();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidgetsEditor, setShowWidgetsEditor] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [controlsPosition, setControlsPosition] = useState<ControlsPosition>(
    windowService.getControlsPosition(),
  );

  useEffect(() => {
    getCurrentWindow().show();
  }, []);

  useEffect(() => {
    windowService.loadControlsPosition().then(setControlsPosition);
  }, []);

  useEffect(() => {
    windowService
      .loadCompactMode()
      .then((compact) => {
        if (compact) {
          setIsCompact(true);
          windowService.enableCompactMode();
        }
      })
      .catch(() => {});
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
    setShowWidgetsEditor(false);
    setShowColorPicker(true);
    await windowService.expandForColorPicker();
  };

  const closeColorPicker = async () => {
    setShowColorPicker(false);
    await windowService.restoreFromColorPicker(isCompact);
  };

  const openWidgetsEditor = async () => {
    setShowColorPicker(false);
    setShowWidgetsEditor(true);
    await windowService.expandForWidgets();
  };

  const closeWidgetsEditor = async () => {
    setShowWidgetsEditor(false);
    await windowService.restoreFromWidgets(isCompact);
  };

  const toggleCompact = async () => {
    if (showColorPicker) {
      await closeColorPicker();
    }
    if (showWidgetsEditor) {
      await closeWidgetsEditor();
    }
    const next = !isCompact;
    setIsCompact(next);
    await windowService.saveCompactMode(next);

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
              <YarnBall className="w-4 h-4" />
            </Button>
          }
        />
        <SettingsPage
          isOpen={showSettings}
          onClose={closeSettings}
          controlsPosition={controlsPosition}
          onControlsPositionChange={setControlsPosition}
        />
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
        showWidgetsEditor={showWidgetsEditor}
        onOpenWidgetsEditor={openWidgetsEditor}
        onCloseWidgetsEditor={closeWidgetsEditor}
        isCompact={isCompact}
        onToggleCompact={toggleCompact}
        controlsPosition={controlsPosition}
        onControlsPositionChange={setControlsPosition}
      />
    </>
  );
}

export default App;
