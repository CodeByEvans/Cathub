import { cn } from "@/lib/utils";

import { CallButton } from "../molecules/CallButton";
import ReactTimeAgo from "react-time-ago";
import "react-time-ago/locale/es";
import { usePresence } from "@/modules/presence/context/PresenceContext";

export function CallSection() {
  const { isOnline, lastSeen } = usePresence();

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
        {!isOnline && lastSeen && (
          <ReactTimeAgo
            date={lastSeen}
            locale="es"
            className="text-[10px] text-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}
