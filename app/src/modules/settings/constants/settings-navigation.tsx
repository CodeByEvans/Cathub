import {
  AppWindow,
  Circle,
  Gem,
  Layers,
  Layout,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Sun,
  UserCog,
  UserX,
} from "lucide-react";
import {
  SettingsButtonProps,
  OptionCardProps,
  ThemeType,
  ThemeColor,
} from "../@types/settings.types";
import { BehaviorType } from "@/@types/window.types";

export const MAIN_SETTINGS: SettingsButtonProps[] = [
  {
    icon: <Layout className="w-6 h-6  mb-1" />,
    text: "Configurar app",
    action: "app-settings",
  },
  {
    icon: <UserCog className="w-6 h-6 mb-1" />,
    text: "Editar perfil",
    action: "edit-profile",
  },
  {
    icon: <UserX className="w-6 h-6 text-destructive mb-1" />,
    text: "Romper conexión",

    action: "break-connection",
  },
  {
    icon: <LogOut className="w-6 h-6  mb-1" />,
    text: "Cerrar sesión",
    action: "logout",
  },
];

export const APP_SETTINGS: SettingsButtonProps[] = [
  {
    icon: <Sun className="w-6 h-6  mb-1" />,
    text: "Modo de tema",
    action: "theme-settings",
  },
  {
    icon: <Palette className="w-6 h-6  mb-1" />,
    text: "Color del tema",
    action: "theme-color-settings",
  },
  {
    icon: <AppWindow className="w-6 h-6  mb-1" />,
    text: "Modo de ventana",
    action: "window-settings",
  },
];

export const THEME_OPTIONS: OptionCardProps<ThemeType>[] = [
  {
    value: "light",
    icon: <Sun className="w-6 h-6  mb-1" />,
    title: "Claro",
    description: "Para el día",
  },
  {
    value: "dark",
    icon: <Moon className="w-6 h-6  mb-1" />,
    title: "Oscuro",
    description: "Para la noche",
  },
  {
    value: "glass",
    icon: <Gem className="w-6 h-6 mb-1" />,
    title: "Cristal",
    description: "Transparente",
  },
];

export const COLOR_OPTIONS: OptionCardProps<ThemeColor>[] = [
  {
    value: "red",
    icon: (
      <Circle
        className="w-6 h-6 mb-1"
        fill="oklch(52.278% 0.20363 28.124)"
        stroke="none"
      />
    ),
    title: "Rojo",
    description: "Clásico",
  },
  {
    value: "blue",
    icon: (
      <Circle
        className="w-6 h-6 mb-1"
        fill="oklch(65.979% 0.13352 238.59)"
        stroke="none"
      />
    ),
    title: "Azul",
    description: "Fresco",
  },
  {
    value: "yellow",
    icon: (
      <Circle
        className="w-6 h-6 mb-1"
        fill="oklch(0.9 0.12 100)"
        stroke="none"
      />
    ),
    title: "Amarillo",
    description: "Brillante",
  },
  {
    value: "purple",
    icon: (
      <Circle
        className="w-6 h-6 mb-1"
        fill="oklch(0.6 0.12 280)"
        stroke="none"
      />
    ),
    title: "Morado",
    description: "Elegante",
  },
  {
    value: "pink",
    icon: (
      <Circle
        className="w-6 h-6 mb-1"
        fill="oklch(0.75 0.12 320)"
        stroke="none"
      />
    ),
    title: "Rosa",
    description: "Vibrante",
  },
];

export const WINDOW_BEHAVIOR_OPTIONS: OptionCardProps<BehaviorType>[] = [
  {
    value: "widget",
    title: "Widget",
    description: "Solo en escritorio",
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    value: "app",
    title: "App",
    description: "Ventana normal",
    icon: <AppWindow className="w-5 h-5" />,
  },
  {
    value: "floating",
    title: "Flotante",
    description: "Siempre visible",
    icon: <Layers className="w-5 h-5" />,
  },
];
