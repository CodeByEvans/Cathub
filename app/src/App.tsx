import "./App.css";
import { callService } from "./modules/call/services/call.service";
import { IncomingCallModal } from "./modules/call/components/views/IncomingCallModal";
import { CallScreen } from "./modules/call/components/views/CallScreen";
import { Button } from "./globals/components/atoms/button";
import { Settings } from "lucide-react";
import { SettingsPage } from "./modules/settings/SettingsPage";
import { useClampOnMouseUp } from "./hooks/useClampOnMouseUp";
import { MainView } from "./MainView";
import { useAppInit } from "./hooks/useAppInit";
import { useSettings } from "./hooks/useSettings";

function App() {
  const {
    isLoading,
    userLinked,
    partnerName,
    incomingCall,
    setIncomingCall,
    inCall,
    setInCall,
  } = useAppInit();

  const { showSettings, openSettings, closeSettings } = useSettings();

  useClampOnMouseUp(isLoading);

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

  if (incomingCall) {
    return (
      <div className="relative">
        <IncomingCallModal
          callerName={partnerName}
          isVisible={callService.isIncomingCall()}
          onAccept={() => {
            callService.acceptCall();
            setIncomingCall(false);
          }}
          onReject={() => {
            callService.rejectCall();
            setIncomingCall(false);
          }}
          size="lg"
        />
      </div>
    );
  }

  if (inCall) {
    return (
      <>
        <CallScreen
          partnerName={partnerName}
          onEndCall={() => {
            callService.endCall();
            setInCall(false);
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

  return (
    <MainView
      partnerName={partnerName}
      userLinked={userLinked}
      onSimulateIncomingCall={() => callService.simulateIncomingCall()}
      onSimulateInCall={() => {
        callService.simulateInCall();
        setInCall(true);
      }}
    />
  );
}

export default App;
