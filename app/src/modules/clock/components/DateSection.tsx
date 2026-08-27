import { useState, useEffect } from "react";
import { useWidgetSettings } from "@/modules/widgets/context/WidgetSettingsContext";

export function DateSection() {
  const [date, setDate] = useState(new Date());
  const { dateFormat } = useWidgetSettings();

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (value: Date) => {
    return dateFormat === "short"
      ? value.toLocaleDateString("es-ES", { day: "numeric", month: "long" })
      : value.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
        {formatDate(date)}
      </div>
    </div>
  );
}
