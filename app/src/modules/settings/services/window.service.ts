import { getValue, setValue } from "@/services/store.service";
import { Window } from "@tauri-apps/api/window";

type Behavior = "widget" | "app" | "floating";

interface WindowState {
  behavior: Behavior;
}

class WindowService {
  private behavior: Behavior = "app";
  private behaviors: Behavior[] = ["widget", "app", "floating"];

  currentBehavior(): Behavior {
    return this.behavior;
  }

  async getBehavior(): Promise<WindowState> {
    try {
      const storedBehavior = (await getValue("window_behavior")) as Behavior;

      this.behavior =
        storedBehavior && this.behaviors.includes(storedBehavior)
          ? storedBehavior
          : "app";

      console.log("Comportamiento de ventana actual:", this.behavior);

      const mainWindow = Window.getCurrent();

      await this.applyBehavior(mainWindow, this.behavior);

      return { behavior: this.behavior };
    } catch (error) {
      console.error("Error al obtener el comportamiento de la ventana:", error);
      return { behavior: "app" };
    }
  }

  async setBehavior(behavior: Behavior) {
    if (!this.behaviors.includes(behavior)) {
      console.error("Comportamiento no válido:", behavior);
      return;
    }

    try {
      await setValue("window_behavior", behavior);
      this.behavior = behavior;

      const mainWindow = Window.getCurrent();

      if (!mainWindow) {
        console.error("No se pudo obtener la ventana principal.");
        return;
      }

      await this.applyBehavior(mainWindow, behavior);
    } catch (error) {
      console.error("Error al guardar el comportamiento de la ventana:", error);
    }
  }

  private async applyBehavior(window: Window, behavior: Behavior) {
    switch (behavior) {
      case "widget":
        await window.setAlwaysOnBottom(true);
        break;
      case "floating":
        await window.setAlwaysOnTop(true);
        break;
      case "app":
      default:
        await window.setAlwaysOnTop(false);
        await window.setAlwaysOnBottom(false);
        break;
    }
  }
}

export const windowService = new WindowService();
