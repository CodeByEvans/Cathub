import { ClockSection } from "./modules/clock/components/ClockSection";
import { NotesSection } from "./modules/notes/components/NotesSection";
import { CallSection } from "./modules/call/components/organisms/CallSection";
import { Button } from "./globals/components/atoms/button";
import { Settings } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import LinkModal from "./modules/connection/components/LinkModal";
import React from "react";
import { useConnection } from "./modules/connection/contexts/ConnectionContext";
import { ColorPickerPanel } from "./modules/settings/components/organisms/ColorPickerPanel";

interface MainViewProps {
  onSimulateIncomingCall: () => void;
  onSimulateInCall: () => void;
  onSimulateOutgoingCall: () => void;
  showColorPicker: boolean;
  onOpenColorPicker: () => void;
  onCloseColorPicker: () => void;
}

export function MainView({
  onSimulateIncomingCall,
  onSimulateInCall,
  onSimulateOutgoingCall,
  showColorPicker,
  onOpenColorPicker,
  onCloseColorPicker,
}: MainViewProps) {
  const { isLinked } = useConnection();
  const [showSettings, setShowSettings] = React.useState(false);

  const handleOpenColorPicker = () => {
    setShowSettings(false);
    onOpenColorPicker();
  };

  return (
    <main
      className={`h-[200px] rounded-xl border border-border/50 shadow-xl overflow-hidden py-4 ${
        showColorPicker ? "w-[940px]" : "w-[700px]"
      }`}
      data-tauri-drag-region
    >
      {!showColorPicker && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          className="absolute top-1 right-1 z-10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings />
        </Button>
      )}

      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenColorPicker={handleOpenColorPicker}
      />

      {!isLinked && <LinkModal />}

      <section className="flex h-full divide-x divide-border/30">
        <div
          className={
            showColorPicker
              ? "flex divide-x divide-border/30 flex-1 min-w-0"
              : "flex divide-x divide-border/30 flex-1"
          }
        >
          <ClockSection />
          <NotesSection />
          <CallSection />
        </div>

        {showColorPicker && (
          <ColorPickerPanel onClose={onCloseColorPicker} />
        )}
      </section>

      {import.meta.env.DEV && (
        <div className="absolute bottom-2 left-2 z-50 flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
            onClick={onSimulateIncomingCall}
            title="Simular entrante"
          >
            📞
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
            onClick={onSimulateInCall}
            title="Simular en llamada"
          >
            🎙
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-5 h-5 text-[10px] opacity-30 hover:opacity-100 transition-opacity"
            onClick={onSimulateOutgoingCall}
            title="Simular saliente"
          >
            📲
          </Button>
        </div>
      )}
    </main>
  );
};
