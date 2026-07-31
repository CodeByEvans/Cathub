import { toast } from "@/components/ui/sonner";
import { logger } from "@/shared/logger";
import { AppError, isAppError } from "./AppError";
import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "./errorMessages";

/**
 * Códigos de Supabase AuthError → códigos propios. Matchear por `code`
 * (estable) en lugar de por el texto del mensaje (frágil y en inglés).
 */
const SUPABASE_AUTH_CODE_MAP: Record<string, string> = {
  invalid_credentials: "auth/invalid-credentials",
  email_not_confirmed: "auth/email-not-confirmed",
  email_exists: "auth/email-in-use",
  user_already_exists: "auth/email-in-use",
  weak_password: "auth/weak-password",
};

type ErrorWithCode = Error & { code: string };

const hasCode = (error: unknown): error is ErrorWithCode =>
  error instanceof Error &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string";

/** Normaliza cualquier valor lanzado (Error, AppError, string...) a AppError. */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) return error;

  if (hasCode(error)) {
    const mapped = SUPABASE_AUTH_CODE_MAP[error.code];
    if (mapped) {
      return new AppError(mapped, { message: error.message, cause: error });
    }
  }

  if (error instanceof Error) {
    return new AppError("UNKNOWN", { message: error.message, cause: error });
  }

  return new AppError("UNKNOWN", { cause: error });
}

/** Mensaje de usuario para un error, sin efectos secundarios. */
export function getUserMessage(error: unknown): string {
  const appError = normalizeError(error);
  return (
    appError.userMessage ??
    ERROR_MESSAGES[appError.code] ??
    UNKNOWN_ERROR_MESSAGE
  );
}

/**
 * Handler central: loguea una vez (con contexto de módulo) y muestra el toast.
 *
 * Uso en vistas/handlers:
 *   try { ... } catch (e) { handleAppError(e, "notes.send"); }
 *
 * `fallbackCode` se aplica cuando el error no trae código propio (p. ej.
 * errores crudos de plugins de Tauri en una vista).
 */
export function handleAppError(
  error: unknown,
  context = "app",
  fallbackCode?: string,
): string {
  let appError = normalizeError(error);
  if (appError.code === "UNKNOWN" && fallbackCode) {
    appError = new AppError(fallbackCode, {
      message: appError.message,
      cause: appError.cause,
    });
  }
  logger.error(context, appError.message, appError.cause);
  const userMessage = getUserMessage(appError);
  toast.error(userMessage);
  return userMessage;
}
