import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";
import { ThemeColor, ThemeType } from "../@types/settings.types";
import {
  ControlsPosition,
  SectionId,
  SectionLayout,
  DateFormat,
  ClockFormat,
} from "@/@types/window.types";

const THEMES: ThemeType[] = ["light", "dark", "glass"];
const BEHAVIORS = ["widget", "app", "floating"] as const;
const CONTROLS_POSITIONS: ControlsPosition[] = ["left", "right"];
const SECTION_IDS: SectionId[] = ["clock", "date", "weather", "call"];
const DATE_FORMATS: DateFormat[] = ["full", "short"];
const CLOCK_FORMATS: ClockFormat[] = ["24h", "12h"];

export type WindowBehavior = (typeof BEHAVIORS)[number];

export const DEFAULT_THEME: ThemeType = "light";
export const DEFAULT_THEME_COLOR: ThemeColor = "#3b82f6";
export const DEFAULT_BEHAVIOR: WindowBehavior = "app";
export const DEFAULT_CONTROLS_POSITION: ControlsPosition = "right";
export const DEFAULT_SECTION_LAYOUT: SectionLayout = {
  left: ["date", "clock", "weather"],
  right: ["call"],
};
export const DEFAULT_DATE_FORMAT: DateFormat = "full";
export const DEFAULT_CLOCK_FORMAT: ClockFormat = "24h";

/**
 * Dueño único del patrón leer-validar-fallback de la configuración persistida
 * (antes copiado a mano en `theme.service` y `window.service`). Los services
 * quedan solo con los side-effects (DOM/Tauri).
 */
export const settingsRepository = {
  async getTheme(): Promise<ThemeType> {
    const stored = await storageProvider.get(STORE_KEYS.theme);
    return stored && THEMES.includes(stored as ThemeType)
      ? (stored as ThemeType)
      : DEFAULT_THEME;
  },

  async setTheme(theme: ThemeType): Promise<void> {
    await storageProvider.set(STORE_KEYS.theme, theme);
  },

  async getColor(): Promise<ThemeColor> {
    return (await storageProvider.get(STORE_KEYS.themeColor)) ?? DEFAULT_THEME_COLOR;
  },

  async setColor(color: ThemeColor): Promise<void> {
    await storageProvider.set(STORE_KEYS.themeColor, color);
  },

  async resetColor(): Promise<void> {
    await storageProvider.delete(STORE_KEYS.themeColor);
  },

  async getWindowBehavior(): Promise<WindowBehavior> {
    const stored = await storageProvider.get(STORE_KEYS.windowBehavior);
    return stored && BEHAVIORS.includes(stored as WindowBehavior)
      ? (stored as WindowBehavior)
      : DEFAULT_BEHAVIOR;
  },

  async setWindowBehavior(behavior: WindowBehavior): Promise<void> {
    await storageProvider.set(STORE_KEYS.windowBehavior, behavior);
  },

  async getCompactWindowSize(): Promise<{
    width: number;
    height: number;
  } | null> {
    const saved = await storageProvider.get(STORE_KEYS.compactWindowSize);
    if (typeof saved?.width === "number" && typeof saved?.height === "number") {
      return { width: saved.width, height: saved.height };
    }
    return null;
  },

  async setCompactWindowSize(size: {
    width: number;
    height: number;
  }): Promise<void> {
    await storageProvider.set(STORE_KEYS.compactWindowSize, size);
  },

  async getCompactMode(): Promise<boolean> {
    return (await storageProvider.get(STORE_KEYS.compactMode)) === true;
  },

  async setCompactMode(mode: boolean): Promise<void> {
    await storageProvider.set(STORE_KEYS.compactMode, mode);
  },

  async getWindowControlsPosition(): Promise<ControlsPosition> {
    const stored = await storageProvider.get(STORE_KEYS.windowControlsPosition);
    return stored && CONTROLS_POSITIONS.includes(stored as ControlsPosition)
      ? (stored as ControlsPosition)
      : DEFAULT_CONTROLS_POSITION;
  },

  async setWindowControlsPosition(position: ControlsPosition): Promise<void> {
    await storageProvider.set(STORE_KEYS.windowControlsPosition, position);
  },

  async getSectionLayout(): Promise<SectionLayout> {
    const stored = await storageProvider.get(STORE_KEYS.sectionLayout);
    if (!stored || !Array.isArray(stored.left) || !Array.isArray(stored.right)) {
      return DEFAULT_SECTION_LAYOUT;
    }
    const valid = (list: string[]): SectionId[] =>
      list.filter((id): id is SectionId => SECTION_IDS.includes(id as SectionId));
    const layout = { left: valid(stored.left), right: valid(stored.right) };

    // Si falta alguna pieza (p. ej. por un estado corrupto), devolver el default.
    const flat = [...layout.left, ...layout.right];
    const complete = SECTION_IDS.every((id) => flat.includes(id));
    return complete ? layout : DEFAULT_SECTION_LAYOUT;
  },

  async setSectionLayout(layout: SectionLayout): Promise<void> {
    await storageProvider.set(STORE_KEYS.sectionLayout, layout);
  },

  async getHiddenSections(): Promise<SectionId[]> {
    const stored = await storageProvider.get(STORE_KEYS.hiddenSections);
    if (!Array.isArray(stored)) return [];
    return stored.filter(
      (id): id is SectionId =>
        SECTION_IDS.includes(id as SectionId) && id !== "call",
    );
  },

  async setHiddenSections(sections: SectionId[]): Promise<void> {
    const valid = sections.filter((id) => id !== "call");
    await storageProvider.set(STORE_KEYS.hiddenSections, valid);
  },

  async getDateFormat(): Promise<DateFormat> {
    const stored = await storageProvider.get(STORE_KEYS.dateFormat);
    return stored && DATE_FORMATS.includes(stored as DateFormat)
      ? (stored as DateFormat)
      : DEFAULT_DATE_FORMAT;
  },

  async setDateFormat(format: DateFormat): Promise<void> {
    await storageProvider.set(STORE_KEYS.dateFormat, format);
  },

  async getClockFormat(): Promise<ClockFormat> {
    const stored = await storageProvider.get(STORE_KEYS.clockFormat);
    return stored && CLOCK_FORMATS.includes(stored as ClockFormat)
      ? (stored as ClockFormat)
      : DEFAULT_CLOCK_FORMAT;
  },

  async setClockFormat(format: ClockFormat): Promise<void> {
    await storageProvider.set(STORE_KEYS.clockFormat, format);
  },

  async getWeatherBorder(): Promise<boolean> {
    const stored = await storageProvider.get(STORE_KEYS.weatherBorder);
    return stored === null ? true : stored === true;
  },

  async setWeatherBorder(border: boolean): Promise<void> {
    await storageProvider.set(STORE_KEYS.weatherBorder, border);
  },

  async getWeatherIconColor(): Promise<string> {
    return (await storageProvider.get(STORE_KEYS.weatherIconColor)) ?? "";
  },

  async setWeatherIconColor(color: string): Promise<void> {
    await storageProvider.set(STORE_KEYS.weatherIconColor, color);
  },
};
