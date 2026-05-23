import { toast } from "sonner";
import { getValue, setValue } from "@/services/store.service";
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

const DEFAULT_COLOR = "#3b82f6";

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
  private theme: ThemeType = "light";
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
      const storedTheme = (await getValue("theme")) as ThemeType | null;

      this.theme =
        storedTheme && this.themes.includes(storedTheme)
          ? storedTheme
          : "light";

      document.documentElement.classList.remove(...this.themes);
      document.documentElement.classList.add(this.theme);

      return { theme: this.theme };
    } catch (error) {
      toast.error(
        "Error al obtener el tema, se usará el tema claro por defecto.",
      );
      return { theme: "light" };
    }
  }

  async setTheme(theme: ThemeType) {
    if (!this.themes.includes(theme)) {
      toast.error("Tema no válido");
      return;
    }
    try {
      await setValue("theme", theme);

      document.documentElement.classList.remove(...this.themes);
      document.documentElement.classList.add(theme);

      this.theme = theme;
    } catch (error) {
      toast.error("Error al guardar el tema, no se pudo cambiar.");
    }
  }

  async getColor(): Promise<ThemeColor> {
    try {
      const color = (await getValue("themeColor")) as ThemeColor | null;

      if (color) {
        this.themeColor = color;
        applyColorToDOM(color);
        return color;
      }

      this.themeColor = DEFAULT_COLOR;
      applyColorToDOM(DEFAULT_COLOR);
      return DEFAULT_COLOR;
    } catch (error) {
      toast.error(
        "Error al obtener el color, se usará el color por defecto.",
      );
      this.themeColor = DEFAULT_COLOR;
      applyColorToDOM(DEFAULT_COLOR);
      return DEFAULT_COLOR;
    }
  }

  async setColor(color: ThemeColor) {
    try {
      await setValue("themeColor", color);
      applyColorToDOM(color);
      this.themeColor = color;
    } catch (error) {
      toast.error("Error al guardar el color, no se pudo cambiar.");
    }
  }

  async resetColor() {
    try {
      await setValue("themeColor", null);
      removeColorFromDOM();
      this.themeColor = DEFAULT_COLOR;
      applyColorToDOM(DEFAULT_COLOR);
    } catch (error) {
      toast.error("Error al reiniciar el color.");
    }
  }
}

export const themeService = new ThemeService();
