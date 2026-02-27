import { toast } from "sonner";
import { getValue, setValue } from "@/services/store.service";
import { ThemeColor, ThemeType } from "../@types/settings.types";

interface ThemeState {
  theme: ThemeType;
}

class ThemeService {
  private theme: ThemeType = "light";
  private themes: ThemeType[] = ["light", "dark", "glass"];
  private themeColor: ThemeColor = "blue";

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
      const color = (await getValue("themeColor")) as ThemeColor;
      document.documentElement.setAttribute("data-color", color);

      this.themeColor = color;
      return color;
    } catch (error) {
      toast.error(
        "Error al obtener el color, se usara el color negro por defecto.",
      );
      return "blue";
    }
  }

  async setColor(color: ThemeColor) {
    try {
      await setValue("themeColor", color);

      document.documentElement.removeAttribute("data-color");
      document.documentElement.setAttribute("data-color", color);

      this.themeColor = color;
    } catch (error) {
      toast.error("Error al guardar el color, no se pudo cambiar.");
    }
  }
}

export const themeService = new ThemeService();
