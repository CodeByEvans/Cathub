import {
  AppWindow,
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
import { SettingsButtonProps, OptionCardProps } from "../@types/settings.types";
import { BehaviorType } from "@/@types/window.types";
import { ThemeType } from "@/@types/theme.types";

export const MAIN_SETTINGS: SettingsButtonProps[] = [
  {
    icon: <Layout className="w-6 h-6 text-primary mb-1" />,
    text: "Configurar app",
    buttonClasses:
      "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200",
    action: "app-settings",
  },
  {
    icon: <UserCog className="w-6 h-6 text-primary mb-1" />,
    text: "Editar perfil",
    buttonClasses:
      "bg-secondary/50 hover:bg-secondary border-border/50 hover:border-border transition-all duration-200",
    action: "edit-profile",
  },
  {
    icon: <UserX className="w-6 h-6 text-destructive mb-1" />,
    text: "Romper conexión",
    buttonClasses:
      "bg-secondary/50 hover:bg-destructive/10 border-border/50 hover:border-destructive/50 transition-all duration-200",
    action: "break-connection",
  },
  {
    icon: <LogOut className="w-6 h-6 text-muted-foreground mb-1" />,
    text: "Cerrar sesión",
    buttonClasses:
      "bg-secondary/50 hover:bg-secondary border-border/50 hover:border-border transition-all duration-200",
    action: "logout",
  },
];

export const APP_SETTINGS: SettingsButtonProps[] = [
  {
    icon: <Palette className="w-6 h-6 text-primary mb-1" />,
    text: "Cambiar tema",
    buttonClasses:
      "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200",
    action: "theme-settings",
  },
  {
    icon: <AppWindow className="w-6 h-6 text-primary mb-1" />,
    text: "Modo de ventana",
    buttonClasses:
      "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200",
    action: "window-settings",
  },
];

export const THEME_OPTIONS: OptionCardProps<ThemeType>[] = [
  {
    value: "light",
    icon: <Sun className="w-6 h-6 text-primary mb-1" />,
    title: "Claro",
    description: "Para el día",
  },
  {
    value: "dark",
    icon: <Moon className="w-6 h-6 text-primary mb-1" />,
    title: "Oscuro",
    description: "Para la noche",
  },
  {
    value: "glass",
    icon: <Gem className="w-6 h-6 text-primary mb-1" />,
    title: "Cristal",
    description: "Transparente",
  },
];

export const WINDOW_BEHAVIOR_OPTIONS: {
  theme: BehaviorType;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    theme: "widget",
    title: "Widget",
    description: "Solo en escritorio",
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    theme: "app",
    title: "App",
    description: "Ventana normal",
    icon: <AppWindow className="w-5 h-5" />,
  },
  {
    theme: "floating",
    title: "Flotante",
    description: "Siempre visible",
    icon: <Layers className="w-5 h-5" />,
  },
];
