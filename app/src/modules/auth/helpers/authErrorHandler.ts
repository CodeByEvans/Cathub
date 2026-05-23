import { toast } from "@/components/ui/sonner";

export const handleAuthError = (error: unknown) => {
  if (!(error instanceof Error)) {
    toast.error("Error al iniciar sesion");
    return;
  }

  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Credenciales invalidas",
    "Email not confirmed": "Correo no confirmado",
    "The email is already in use": "El correo ya esta en uso",
    "Passwords do not match": "Las contraseñas no coinciden",
  };
  const message = errorMap[error.message] || `Error: ${error.message}`;
  toast.error(message);
};
