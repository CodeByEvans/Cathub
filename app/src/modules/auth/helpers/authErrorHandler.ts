import { toast } from "sonner";

export const handleAuthError = (error: unknown) => {
  if (!(error instanceof Error)) {
    toast.error("Error al iniciar sesion");
    return;
  }

  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Credenciales invalidas",
    "Email not confirmed": "Correo no confirmado",
  };
  const message =
    errorMap[error.message] || `Error al iniciar sesion: ${error.message}`;
  toast.error(message);
};
