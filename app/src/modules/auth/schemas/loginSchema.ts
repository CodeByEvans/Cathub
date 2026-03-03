// loginSchema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña es muy corta"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres"),
  password: z.string().min(6, "La contraseña es muy corta"),
  confirmPassword: z.string().min(6, "La contraseña es muy corta"),
});
