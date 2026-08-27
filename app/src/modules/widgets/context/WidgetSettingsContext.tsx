import { createContext, useContext, useEffect, useState } from "react";
import { settingsRepository } from "@/modules/settings/services/settings.repository";
import { SectionId, DateFormat, ClockFormat } from "@/@types/window.types";

interface WidgetSettingsValue {
  hiddenSections: SectionId[];
  toggleHidden: (id: SectionId) => void;
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
  clockFormat: ClockFormat;
  setClockFormat: (format: ClockFormat) => void;
  weatherBorder: boolean;
  setWeatherBorder: (border: boolean) => void;
  weatherIconColor: string;
  setWeatherIconColor: (color: string) => void;
}

const WidgetSettingsContext = createContext<WidgetSettingsValue | null>(null);

export const WidgetSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hiddenSections, setHiddenSections] = useState<SectionId[]>([]);
  const [dateFormat, setDateFormatState] = useState<DateFormat>("full");
  const [clockFormat, setClockFormatState] = useState<ClockFormat>("24h");
  const [weatherBorder, setWeatherBorderState] = useState(true);
  const [weatherIconColor, setWeatherIconColorState] = useState("");

  useEffect(() => {
    Promise.all([
      settingsRepository.getHiddenSections(),
      settingsRepository.getDateFormat(),
      settingsRepository.getClockFormat(),
      settingsRepository.getWeatherBorder(),
      settingsRepository.getWeatherIconColor(),
    ])
      .then(([h, df, cf, wb, wic]) => {
        setHiddenSections(h);
        setDateFormatState(df);
        setClockFormatState(cf);
        setWeatherBorderState(wb);
        setWeatherIconColorState(wic);
      })
      .catch(() => {});
  }, []);

  const toggleHidden = (id: SectionId) => {
    setHiddenSections((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      settingsRepository.setHiddenSections(next).catch(() => {});
      return next;
    });
  };

  const setDateFormat = (format: DateFormat) => {
    setDateFormatState(format);
    settingsRepository.setDateFormat(format).catch(() => {});
  };

  const setClockFormat = (format: ClockFormat) => {
    setClockFormatState(format);
    settingsRepository.setClockFormat(format).catch(() => {});
  };

  const setWeatherBorder = (border: boolean) => {
    setWeatherBorderState(border);
    settingsRepository.setWeatherBorder(border).catch(() => {});
  };

  const setWeatherIconColor = (color: string) => {
    setWeatherIconColorState(color);
    settingsRepository.setWeatherIconColor(color).catch(() => {});
  };

  return (
    <WidgetSettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </WidgetSettingsContext.Provider>
  );
};

export const useWidgetSettings = () => {
  const ctx = useContext(WidgetSettingsContext);
  if (!ctx) {
    throw new Error("useWidgetSettings debe usarse dentro de WidgetSettingsProvider");
  }
  return ctx;
};
