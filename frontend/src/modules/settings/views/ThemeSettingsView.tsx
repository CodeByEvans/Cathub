import { themeService } from "@/modules/settings/services/theme.service";

import React from "react";

import { ThemeType } from "@/@types/theme.types";

import { THEME_OPTIONS } from "../constants/settings-navigation";
import { CardSettingsTemplate } from "../components/templates/CardSettingsTemplate";

interface ThemeSettingsProps {
  selectedTheme: "light" | "dark" | "glass";

  setSelectedTheme: (theme: "light" | "dark" | "glass") => void;
  size?: "sm" | "md" | "lg";
}

export const ThemeSettingsView: React.FC<ThemeSettingsProps> = ({
  selectedTheme,
  setSelectedTheme,
}) => {
  const handleThemeChange = (theme: ThemeType) => {
    setSelectedTheme(theme);
    themeService.setTheme(theme);
  };
  return (
    <div className="h-full flex flex-col items-center ">
      <CardSettingsTemplate<ThemeType>
        cards={THEME_OPTIONS}
        selectedValue={selectedTheme}
        onAction={handleThemeChange}
      />
    </div>
  );
};
