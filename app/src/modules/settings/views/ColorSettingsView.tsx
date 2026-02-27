import React from "react";
import { CardSettingsTemplate } from "../components/templates/CardSettingsTemplate";
import { COLOR_OPTIONS } from "../constants/settings-navigation";
import { themeService } from "../services/theme.service";
import { ThemeColor } from "../@types/settings.types";

interface ColorSettingsProps {
  selectedColor: ThemeColor;

  setSelectedColor: (color: ThemeColor) => void;
}

export const ColorSettingsView: React.FC<ColorSettingsProps> = ({
  selectedColor,
  setSelectedColor,
}) => {
  const handleColorChange = (color: ThemeColor) => {
    setSelectedColor(color);
    themeService.setColor(color);
  };

  return (
    <>
      <CardSettingsTemplate<ThemeColor>
        cards={COLOR_OPTIONS}
        selectedValue={selectedColor}
        onAction={handleColorChange}
      />
    </>
  );
};
