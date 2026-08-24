import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";
import { ThemeColor, ThemeType } from "../@types/settings.types";
import { ControlsPosition } from "@/@types/window.types";

const THEMES: ThemeType[] = ["light", "dark", "glass"];
const BEHAVIORS = ["widget", "app", "floating"] as const;
const CONTROLS_POSITIONS: ControlsPosition[] = ["left", "right"];

export type WindowBehavior = (typeof BEHAVIORS)[number];

export const DEFAULT_THEME: ThemeType = "light";
export const DEFAULT_THEME_COLOR: ThemeColor = "#3b82f6";
export const DEFAULT_BEHAVIOR: WindowBehavior = "app";
export const DEFAULT_CONTROLS_POSITION: ControlsPosition = "right";

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
};
