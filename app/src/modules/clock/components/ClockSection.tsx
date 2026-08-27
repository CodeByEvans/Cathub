import { useState, useEffect } from "react";
import { useWidgetSettings } from "@/modules/widgets/context/WidgetSettingsContext";

export function ClockSection() {
  const [time, setTime] = useState(new Date());
  const { clockFormat } = useWidgetSettings();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    if (clockFormat === "12h") {
      const hour = date.getHours() % 12 || 12;
      const minute = date.getMinutes().toString().padStart(2, "0");
      return `${hour}:${minute}`;
    }
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="text-4xl font-bold text-primary tracking-tight whitespace-nowrap">
        {formatTime(time)}
      </div>
    </div>
  );
}
