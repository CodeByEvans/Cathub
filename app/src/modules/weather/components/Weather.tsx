import { describeWeather } from "../constants/weather-codes";
import { useWeather } from "../hooks/useWeather";
import { useWidgetSettings } from "@/modules/widgets/context/WidgetSettingsContext";

const baseContainer = "rounded-xl bg-card/95 backdrop-blur-xl glass:bg-transparent px-3 py-2";

export function Weather() {
  const { temperature, weathercode, isDay, loading, error } = useWeather();
  const { weatherBorder, weatherIconColor } = useWidgetSettings();

  const containerClass = `${baseContainer} ${weatherBorder ? "border border-border/60" : ""}`;

  if (loading) {
    return (
      <div
        className={`${containerClass} flex items-center justify-center text-[10px] text-muted-foreground/70`}
      >
        Cargando clima…
      </div>
    );
  }

  if (error || temperature === null || weathercode === null) {
    return (
      <div className={`${containerClass} text-[10px] text-muted-foreground/50`}>
        —
      </div>
    );
  }

  const { icon: Icon } = describeWeather(weathercode, isDay);

  return (
    <div
      className={`${containerClass} flex items-center justify-between gap-3 min-w-[130px]`}
    >
      <div className="flex flex-col items-start leading-tight min-w-0">
        <span className="text-lg font-extralight text-secondary-foreground glass:text-white leading-none">
          {Math.round(temperature)}°C
        </span>
      </div>

      <div className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center shrink-0">
        <Icon
          className="w-4 h-4 text-primary"
          style={weatherIconColor ? { color: weatherIconColor } : undefined}
        />
      </div>
    </div>
  );
}
