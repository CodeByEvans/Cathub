type LogLevel = "debug" | "info" | "warn" | "error";

const format = (module: string, message: string) => `[${module}] ${message}`;

const write = (
  level: LogLevel,
  module: string,
  message: string,
  data: unknown[] = [],
) => {
  const formatted = format(module, message);
  switch (level) {
    case "debug":
      console.debug(formatted, ...data);
      break;
    case "info":
      console.info(formatted, ...data);
      break;
    case "warn":
      console.warn(formatted, ...data);
      break;
    case "error":
      console.error(formatted, ...data);
      break;
  }
};

/**
 * Punto único de logging de la app. Sustituye a los `console.error("❌ ...")`
 * dispersos. Si en el futuro se adopta @tauri-apps/plugin-log o Sentry,
 * solo hay que tocar este archivo.
 */
export const logger = {
  debug: (module: string, message: string, ...data: unknown[]) =>
    write("debug", module, message, data),
  info: (module: string, message: string, ...data: unknown[]) =>
    write("info", module, message, data),
  warn: (module: string, message: string, ...data: unknown[]) =>
    write("warn", module, message, data),
  error: (module: string, message: string, ...data: unknown[]) =>
    write("error", module, message, data),
};
