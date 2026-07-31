import { logger } from "@/shared/logger";
import { AppError } from "@/shared/errors/AppError";
import {
  DEFAULT_THEME,
  DEFAULT_THEME_COLOR,
  settingsRepository,
} from "./settings.repository";
import { ThemeColor, ThemeType } from "../@types/settings.types";

interface ThemeState {
  theme: ThemeType;
}

const COLOR_KEYS = [
  "--primary",
  "--primary-foreground",
  "--accent",
  "--ring",
  "--call-button",
] as const;

const DEFAULT_COLOR = DEFAULT_THEME_COLOR;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function colorToRgb(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "255 255 255";
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

function contrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.65 ? "#0a0a0a" : "#ffffff";
}

function lightenColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = 0.35;
  const r = Math.round(rgb.r * (1 - mix) + 255 * mix);
  const g = Math.round(rgb.g * (1 - mix) + 255 * mix);
  const b = Math.round(rgb.b * (1 - mix) + 255 * mix);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function applyColorToDOM(color: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary", color);
  root.style.setProperty("--primary-foreground", contrastColor(color));
  root.style.setProperty("--accent", lightenColor(color));
  root.style.setProperty("--ring", color);
  root.style.setProperty("--call-button", color);
  root.style.setProperty("--primary-rgb", colorToRgb(color));
}

function removeColorFromDOM() {
  const root = document.documentElement;
  for (const key of COLOR_KEYS) {
    root.style.removeProperty(key);
  }
  root.style.removeProperty("--primary-rgb");
}

class ThemeService {
  private theme: ThemeType = DEFAULT_THEME;
  private themes: ThemeType[] = ["light", "dark", "glass"];
  private themeColor: ThemeColor = DEFAULT_COLOR;

  currentTheme(): ThemeType {
    return this.theme;
  }

  currentThemeColor(): ThemeColor {
    return this.themeColor;
  }

  async getTheme(): Promise<ThemeState> {
    try {
      this.theme = await settingsRepository.getTheme();

      document.documentElement.classList.remove(...this.themes);
      document.documentElement.classList.add(this.theme);

      return { theme: this.theme };
    } catch (error) {
      logger.warn("theme", "Error al obtener el tema, usando claro", error);
      return { theme: DEFAULT_THEME };
    }
  }

  async setTheme(theme: ThemeType) {
    if (!this.themes.includes(theme)) {
      throw new AppError("settings/theme-failed", {
        message: `Tema no válido: ${theme}`,
      });
    }
    try {
      await settingsRepository.setTheme(theme);

      document.documentElement.classList.remove(...this.themes);
      document.documentElement.classList.add(theme);

      this.theme = theme;
    } catch (error) {
      throw new AppError("settings/theme-failed", { cause: error });
    }
  }

  async getColor(): Promise<ThemeColor> {
    try {
      const color = await settingsRepository.getColor();
      this.themeColor = color;
      applyColorToDOM(color);
      return color;
    } catch (error) {
      logger.warn("theme", "Error al obtener el color, usando default", error);
      this.themeColor = DEFAULT_COLOR;
      applyColorToDOM(DEFAULT_COLOR);
      return DEFAULT_COLOR;
    }
  }

  async setColor(color: ThemeColor) {
    try {
      await settingsRepository.setColor(color);
      applyColorToDOM(color);
      this.themeColor = color;
    } catch (error) {
      throw new AppError("settings/color-failed", { cause: error });
    }
  }

  async resetColor() {
    try {
      await settingsRepository.resetColor();
      removeColorFromDOM();
      this.themeColor = DEFAULT_COLOR;
      applyColorToDOM(DEFAULT_COLOR);
    } catch (error) {
      throw new AppError("settings/color-failed", { cause: error });
    }
  }
}

export const themeService = new ThemeService();
