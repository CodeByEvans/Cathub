import {
  AppWindow,
  Gem,
  Layers,
  Layout,
  LogOut,
  Mic,
  Monitor,
  Moon,
  Palette,
  Sun,
  UserCog,
  UserX,
  Globe,
} from "lucide-react";
import {
  SettingsButtonProps,
  OptionCardProps,
  ThemeType,
} from "../@types/settings.types";
import { BehaviorType } from "@/@types/window.types";

export const MAIN_SETTINGS: SettingsButtonProps[] = [
  {
    icon: <Layout className="w-6 h-6 mb-1" />,
    text: "App",
    action: "app-settings",
  },
  {
    icon: <Mic className="w-6 h-6 mb-1" />,
    text: "Audio",
    action: "audio-settings",
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
    icon: <Palette className="w-6 h-6  mb-1" />,
    text: "Personalizar app",
    action: "personalize",
  },
  {
    icon: <AppWindow className="w-6 h-6  mb-1" />,
    text: "Modo de ventana",
    action: "window-settings",
  },
  {
    icon: <Globe className="w-6 h-6 mb-1" />,
    text: "Arranque automático",
    action: "autostart",
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
