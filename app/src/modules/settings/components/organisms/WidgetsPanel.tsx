import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetSettings } from "@/modules/widgets/context/WidgetSettingsContext";
import { themeService } from "../../services/theme.service";
import { ColorWheel, hexToHsl } from "./ColorWheel";
import { SectionId, DateFormat, ClockFormat } from "@/@types/window.types";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors shrink-0",
        on ? "bg-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
          on && "translate-x-4",
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
            value === o.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function WidgetCard({
  title,
  visible,
  onToggle,
  locked,
  children,
}: {
  title: string;
  visible: boolean;
  onToggle?: () => void;
  locked?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-secondary/30 p-2.5 shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-secondary-foreground glass:text-white">
          {title}
        </span>
        {locked ? (
          <span className="text-[9px] text-muted-foreground">Siempre visible</span>
        ) : (
          <Toggle on={visible} onChange={onToggle!} />
        )}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

export function WidgetsPanel({ onClose }: { onClose: () => void }) {
  const {
    hiddenSections,
    toggleHidden,
    dateFormat,
    setDateFormat,
    clockFormat,
    setClockFormat,
    weatherBorder,
    setWeatherBorder,
    weatherIconColor,
    setWeatherIconColor,
  } = useWidgetSettings();

  const defaultColor = themeService.currentThemeColor();
  const [color, setColor] = useState(weatherIconColor || defaultColor);
  const [lightness, setLightness] = useState(
    () => hexToHsl(weatherIconColor || defaultColor)[2],
  );

  const isCustomColor = weatherIconColor !== "";

  const handleColorChange = (hex: string) => {
    setColor(hex);
    setWeatherIconColor(hex);
  };

  const handleModeChange = (mode: "theme" | "custom") => {
    if (mode === "theme") {
      setWeatherIconColor("");
      setColor(defaultColor);
      setLightness(hexToHsl(defaultColor)[2]);
    } else {
      const next = weatherIconColor || defaultColor;
      setWeatherIconColor(next);
      setColor(next);
      setLightness(hexToHsl(next)[2]);
    }
  };

  const isHidden = (id: SectionId) => hiddenSections.includes(id);

  return (
    <motion.div
      className="w-[280px] h-full flex flex-col border-l border-border/30 relative shrink-0"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-0.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <span className="text-[10px] tracking-wide uppercase text-muted-foreground text-center pt-3 mb-1">
        Widgets
      </span>

      <div className="h-full overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {/* Fecha */}
        <WidgetCard
          title="Fecha"
          visible={!isHidden("date")}
          onToggle={() => toggleHidden("date")}
        >
          <Segmented<DateFormat>
            options={[
              { value: "full", label: "mar, 25 ago" },
              { value: "short", label: "25 de agosto" },
            ]}
            value={dateFormat}
            onChange={setDateFormat}
          />
        </WidgetCard>

        {/* Reloj */}
        <WidgetCard
          title="Reloj"
          visible={!isHidden("clock")}
          onToggle={() => toggleHidden("clock")}
        >
          <Segmented<ClockFormat>
            options={[
              { value: "24h", label: "24 h" },
              { value: "12h", label: "12 h" },
            ]}
            value={clockFormat}
            onChange={setClockFormat}
          />
        </WidgetCard>

        {/* Clima */}
        <WidgetCard
          title="Clima"
          visible={!isHidden("weather")}
          onToggle={() => toggleHidden("weather")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Borde</span>
            <Toggle
              on={weatherBorder}
              onChange={() => setWeatherBorder(!weatherBorder)}
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Color</span>
            <Segmented<"theme" | "custom">
              options={[
                { value: "theme", label: "Tema" },
                { value: "custom", label: "Personalizado" },
              ]}
              value={isCustomColor ? "custom" : "theme"}
              onChange={handleModeChange}
            />
          </div>

          {isCustomColor && (
            <div className="flex items-center gap-3 mt-2">
              <ColorWheel
                color={color}
                onChange={handleColorChange}
                size={72}
                lightness={lightness}
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">Oscuro</span>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={lightness}
                    onChange={(e) => setLightness(Number(e.target.value))}
                    className="w-14 h-1 accent-primary"
                  />
                  <span className="text-[9px] text-muted-foreground">Claro</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const val = e.target.value;
                      setColor(val);
                      if (/^#[0-9a-fA-F]{6}$/.test(val)) setWeatherIconColor(val);
                    }}
                    className="w-[72px] h-5 rounded border border-border bg-secondary/50 px-1 text-[10px] text-foreground text-center font-mono outline-none focus:border-primary"
                    placeholder="#3b82f6"
                  />
                  <div
                    className="w-5 h-5 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          )}
        </WidgetCard>
      </div>
    </motion.div>
  );
}
