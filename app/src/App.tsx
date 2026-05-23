import "./App.css";
import { useState, useEffect, useRef } from "react";
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
import { invoke } from "@tauri-apps/api/core";
import { getValue, setValue } from "@/services/store.service";

const MAIN_SIZE = new LogicalSize(700, 200);
const EXPANDED_SIZE = new LogicalSize(940, 200);
const DEFAULT_COMPACT = { width: 420, height: 200 };

async function loadCompactSize(): Promise<{ width: number; height: number }> {
  try {
    const saved = await getValue("compactWindowSize");
    if (saved && typeof saved === "object") {
      const s = saved as Record<string, unknown>;
      if (typeof s.width === "number" && typeof s.height === "number") {
        return { width: s.width, height: s.height };
      }
    }
  } catch {}
  return DEFAULT_COMPACT;
}

async function saveCompactSize(width: number, height: number) {
  try {
    await setValue("compactWindowSize", { width, height });
  } catch {}
}

function App() {
  const { isLoading } = useAppInit();
  const { showSettings, openSettings, closeSettings } = useSettings();
  const { calls, callState } = useCall();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const compactSizeRef = useRef(DEFAULT_COMPACT);

  useClampOnMouseUp();

  const openColorPicker = () => {
    setShowColorPicker(true);
    getCurrentWindow().setSize(EXPANDED_SIZE);
  };

  const closeColorPicker = () => {
    setShowColorPicker(false);
    getCurrentWindow().setSize(isCompact ? new LogicalSize(compactSizeRef.current.width, compactSizeRef.current.height) : MAIN_SIZE);
  };

  const toggleCompact = async () => {
    if (showColorPicker) {
      closeColorPicker();
    }
    const next = !isCompact;
    setIsCompact(next);

    const win = getCurrentWindow();
    if (next) {
      const saved = await loadCompactSize();
      compactSizeRef.current = saved;
      await invoke("set_window_resizable", { resizable: true });
      await invoke("set_window_min_size", { width: 280, height: 120 });
      await invoke("set_window_max_size", { width: 700, height: 400 });
      await win.setSize(new LogicalSize(saved.width, saved.height));
    } else {
      await invoke("set_window_min_size", { width: 0, height: 0 });
      await invoke("set_window_max_size", { width: 5000, height: 5000 });
      await invoke("set_window_resizable", { resizable: false });
      await win.setSize(MAIN_SIZE);
    }
  };

  useEffect(() => {
    if (!isCompact) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleResize = async () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const win = getCurrentWindow();
          const size = await win.outerSize();
          const logicalSize = size.toLogical(await win.scaleFactor());
          compactSizeRef.current = { width: Math.round(logicalSize.width), height: Math.round(logicalSize.height) };
          await saveCompactSize(logicalSize.width, logicalSize.height);
        } catch {}
      }, 500);
    };

    const win = getCurrentWindow();
    const unlisten = win.onResized(handleResize);

    return () => {
      unlisten.then((fn) => fn());
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [isCompact]);

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
        isCompact={isCompact}
        onToggleCompact={toggleCompact}
      />
    </>
  );
}

export default App;
