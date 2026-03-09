import { useState, useEffect, ReactNode } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Minimize2,
  PhoneOff,
  Maximize2,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { cn } from "@/lib/utils";
import { Button } from "@/globals/components/atoms/button";

interface CallScreenProps {
  partnerName?: string;
  partnerAvatar?: string;
  onEndCall?: () => void;
  settingsButton?: ReactNode;
}

const FULL_SIZE = { width: 700, height: 200 };
const MINI_SIZE = { width: 280, height: 60 };

export function CallScreen({
  partnerName = "Pareja",
  partnerAvatar,
  onEndCall,
  settingsButton,
}: CallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resizeWindow = async (width: number, height: number) => {
    const win = getCurrentWindow();
    await win.setSize(new LogicalSize(width, height));
  };

  const minimize = async () => {
    setIsMinimized(true);
    await resizeWindow(MINI_SIZE.width, MINI_SIZE.height);
  };

  const restore = async () => {
    setIsMinimized(false);
    await resizeWindow(FULL_SIZE.width, FULL_SIZE.height);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const avatarInitial = partnerName.charAt(0).toUpperCase();

  // --- Minimized bubble ---
  if (isMinimized) {
    return (
      <main
        className="w-[280px] h-[60px] rounded-xl overflow-hidden flex items-center gap-3 px-4"
        data-tauri-drag-region
      >
        <span className="absolute inset-0 rounded-xl bg-primary/10 animate-ping opacity-30 pointer-events-none" />
        <div className="relative w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/30">
          {partnerAvatar ? (
            <img
              src={partnerAvatar}
              alt={partnerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-primary">
              {avatarInitial}
            </span>
          )}
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-background" />
        </div>
        <div
          className="flex flex-col items-start flex-1"
          data-tauri-drag-region
        >
          <span className="text-xs font-semibold text-foreground">
            {partnerName}
          </span>
          <span className="text-[10px] text-primary font-mono tabular-nums">
            {formatTime(callDuration)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={restore}
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          title="Restaurar"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
      </main>
    );
  }

  // --- Compact view ---
  return (
    <main
      className="w-[700px] h-[200px] rounded-xl border border-border/50 shadow-xl overflow-hidden py-4 relative flex items-center"
      data-tauri-drag-region
    >
      {settingsButton && (
        <div className="absolute top-1 right-1 z-10">{settingsButton}</div>
      )}

      {/* Left — avatar + name + timer */}
      <div className="flex items-center gap-2.5 shrink-0 px-4">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60" />
          <div className="relative w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
            {partnerAvatar ? (
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {avatarInitial}
              </span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
        </div>

        <div>
          <p className="text-sm font-bold text-foreground leading-tight">
            {partnerName}
          </p>
          <p className="text-xs font-mono tabular-nums text-primary font-semibold">
            {formatTime(callDuration)}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            En llamada
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-border/40 mx-1" />

      {/* Center — status badges */}
      <div className="flex-1 flex items-center justify-center gap-1.5 px-2">
        {isMuted ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive font-medium">
            Silenciado
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
            Activo
          </span>
        )}
        {isDeafened && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/30 text-destructive font-medium">
            Audio off
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-border/40 mx-1" />

      {/* Right — controls */}
      <div className="flex items-center gap-1.5 shrink-0 px-3">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full border-2 transition-colors",
            isMuted
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border hover:border-primary/40 text-muted-foreground",
          )}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Desmutear" : "Mutear"}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full border-2 transition-colors",
            isDeafened
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border hover:border-primary/40 text-muted-foreground",
          )}
          onClick={() => setIsDeafened(!isDeafened)}
          title={isDeafened ? "Desensordecer" : "Ensordecer"}
        >
          {isDeafened ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="icon"
          className="h-10 w-10 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
          onClick={onEndCall}
          title="Colgar"
        >
          <PhoneOff className="w-4 h-4" />
        </Button>

        <div className="w-px self-stretch bg-border/40 mx-0.5" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
          onClick={minimize}
          title="Minimizar"
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
      </div>
    </main>
  );
}
