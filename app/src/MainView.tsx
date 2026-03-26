import { ClockSection } from "./modules/clock/components/ClockSection";
import { NotesSection } from "./modules/notes/components/NotesSection";
import { CallSection } from "./modules/call/components/organisms/CallSection";
import { Button } from "./globals/components/atoms/button";
import { Settings } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import LinkModal from "./modules/connection/components/LinkModal";
import React from "react";

interface MainViewProps {
  partnerName: string;
  userLinked: boolean;
  onSimulateIncomingCall: () => void;
  onSimulateInCall: () => void;
  onSimulateOutgoingCall: () => void;
}

export function MainView({
  partnerName,
  userLinked,
  onSimulateIncomingCall,
  onSimulateInCall,
  onSimulateOutgoingCall,
}: MainViewProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <main
      className="w-[700px] h-[200px] rounded-xl border border-border/50 shadow-xl overflow-hidden py-4"
      data-tauri-drag-region
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowSettings(true)}
        className="absolute top-1 right-1 z-10 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings />
      </Button>

      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {!userLinked && <LinkModal />}

      <section className="flex h-full divide-x divide-border/30">
        <ClockSection partnerName={partnerName} />
        <NotesSection />
        <CallSection />

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
      </section>
    </main>
  );
}
