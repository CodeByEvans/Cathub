import { ThemeType } from "@/@types/theme.types";

export type ViewType =
  | "main"
  | "app-settings"
  | "theme-settings"
  | "window-settings"
  | "edit-profile"
  | "change-username"
  | "change-password"
  | "change-email"
  | "break-connection"
  | "logout";

type WidgetSize = "lg" | "md" | "sm";

export interface SettingsButtonProps {
  variant?:
    | "outline"
    | "ghost"
    | "link"
    | "default"
    | "destructive"
    | "secondary"
    | null
    | undefined;
  buttonClasses?: string;
  action: string;
  icon: React.ReactNode;
  text: string;
  textClasses?: string;
}

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  actualTheme: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  onEditProfile?: () => void;
  onBreakConnection?: () => void;
  onLogout?: () => void;
  size?: WidgetSize;
}

export interface OptionCardProps<T> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  isActive?: boolean;
  value: T;
  onClick?: (value: T) => void;
  className?: string;
}

export interface ButtonLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface SettingsTemplateProps {
  buttons: SettingsButtonProps[];
  onAction: (action: string) => void;
}

export interface CardSettingsTemplateProps<T> {
  cards: OptionCardProps<T>[];
  onAction: (action: T) => void;
  selectedValue?: T;
}
export interface SettingsPanelProps {
  setCurrentView: (view: ViewType) => void;
}
