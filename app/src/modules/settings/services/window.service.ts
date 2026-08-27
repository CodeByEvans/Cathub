import { logger } from "@/shared/logger";
import { settingsRepository, WindowBehavior } from "./settings.repository";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { MAIN_SIZE, EXPANDED_SIZE, WIDGETS_EXPANDED_SIZE, DEFAULT_COMPACT } from "@/constants/window.constants";
import { ControlsPosition } from "@/@types/window.types";

type Behavior = WindowBehavior;

interface WindowState {
  behavior: Behavior;
}

export class WindowService {
  private behavior: Behavior = "app";
  private controlsPosition: ControlsPosition = "right";
  private readonly behaviors: Behavior[] = ["widget", "app", "floating"];
  private compactSize = { ...DEFAULT_COMPACT };
  private compactResizeUnlisten: (() => void) | null = null;
  private compactResizeDebounce: ReturnType<typeof setTimeout> | null = null;

  private async getWindow() {
    const win = getCurrentWindow();
    if (!win) throw new Error("No se pudo obtener la ventana actual");
    return win;
  }

  getBehavior(): Behavior {
    return this.behavior;
  }

  getCompactSize() {
    return this.compactSize;
  }

  async show() {
    const win = await this.getWindow();
    await win.show();
    await this.bringToFront();
  }

  async getBehaviorState(): Promise<WindowState> {
    try {
      this.behavior = await settingsRepository.getWindowBehavior();
      logger.debug("window", `Comportamiento de ventana actual: ${this.behavior}`);

      const win = await this.getWindow();
      await this.applyBehavior(win, this.behavior);

      return { behavior: this.behavior };
    } catch (err) {
      logger.error("window", "Error al obtener comportamiento", err);
      return { behavior: "app" };
    }
  }

  async loadControlsPosition(): Promise<ControlsPosition> {
    try {
      this.controlsPosition = await settingsRepository.getWindowControlsPosition();
      return this.controlsPosition;
    } catch (err) {
      logger.warn("window", "Error al cargar posición de botones", err);
      return this.controlsPosition;
    }
  }

  getControlsPosition(): ControlsPosition {
    return this.controlsPosition;
  }

  async setControlsPosition(position: ControlsPosition) {
    this.controlsPosition = position;
    try {
      await settingsRepository.setWindowControlsPosition(position);
    } catch (err) {
      logger.warn("window", "Error al guardar posición de botones", err);
    }
  }

  async setBehavior(behavior: Behavior) {
    if (!this.behaviors.includes(behavior)) {
      logger.warn("window", `Comportamiento no válido: ${behavior}`);
      return;
    }

    this.behavior = behavior;
    await settingsRepository.setWindowBehavior(behavior);

    const win = await this.getWindow();
    await this.applyBehavior(win, behavior);
  }

  private behaviorActions: Record<Behavior, (win: import("@tauri-apps/api/window").Window) => Promise<void>> = {
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

  private async applyBehavior(win: import("@tauri-apps/api/window").Window, behavior: Behavior) {
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

  async loadCompactSize(): Promise<{ width: number; height: number }> {
    try {
      const saved = await settingsRepository.getCompactWindowSize();
      if (saved) {
        this.compactSize = saved;
        return this.compactSize;
      }
    } catch (err) {
      logger.warn("window", "Error al cargar tamaño compacto", err);
    }
    return DEFAULT_COMPACT;
  }

  async saveCompactSize(width: number, height: number) {
    this.compactSize = { width, height };
    try {
      await settingsRepository.setCompactWindowSize({ width, height });
    } catch (err) {
      logger.warn("window", "Error al guardar tamaño compacto", err);
    }
  }

  async loadCompactMode(): Promise<boolean> {
    try {
      return await settingsRepository.getCompactMode();
    } catch (err) {
      logger.warn("window", "Error al cargar modo compacto", err);
      return false;
    }
  }

  async saveCompactMode(mode: boolean) {
    try {
      await settingsRepository.setCompactMode(mode);
    } catch (err) {
      logger.warn("window", "Error al guardar modo compacto", err);
    }
  }

  async enableCompactMode() {
    const win = await this.getWindow();
    const saved = await this.loadCompactSize();
    await invoke("set_window_resizable", { resizable: true });
    await invoke("set_window_min_size", { width: 280, height: 120 });
    await invoke("set_window_max_size", { width: 700, height: 400 });
    await win.setSize(new LogicalSize(saved.width, saved.height));
  }

  async disableCompactMode() {
    const win = await this.getWindow();
    await invoke("set_window_min_size", { width: 0, height: 0 });
    await invoke("set_window_max_size", { width: 5000, height: 5000 });
    await invoke("set_window_resizable", { resizable: false });
    await win.setSize(MAIN_SIZE);
  }

  async expandForColorPicker() {
    const win = await this.getWindow();
    await win.setSize(EXPANDED_SIZE);
  }

  async restoreFromColorPicker(isCompact: boolean) {
    const win = await this.getWindow();
    if (isCompact) {
      await win.setSize(new LogicalSize(this.compactSize.width, this.compactSize.height));
    } else {
      await win.setSize(MAIN_SIZE);
    }
  }

  async expandForWidgets() {
    const win = await this.getWindow();
    await win.setSize(WIDGETS_EXPANDED_SIZE);
  }

  async restoreFromWidgets(isCompact: boolean) {
    const win = await this.getWindow();
    if (isCompact) {
      await win.setSize(new LogicalSize(this.compactSize.width, this.compactSize.height));
    } else {
      await win.setSize(MAIN_SIZE);
    }
  }

  async startCompactResizeListener() {
    this.stopCompactResizeListener();
    const win = await this.getWindow();
    const handleResize = async () => {
      if (this.compactResizeDebounce) clearTimeout(this.compactResizeDebounce);
      this.compactResizeDebounce = setTimeout(async () => {
        try {
          const size = await win.outerSize();
          const logicalSize = size.toLogical(await win.scaleFactor());
          const width = Math.round(logicalSize.width);
          const height = Math.round(logicalSize.height);
          await this.saveCompactSize(width, height);
        } catch (err) {
          logger.warn("window", "Error en resize listener", err);
        }
      }, 500);
    };
    const unlisten = await win.onResized(handleResize);
    this.compactResizeUnlisten = unlisten;
  }

  stopCompactResizeListener() {
    if (this.compactResizeUnlisten) {
      this.compactResizeUnlisten();
      this.compactResizeUnlisten = null;
    }
    if (this.compactResizeDebounce) {
      clearTimeout(this.compactResizeDebounce);
      this.compactResizeDebounce = null;
    }
  }
}

export const windowService = new WindowService();
