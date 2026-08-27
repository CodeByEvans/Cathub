import { LogicalSize } from "@tauri-apps/api/window";

export type WindowName = "login" | "register" | "main";

export const WINDOW_SIZES: Record<WindowName, LogicalSize> = {
  login: new LogicalSize(400, 600),
  register: new LogicalSize(400, 700),
  main: new LogicalSize(700, 200),
};

export const MAIN_SIZE = new LogicalSize(700, 200);
export const EXPANDED_SIZE = new LogicalSize(940, 200);
export const WIDGETS_EXPANDED_SIZE = new LogicalSize(980, 200);
export const DEFAULT_COMPACT = { width: 420, height: 200 };
