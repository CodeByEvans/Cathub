import { useEffect } from "react";
import "./App.css";

import { CallSection } from "./modules/call/components/CallSection";
import { ClockSection } from "./modules/clock/components/ClockSection";
import { NotesSection } from "./modules/notes/components/NotesSection";
import React from "react";
import LinkModal from "./modules/connection/components/LinkModal";
import { callService } from "./modules/call/services/call.service";
import { appService } from "./services/app.service";
import { IncomingCallModal } from "./modules/call/components/IncomingCallModal";
import { SettingsPanel } from "./modules/settings/components/Settings";
import { Button } from "./globals/components/atoms/button";
import { Settings } from "lucide-react";

function App() {
  const [userLinked, setUserLinked] = React.useState(true);
  const [partnerName, setPartnerName] = React.useState("Amor");
  const [isLoading, setIsLoading] = React.useState(true);
  const [incomingCall, setIncomingCall] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        // ✅ Una sola llamada que hace todo
        const state = await appService.initialize();

        setUserLinked(state.isLinked);
        setPartnerName(state.partnerName);

        callService.onIncomingCall(() => {
          console.log("📞 Estado React: llamada entrante");
          setIncomingCall(true);
        });

        console.log("✅ App inicializada:", state);
      } catch (error) {
        console.error("❌ Error inicializando app:", error);
        setUserLinked(false);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Cleanup al desmontar
    return () => {
      callService.destroy();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (incomingCall) {
    return (
      <div className="relative">
        <IncomingCallModal
          callerName={partnerName}
          isVisible={callService.isIncomingCall()}
          onAccept={async () => {
            callService.acceptCall();
            setIncomingCall(false);
          }}
          onReject={async () => {
            callService.rejectCall();
            setIncomingCall(false);
          }}
          size="lg"
        />
      </div>
    );
  }

  return (
    <main
      className="w-[700px] h-[200px] rounded-xl border border-border/50 shadow-xl overflow-hidden py-4"
      data-tauri-drag-region
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowSettings(true)}
        className="absolute top-1 right-1 z-10"
      >
        <Settings />
      </Button>
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onThemeChange={(theme) => console.log("Theme changed to:", theme)}
        onEditProfile={() => console.log("Edit profile")}
        onBreakConnection={() => console.log("Break connection")}
        onLogout={() => console.log("Logout")}
      />
      {userLinked ? null : <LinkModal />}
      {/* Clima + Reloj */}
      <section className="flex h-full divide-x divide-border/30">
        <ClockSection partnerName={partnerName} />

        <NotesSection />

        <CallSection />
      </section>
    </main>
  );
}

export default App;
