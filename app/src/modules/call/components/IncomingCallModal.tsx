import { useState, useEffect } from "react";
import { Phone, PhoneOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { CathubLogo } from "@/globals/components/atoms/logo";
import { Button } from "@/globals/components/atoms/button";

export type WidgetSize = "lg" | "md" | "sm";

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string;
  isVisible: boolean;
  onAccept: () => void;
  onReject: () => void;
  size?: WidgetSize;
}

export function IncomingCallModal({
  callerName,
  callerAvatar,
  isVisible,
  onAccept,
  onReject,
  size = "lg",
}: IncomingCallModalProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setElapsed(0);
      return;
    }
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isVisible]);

  // Auto-reject after 30 seconds
  useEffect(() => {
    if (elapsed >= 30 && isVisible) {
      onReject();
    }
  }, [elapsed, isVisible, onReject]);

  if (!isVisible) return null;

  const sizeClasses = {
    lg: "w-[700px] h-[200px]",
    md: "w-[400px] h-[200px]",
    sm: "w-[300px] h-[150px]",
  };

  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        sizeClasses[size],
        "absolute inset-0 z-50 bg-card/98 glass-effect rounded-xl border border-border/50 shadow-2xl overflow-hidden",
        "animate-in fade-in zoom-in-95 duration-300",
      )}
    >
      {/* Pulsing ring background effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-primary/5 animate-ping" />
      </div>

      <div
        className={cn(
          "relative flex items-center justify-center h-full",
          isSmall ? "px-3 gap-3" : "px-6 gap-6",
        )}
      >
        {/* Caller info */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div
            className={cn(
              "rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/30 animate-pulse",
              isSmall ? "w-10 h-10" : "w-14 h-14",
            )}
          >
            {callerAvatar ? (
              <img
                src={callerAvatar}
                alt={callerName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <CathubLogo
                size="sm"
                className={isSmall ? "w-6 h-6" : "w-8 h-8"}
              />
            )}
          </div>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "font-semibold text-foreground",
                isSmall ? "text-xs" : "text-sm",
              )}
            >
              {callerName}
            </span>
            <span
              className={cn(
                "text-muted-foreground",
                isSmall ? "text-[9px]" : "text-xs",
              )}
            >
              Llamada entrante...
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className={cn("flex gap-4", isSmall ? "gap-3" : "gap-5")}>
          {/* Reject */}
          <div className="flex flex-col items-center gap-1">
            <Button
              onClick={onReject}
              className={cn(
                "rounded-full p-0 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95",
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                isSmall ? "w-10 h-10" : "w-14 h-14",
              )}
            >
              <PhoneOff className={isSmall ? "w-4 h-4" : "w-5 h-5"} />
              <span className="sr-only">Rechazar llamada</span>
            </Button>
            <span
              className={cn(
                "text-muted-foreground",
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
                "rounded-full p-0 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95",
                "bg-online hover:bg-online/90 text-call-button-foreground",
                isSmall ? "w-10 h-10" : "w-14 h-14",
              )}
            >
              <Phone className={isSmall ? "w-4 h-4" : "w-5 h-5"} />
              <span className="sr-only">Aceptar llamada</span>
            </Button>
            <span
              className={cn(
                "text-muted-foreground",
                isSmall ? "text-[8px]" : "text-[10px]",
              )}
            >
              Aceptar
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="absolute bottom-2 right-3">
          <span
            className={cn(
              "text-muted-foreground tabular-nums",
              isSmall ? "text-[8px]" : "text-[10px]",
            )}
          >
            {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
            {String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
