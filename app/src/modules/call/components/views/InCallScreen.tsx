import { useState, useEffect, ReactNode, useRef } from "react";
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
import CathubLogoWidget from "@/globals/components/atoms/logo-widget";

import { ChatSection } from "@/modules/chat/ChatSection";
import { windowService } from "@/modules/settings/services";
import { useChat } from "@/hooks/useChat";
import { AnimatePresence, motion } from "framer-motion";

interface CallScreenProps {
  partnerName: string;
  partnerAvatar?: string;
  onEndCall?: () => void;
  settingsButton?: ReactNode;
}

const FULL_SIZE = { width: 700, height: 200 };
const MINI_SIZE = { width: 280, height: 60 };

export function InCallScreen({
  partnerName = "Pareja",
  partnerAvatar,
  onEndCall,
  settingsButton,
}: CallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadFromIndex, setUnreadFromIndex] = useState<number | undefined>(
    undefined,
  );
  const appWindow = getCurrentWindow();

  const { messages, sendChatMessage } = useChat();

  const isMinimizedRef = useRef(isMinimized);
  isMinimizedRef.current = isMinimized;

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    const newLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;

    if (newLength > prevLength && isMinimizedRef.current) {
      // Primera vez que llegan mensajes minimizado — fija el separador
      if (unreadCount === 0) {
        setUnreadFromIndex(prevLength);
      }
      setUnreadCount((c) => c + (newLength - prevLength));
    }

    prevMessagesLengthRef.current = newLength;
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(
      () => setCallDuration((prev) => prev + 1),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const resizeWindow = async (width: number, height: number) => {
    await appWindow.setSize(new LogicalSize(width, height));
  };

  const minimize = async () => {
    setIsMinimized(true);
    appWindow.setAlwaysOnTop(true);
    await resizeWindow(MINI_SIZE.width, MINI_SIZE.height);
  };

  const restore = async () => {
    setIsMinimized(false);
    setUnreadCount(0);
    setUnreadFromIndex(undefined);
    await windowService.restoreBehavior();
    await resizeWindow(FULL_SIZE.width, FULL_SIZE.height);
  };

  const toggleMute = () => {
    if (isDeafened) {
      setIsDeafened(false);
      setIsMuted(false);
      return;
    }
    setIsMuted((prev) => !prev);
  };

  const toggleDeafed = () => {
    if (isMuted && !isDeafened) {
      setIsDeafened(true);

      return;
    }
    setIsMuted((prev) => !prev);
    setIsDeafened((prev) => !prev);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Minimized bubble ──────────────────────────────────────────
  if (isMinimized) {
    return (
      <>
        <style>{`
          @keyframes miniTailWag {
            0%   { transform: rotate(-14deg); }
            50%  { transform: rotate( 14deg); }
            100% { transform: rotate(-14deg); }
          }
        `}</style>
        <main
          className="w-[280px] h-[60px] rounded-2xl overflow-hidden flex items-center gap-3 px-4 bg-background border border-border/50 shadow-xl relative"
          data-tauri-drag-region
        >
          {/* Soft glow ping */}
          <span className="absolute inset-0 rounded-2xl bg-primary/8 animate-ping opacity-20 pointer-events-none" />

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 ring-2 ring-primary/30 flex items-center justify-center overflow-hidden">
              {partnerAvatar ? (
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CathubLogoWidget size="sm" className="w-5 h-5" />
              )}
            </div>
            {/* tiny tail */}
            <span
              className="absolute -right-2 bottom-0.5 text-primary/50 text-xs select-none pointer-events-none"
              style={{
                transformOrigin: "left center",
                animation: "miniTailWag 0.9s ease-in-out infinite",
              }}
            >
              〜
            </span>
            {/* online dot */}
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-online rounded-full border border-background" />
          </div>

          {/* Info */}
          <div
            className="flex flex-col items-start flex-1 min-w-0"
            data-tauri-drag-region
          >
            <span className="text-xs font-semibold text-white truncate">
              {partnerName}
            </span>
            <span className="text-[10px] text-primary font-mono tabular-nums">
              {formatTime(callDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--primary)",
                    boxShadow:
                      "0 0 0 2px color-mix(in oklch, var(--primary) 30%, transparent)",
                  }}
                >
                  <span className="text-[10px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={restore}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              title="Restaurar"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </main>
      </>
    );
  }

  // ── Full view ─────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes catGlow {
          0%, 100% { opacity: 0.6; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.04); }
        }
        @keyframes tailWag {
          0%   { transform: rotate(-18deg); }
          50%  { transform: rotate( 18deg); }
          100% { transform: rotate(-18deg); }
        }
      `}</style>

      <main
        className="w-[700px] h-[200px] rounded-2xl border border-border/50 shadow-xl overflow-hidden relative flex items-center bg-background"
        data-tauri-drag-region
      >
        {settingsButton && (
          <div className="absolute top-1 right-1 z-10">{settingsButton}</div>
        )}

        {/* Soft primary glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 20% 50%, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
            animation: "catGlow 3s ease-in-out infinite",
          }}
        />

        {/* ── LEFT: Avatar + name + timer ── */}
        <div
          className="flex items-center gap-4 shrink-0 px-7"
          data-tauri-drag-region
        >
          <div className="relative flex items-center justify-center">
            {/* Pulse ring */}
            <div
              className="absolute rounded-full border-2 border-primary/20"
              style={{
                width: "72px",
                height: "72px",
                animation: "catGlow 2s ease-in-out infinite",
              }}
            />

            {/* Avatar */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-primary/10 ring-2 ring-primary/40 flex items-center justify-center overflow-hidden">
              {partnerAvatar ? (
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CathubLogoWidget size="sm" className="w-8 h-8" />
              )}
            </div>

            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 z-20 w-3 h-3 bg-online rounded-full border-2 border-background" />

            {/* Wagging tail */}
            <span
              className="absolute -right-3 bottom-1 text-primary/60 select-none pointer-events-none text-base"
              style={{
                transformOrigin: "left center",
                animation: "tailWag 0.9s ease-in-out infinite",
              }}
            >
              〜
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-white leading-none">
              {partnerName}
            </p>
            <p className="text-[11px] font-mono tabular-nums text-primary font-semibold leading-none">
              {formatTime(callDuration)}
            </p>
            <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">
              En llamada
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-border/40 mx-1" />

        {/* ── CENTER: Chat ── */}
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden px-2">
          <ChatSection
            messages={messages}
            sendChatMessage={sendChatMessage}
            partnerName={partnerName}
            unreadFromIndex={unreadFromIndex}
          />
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-border/40 mx-1" />

        {/* ── RIGHT: Controls ── */}
        <div className="flex items-center gap-1.5 shrink-0 px-4">
          {/* Mute */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full border-2 transition-colors",
              isMuted
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border hover:border-primary/40 text-muted-foreground",
            )}
            onClick={toggleMute}
            title={isMuted ? "Desmutear" : "Mutear"}
          >
            {isMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Deafen */}
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full border-2 transition-colors",
              isDeafened
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border hover:border-primary/40 text-muted-foreground",
            )}
            onClick={toggleDeafed}
            title={isDeafened ? "Desensordecer" : "Ensordecer"}
          >
            {isDeafened ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          {/* Hang up */}
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 transition-all hover:scale-110 active:scale-95"
            onClick={onEndCall}
            title="Colgar"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>

          <div className="w-px self-stretch bg-border/40 mx-0.5" />

          {/* Minimize */}
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
    </>
  );
}
