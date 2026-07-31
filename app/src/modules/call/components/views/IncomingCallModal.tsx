import { useState, useEffect } from "react";
import { Phone, PhoneOff } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/shared/components/atoms/button";
import CathubLogoWidget from "@/shared/components/atoms/logo-widget";
import { PawTrail } from "../organisms/PawTrail";
import { useConnection } from "@/modules/connection/contexts/ConnectionContext";

export type WidgetSize = "lg" | "md" | "sm";

interface IncomingCallModalProps {
  callerAvatar?: string;
  isVisible: boolean;
  onAccept: () => void;
  onReject: () => void;
  size?: WidgetSize;
}

const TIMEOUT_SECONDS = 30;

export function IncomingCallModal({
  callerAvatar,
  isVisible,
  onAccept,
  onReject,
  size = "lg",
}: IncomingCallModalProps) {
  const [elapsed, setElapsed] = useState(0);

  const { partnerName } = useConnection();

  useEffect(() => {
    if (!isVisible) {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isVisible]);

  useEffect(() => {
    if (elapsed >= TIMEOUT_SECONDS && isVisible) onReject();
  }, [elapsed, isVisible, onReject]);

  if (!isVisible) return null;

  const isSmall = size === "sm";
  const progressPct = ((TIMEOUT_SECONDS - elapsed) / TIMEOUT_SECONDS) * 100;

  const wrapperClass = {
    lg: "w-[700px] h-[200px]",
    md: "w-[400px] h-[200px]",
    sm: "w-[300px] h-[150px]",
  }[size];

  const pawCount = isSmall ? 3 : 4;
  const pawSize = isSmall ? "w-5 h-5" : "w-7 h-7";
  const pawGap = isSmall ? "gap-3" : "gap-5";

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

      <div
        className={cn(
          wrapperClass,
          "absolute inset-0 z-50 overflow-hidden rounded-2xl shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-300",
          "bg-background border border-border/50",
        )}
      >
        {/* Soft primary glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 90% at 50% 50%, hsl(var(--primary) / 0.07) 0%, transparent 75%)",
            animation: "catGlow 3s ease-in-out infinite",
          }}
        />

        {/* Timeout progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-border/30 rounded-full">
          <div
            className="h-full rounded-full bg-primary/60 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div
          className={cn(
            "relative flex items-center h-full",
            isSmall ? "px-4 gap-3" : "px-8 gap-6",
          )}
        >
          {/* ── LEFT: Avatar + info ── */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Pulse ring */}
            {!isSmall && (
              <div
                className="absolute rounded-full border-2 border-primary/20"
                style={{
                  width: "72px",
                  height: "72px",
                  animation: "catGlow 2s ease-in-out infinite",
                }}
              />
            )}

            {/* Avatar */}
            <div
              className={cn(
                "relative z-10 rounded-full flex items-center justify-center",
                "bg-primary/10 ring-2 ring-primary/40",
                isSmall ? "w-10 h-10" : "w-14 h-14",
              )}
            >
              {callerAvatar ? (
                <img
                  src={callerAvatar}
                  alt={`Avatar de ${partnerName}`} // Accessibility: describe the image for screen readers
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <CathubLogoWidget
                  size="sm"
                  className={isSmall ? "w-6 h-6" : "w-8 h-8"}
                />
              )}
            </div>

            {/* Wagging tail */}
            {!isSmall && (
              <span
                className="absolute -right-3 bottom-1 text-primary/60 select-none pointer-events-none text-base"
                style={{
                  transformOrigin: "left center",
                  animation: "tailWag 0.9s ease-in-out infinite",
                }}
              >
                〜
              </span>
            )}
          </div>

          {/* Name + status + timer */}
          <div
            className={cn(
              "flex flex-col shrink-0",
              isSmall ? "gap-0.5" : "gap-1",
            )}
          >
            <span
              className={cn(
                "font-semibold text-foreground glass:text-muted-foreground leading-none",
                isSmall ? "text-xs" : "text-sm",
              )}
            >
              {partnerName}
            </span>
            <span
              className={cn(
                "font-medium leading-none text-primary",
                isSmall ? "text-[9px]" : "text-[11px]",
              )}
            >
              Llamada entrante...
            </span>
            <span
              className={cn(
                "tabular-nums leading-none text-muted-foreground/50",
                isSmall ? "text-[8px] mt-0.5" : "text-[10px] mt-1",
              )}
            >
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </span>
          </div>

          {/* ── CENTER: Bouncing paw trail ── */}
          <PawTrail
            count={pawCount}
            size={pawSize}
            className={cn("flex-1", pawGap)}
          />

          {/* ── RIGHT: Reject + Accept ── */}
          <div
            className={cn(
              "flex shrink-0 items-center",
              isSmall ? "gap-3" : "gap-4",
            )}
          >
            {/* Reject */}
            <div className="flex flex-col items-center gap-1">
              <Button
                onClick={onReject}
                className={cn(
                  "rounded-full p-0 shadow-md transition-all duration-200 hover:scale-110 active:scale-95",
                  "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                  isSmall ? "w-10 h-10" : "w-12 h-12",
                )}
              >
                <PhoneOff className={isSmall ? "w-4 h-4" : "w-5 h-5"} />
                <span className="sr-only">Rechazar llamada</span>
              </Button>
              <span
                className={cn(
                  "text-muted-foreground/70",
                  isSmall ? "text-[8px]" : "text-[10px]",
                )}
              >
                Rechazar
              </span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-1">
              <Button
                onClick={onAccept}
                className={cn(
                  "rounded-full p-0 shadow-md transition-all duration-200 hover:scale-110 active:scale-95",
                  "bg-online hover:bg-online/90 text-call-button-foreground",
                  isSmall ? "w-10 h-10" : "w-12 h-12",
                )}
              >
                <Phone className={isSmall ? "w-4 h-4" : "w-5 h-5"} />
                <span className="sr-only">Aceptar llamada</span>
              </Button>
              <span
                className={cn(
                  "text-muted-foreground/70",
                  isSmall ? "text-[8px]" : "text-[10px]",
                )}
              >
                Aceptar
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
