import { handleAppError } from "@/shared/errors/appErrorHandler";

/**
 * Traduce errores de autenticación a mensajes de usuario. Delega en el
 * handler central: los `AuthError` de Supabase se mapean por su `code`
 * (estable), no por el texto del mensaje (frágil y en inglés).
 */
export const handleAuthError = (error: unknown) => {
  handleAppError(error, "auth");
};
