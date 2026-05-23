export type ThemeType = "light" | "dark" | "glass";

export type ThemeColor = string;

export type ViewType =
  | "main"
  | "app-settings"
  | "theme-settings"
  | "color-settings"
  | "personalize"
  | "window-settings"
  | "audio-settings"
  | "edit-profile"
  | "change-username"
  | "change-password"
  | "change-email"
  | "break-connection"
  | "logout";

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

export interface OptionCardProps<T> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  isActive?: boolean;
  value: T;
  onClick?: (value: T) => void;
  className?: string;
}
