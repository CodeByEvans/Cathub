/**
 * Error tipado de la aplicación.
 *
 * Convención: los services/repositorios lanzan `AppError` (o errores nativos
 * que se normalizan en `normalizeError`), nunca devuelven `null` por un fallo
 * (`null` solo significa "no existe el recurso") y nunca importan el sistema
 * de toasts. La capa de UI traduce a mensaje de usuario con `handleAppError`.
 */
export class AppError extends Error {
  readonly code: string;
  readonly userMessage?: string;
  readonly cause?: unknown;

  constructor(
    code: string,
    options?: { message?: string; userMessage?: string; cause?: unknown },
  ) {
    super(options?.message ?? code);
    this.name = "AppError";
    this.code = code;
    this.userMessage = options?.userMessage;
    this.cause = options?.cause;
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
