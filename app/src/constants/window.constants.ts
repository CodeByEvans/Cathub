import { LogicalSize } from "@tauri-apps/api/window";

export type WindowName = "login" | "register" | "main";

export const WINDOW_SIZES: Record<WindowName, LogicalSize> = {
  login: new LogicalSize(400, 600),
  register: new LogicalSize(400, 700),
  main: new LogicalSize(700, 200),
};
