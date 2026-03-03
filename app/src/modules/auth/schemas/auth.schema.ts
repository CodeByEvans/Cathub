import { z } from "zod";

const email = z
  .string()
  .min(1, "El email es obligatorio")
  .email("Introduce un email válido")
  .max(320);

const password = z
  .string()
  .min(6, "Debe tener al menos 6 caracteres")
  .max(100, "Demasiado larga")
  .refine((val) => !/\s/.test(val), "No puede contener espacios");

const username = z
  .string()
  .min(2, "Muy corto")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y _");

// Login schema

export const loginSchema = z.object({
  email,

  password,
});

export type LoginSchema = z.infer<typeof loginSchema>;

// Register schema

export const registerSchema = z.object({
  username,

  email,

  password,
});

export type RegisterSchema = z.infer<typeof registerSchema>;
