import { getValue, setValue } from "@/services/store.service";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, Window } from "@tauri-apps/api/window";

type Behavior = "widget" | "app" | "floating";

interface WindowState {
  behavior: Behavior;
}

export class WindowService {
  private behavior: Behavior = "app";
  private readonly behaviors: Behavior[] = ["widget", "app", "floating"];

  private async getWindow(): Promise<Window> {
    const win = getCurrentWindow();
    if (!win) throw new Error("No se pudo obtener la ventana actual");
    return win;
  }

  currentBehavior(): Behavior {
    return this.behavior;
  }

  async show() {
    const win = await this.getWindow();
    await win.show();
    await this.bringToFront();
  }

  async getBehavior(): Promise<WindowState> {
    try {
      const stored = (await getValue("window_behavior")) as Behavior;
      this.behavior = this.behaviors.includes(stored) ? stored : "app";
      console.log("Comportamiento de ventana actual:", this.behavior);

      const win = await this.getWindow();
      await this.applyBehavior(win, this.behavior);

      return { behavior: this.behavior };
    } catch (err) {
      console.error("Error al obtener comportamiento:", err);
      return { behavior: "app" };
    }
  }

  async setBehavior(behavior: Behavior) {
    if (!this.behaviors.includes(behavior)) {
      console.error("Comportamiento no válido:", behavior);
      return;
    }

    this.behavior = behavior;
    await setValue("window_behavior", behavior);

    const win = await this.getWindow();
    await this.applyBehavior(win, behavior);
  }

  private behaviorActions: Record<Behavior, (win: Window) => Promise<void>> = {
    widget: async (win) => {
      await win.setAlwaysOnBottom(true);
      await win.setSkipTaskbar(true);
      await win.setMinimizable(false);
      await invoke("set_dock_visibility", { visible: false });
      await invoke("set_widget_behavior");
    },
    floating: async (win) => {
      await win.setAlwaysOnTop(true);
      await win.setSkipTaskbar(false);
      await win.setMinimizable(true);
      await invoke("set_dock_visibility", { visible: true });
    },
    app: async (win) => {
      await win.setAlwaysOnTop(false);
      await win.setAlwaysOnBottom(false);
      await win.setSkipTaskbar(false);
      await win.setMinimizable(true);
      await invoke("set_dock_visibility", { visible: true });
      await invoke("set_normal_behavior");
    },
  };

  private async applyBehavior(win: Window, behavior: Behavior) {
    const action = this.behaviorActions[behavior];
    await action(win);
  }

  async bringToFront() {
    const win = await this.getWindow();
    await win.setAlwaysOnTop(true);
    await win.show();
    await win.setFocus();
  }

  async restoreBehavior() {
    const win = await this.getWindow();
    await this.applyBehavior(win, this.behavior);
  }
}

export const windowService = new WindowService();
