import { cn } from "@/lib/utils";
import { CallButton } from "./CallButton";
import { useEffect, useState } from "react";
import { callService } from "../services/call.service";
import { presenceService } from "@/services/presence.service";

export function CallSection() {
  const [inCall, setInCall] = useState(false);
  const [callTime, setCallTime] = useState(0); // tiempo en segundos

  const [isOnline, setIsOnline] = useState(false);
  const [lastConnection, setLastConnection] = useState<Date | null>(null);

  // Conectar eventos de CallService con React
  useEffect(() => {
    callService.onCallConnected(() => {
      console.log("📞 Estado React: llamada conectada");
      setInCall(true);
      setCallTime(0); // reinicia contador
    });

    callService.onCallEnded(() => {
      console.log("📞 Estado React: llamada terminada");
      setInCall(false);
    });
  }, []);

  // Contador de llamada
  useEffect(() => {
    if (!inCall) return;

    const interval = setInterval(() => {
      setCallTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [inCall]);

  useEffect(() => {
    // Configurar callback
    presenceService.onStatusChange((status) => {
      setIsOnline(status.isOnline);
      setLastConnection(status.lastSeen);
    });

    // Obtener estado inicial
    presenceService.getCurrentStatus().then((status) => {
      setIsOnline(status.isOnline);
      setLastConnection(status.lastSeen);
    });
  }, []);

  // Formatear tiempo a mm:ss
  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

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
      <CallButton inCall={inCall} isOnline={isOnline} />

      {/* Timer de llamada o estado de conexión */}
      <div className="flex flex-col items-center gap-1">
        {inCall ? (
          <span className="text-xs font-medium ">
            {formatCallTime(callTime)}
          </span>
        ) : (
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
        )}
      </div>
    </div>
  );
}
