import { Mail, Lock, User } from "lucide-react";

export type AuthMode = "login" | "register";

export interface AuthFieldConfig {
  id: string;
  name: "email" | "username" | "password" | "confirmPassword";
  type: "text" | "email" | "password";
  placeholder: string;
  Icon: React.ElementType;
  isPassword?: boolean;
  showOnMode?: AuthMode; // undefined = ambos modos
}

export const AUTH_FIELDS: AuthFieldConfig[] = [
  {
    id: "username",
    name: "username",
    type: "text",
    placeholder: "Nombre de usuario",
    Icon: User,
    showOnMode: "register",
  },
  {
    id: "email",
    name: "email",
    type: "email",
    placeholder: "Correo electrónico",
    Icon: Mail,
  },
  {
    id: "password",
    name: "password",
    type: "password",
    placeholder: "Contraseña",
    Icon: Lock,
    isPassword: true,
  },
  {
    id: "confirmPassword",
    name: "confirmPassword",
    type: "password",
    placeholder: "Confirmar contraseña",
    Icon: Lock,
    isPassword: true,
    showOnMode: "register",
  },
];
