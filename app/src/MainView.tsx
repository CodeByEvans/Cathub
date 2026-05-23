import { ClockSection } from "./modules/clock/components/ClockSection";
import { NotesSection } from "./modules/notes/components/NotesSection";
import { CallSection } from "./modules/call/components/organisms/CallSection";
import { Button } from "./globals/components/atoms/button";
import { Settings, Maximize2 } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import LinkModal from "./modules/connection/components/LinkModal";
import React from "react";
import { useConnection } from "./modules/connection/contexts/ConnectionContext";
import { ColorPickerPanel } from "./modules/settings/components/organisms/ColorPickerPanel";
import { motion, AnimatePresence } from "framer-motion";

interface MainViewProps {
  onSimulateIncomingCall: () => void;
  onSimulateInCall: () => void;
  onSimulateOutgoingCall: () => void;
  showColorPicker: boolean;
  onOpenColorPicker: () => void;
  onCloseColorPicker: () => void;
  isCompact: boolean;
  onToggleCompact: () => void;
}

export function MainView({
  onSimulateIncomingCall,
  onSimulateInCall,
  onSimulateOutgoingCall,
  showColorPicker,
  onOpenColorPicker,
  onCloseColorPicker,
  isCompact,
  onToggleCompact,
}: MainViewProps) {
  const { isLinked } = useConnection();
  const [showSettings, setShowSettings] = React.useState(false);

  const handleOpenColorPicker = () => {
    setShowSettings(false);
    onOpenColorPicker();
  };

  const getWidth = () => {
    if (showColorPicker) return "w-[940px]";
    if (isCompact) return "w-full";
    return "w-[700px]";
  };

  return (
    <main
      className={`rounded-xl border border-border/50 shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
        isCompact ? "p-0 w-full h-screen" : "py-4 h-[200px]"
      } ${getWidth()}`}
      data-tauri-drag-region
    >
      {/* Full-mode top buttons */}
      {!showColorPicker && !isCompact && (
        <div className="absolute top-1 right-1 z-10 flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCompact}
            className="h-6 w-6 text-muted-foreground/40 hover:text-foreground transition-colors"
            title="Compactar"
          >
            <Maximize2 className="w-3 h-3 rotate-90" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="h-6 w-6 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenColorPicker={handleOpenColorPicker}
      />

      {!isLinked && <LinkModal />}

      <AnimatePresence mode="wait">
        {isCompact ? (
          <motion.section
            key="compact"
            className="group h-full relative"
            data-tauri-drag-region
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <NotesSection isCompact />

            <button
              onClick={onToggleCompact}
              className="absolute bottom-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              title="Expandir"
            >
              <Maximize2 className="w-3 h-3 text-muted-foreground/60" />
            </button>
          </motion.section>
        ) : (
          <motion.section
            key="full"
            className="flex h-full divide-x divide-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
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
          </motion.section>
        )}
      </AnimatePresence>

      {import.meta.env.DEV && !isCompact && (
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
