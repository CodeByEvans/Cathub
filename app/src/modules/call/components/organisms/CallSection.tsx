import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";

import { presenceService } from "@/services/presence.service";

import { CallButton } from "../molecules/CallButton";

export function CallSection() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastConnection, setLastConnection] = useState<Date | null>(null);

  useEffect(() => {
    // Obtener estado inicial
    const status = presenceService.getCurrentStatus();
    setIsOnline(status.isOnline);
    setLastConnection(status.lastSeen);
    // Configurar callback
    presenceService.onStatusChange((status) => {
      setIsOnline(status.isOnline);
      setLastConnection(status.lastSeen);
    });
  }, []);

  const formatLastConnection = (date: Date | null) => {
    if (!date) return "Sin conexion";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora mismo";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days === 1) return "Ayer";
    return `Hace ${days} dias`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 h-full min-w-[140px]">
      {/* Call button */}
      <CallButton isOnline={isOnline} />

      {/* Timer de llamada o estado de conexión */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-col items-center gap-1 text-center">
          {/* Estado online/offline */}
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

          {/* Última conexión debajo */}
          {!isOnline && lastConnection && (
            <span className="text-[10px] text-muted-foreground">
              {formatLastConnection(lastConnection)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
