import { toast } from "sonner";
import { getValue, setValue } from "./store.service";

export type Theme = "dark" | "light" | "glass";

interface ThemeState {
  theme: Theme;
}

class ThemeService {
  private theme: Theme = "light";
  private themes: Theme[] = ["light", "dark", "glass"];

  currentTheme(): Theme {
    return this.theme;
  }

  async getTheme(): Promise<ThemeState> {
    try {
      const storedTheme = (await getValue("theme")) as Theme | null;

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

  async setTheme(theme: Theme) {
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
}

export const themeService = new ThemeService();
