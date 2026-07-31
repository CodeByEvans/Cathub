import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { themeService } from "../services/theme.service";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { ThemeColor } from "../@types/settings.types";

interface ColorSettingsProps {
  selectedColor: ThemeColor;
  setSelectedColor: (color: ThemeColor) => void;
}

export const ColorSettingsView: React.FC<ColorSettingsProps> = ({
  selectedColor,
  setSelectedColor,
}) => {
  const [color, setColor] = useState(selectedColor);

  useEffect(() => {
    setColor(selectedColor);
  }, [selectedColor]);

  const applyColor = (newColor: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(newColor)) return;
    setSelectedColor(newColor);
    themeService
      .setColor(newColor)
      .catch((e) => handleAppError(e, "settings"));
  };

  const handlePickerChange = (newColor: string) => {
    setColor(newColor);
    applyColor(newColor);
  };

  const handleReset = () => {
    themeService
      .resetColor()
      .catch((e) => handleAppError(e, "settings"));
    const defaultColor = themeService.currentThemeColor();
    setColor(defaultColor);
    setSelectedColor(defaultColor);
  };

  return (
    <div className="h-full flex items-center justify-center gap-5 px-4">
      <HexColorPicker
        color={color}
        onChange={handlePickerChange}
        className="!w-[130px] !h-[130px] flex-shrink-0"
      />

      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-wide uppercase text-muted-foreground">
          Vista previa
        </span>
        <div className="w-28 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <span className="text-primary-foreground text-[11px] font-semibold">
            Botón
          </span>
        </div>
        <div className="w-28 h-6 rounded-md border border-primary/30 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-[10px] font-medium">Enlace</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-accent border border-border" />
          <span className="text-[10px] text-accent-foreground">Accent</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={color}
            onChange={(e) => {
              const val = e.target.value;
              setColor(val);
              if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                applyColor(val);
              }
            }}
            className="w-24 h-8 rounded-md border border-border bg-secondary/50 px-2 text-sm text-foreground text-center font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="#3b82f6"
          />
          <div
            className="w-8 h-8 rounded-md border border-border flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          Por defecto
        </button>
      </div>
    </div>
  );
};
