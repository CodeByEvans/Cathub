import { themeService } from "@/modules/settings/services/theme.service";

import React from "react";

import { THEME_OPTIONS } from "../constants/settings-navigation";
import { CardSettingsTemplate } from "../components/templates/CardSettingsTemplate";
import { ThemeType } from "../@types/settings.types";

interface ThemeSettingsProps {
  selectedTheme: ThemeType;

  setSelectedTheme: (theme: ThemeType) => void;
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
    <>
      <CardSettingsTemplate<ThemeType>
        cards={THEME_OPTIONS}
        selectedValue={selectedTheme}
        onAction={handleThemeChange}
      />
    </>
  );
};
