import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { presenceService } from "@/services/presence.service";
import { CallButton } from "../molecules/CallButton";
import ReactTimeAgo from "react-time-ago";
import "react-time-ago/locale/es";

export function CallSection() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastConnection, setLastConnection] = useState<Date | null>(null);

  useEffect(() => {
    const status = presenceService.getCurrentStatus();
    setIsOnline(status.isOnline);
    setLastConnection(status.lastSeen);

    presenceService.onStatusChange((status) => {
      setIsOnline(status.isOnline);
      setLastConnection(status.lastSeen);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 h-full min-w-[140px]">
      <CallButton isOnline={isOnline} />

      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-online animate-pulse" : "bg-offline",
            )}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {isOnline ? "En línea" : "Desconectado"}
          </span>
        </div>

        {/* ← formatLastConnection eliminado, ReactTimeAgo lo gestiona todo */}
        {!isOnline && lastConnection && (
          <ReactTimeAgo
            date={lastConnection}
            locale="es"
            className="text-[10px] text-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}
