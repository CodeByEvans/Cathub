import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { themeService } from "@/modules/settings/services/theme.service";
import { ThemeType, ThemeColor } from "../@types/settings.types";
import { ColorWheel, hexToHsl } from "../components/organisms/ColorWheel";

interface PersonalizeViewProps {
  selectedTheme: ThemeType;
  selectedColor: ThemeColor;
  setSelectedColor: (color: ThemeColor) => void;
  setSelectedTheme: (theme: ThemeType) => void;
}

const THEME_OPTIONS: {
  value: ThemeType;
  icon: React.ReactNode;
  label: string;
}[] = [
  { value: "light", icon: <Sun className="w-4 h-4" />, label: "Claro" },
  { value: "dark", icon: <Moon className="w-4 h-4" />, label: "Oscuro" },
  { value: "glass", icon: <Gem className="w-4 h-4" />, label: "Cristal" },
];

export const PersonalizeView: React.FC<PersonalizeViewProps> = ({
  selectedTheme,
  selectedColor,
  setSelectedColor,
  setSelectedTheme,
}) => {
  const [color, setColor] = useState(selectedColor);
  const [lightness, setLightness] = useState(() => {
    const [, , l] = hexToHsl(selectedColor);
    return l;
  });

  const applyColor = (newColor: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(newColor)) return;
    setSelectedColor(newColor);
    themeService.setColor(newColor);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    applyColor(newColor);
  };

  const handleThemeChange = (theme: ThemeType) => {
    setSelectedTheme(theme);
    themeService.setTheme(theme);
  };

  const handleReset = () => {
    themeService.resetColor();
    const defaultColor = themeService.currentThemeColor();
    setColor(defaultColor);
    setSelectedColor(defaultColor);
    setLightness(50);
  };

  return (
    <motion.div
      className="h-full flex items-center justify-center gap-6 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-1.5">
        {THEME_OPTIONS.map(({ value, icon, label }) => (
          <motion.button
            key={value}
            onClick={() => handleThemeChange(value)}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "w-[100px] h-10 rounded-lg flex items-center gap-2 px-3 border transition-colors",
              selectedTheme === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {icon}
            <span className="text-[11px] font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <ColorWheel
          color={color}
          onChange={handleColorChange}
          size={110}
          lightness={lightness}
        />

        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground">Oscuro</span>
          <input
            type="range"
            min={5}
            max={95}
            value={lightness}
            onChange={(e) => setLightness(Number(e.target.value))}
            className="w-16 h-1 accent-primary"
          />
          <span className="text-[9px] text-muted-foreground">Claro</span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={color}
            onChange={(e) => {
              const val = e.target.value;
              setColor(val);
              if (/^#[0-9a-fA-F]{6}$/.test(val)) applyColor(val);
            }}
            className="w-[78px] h-6 rounded border border-border bg-secondary/50 px-1.5 text-[11px] text-foreground text-center font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="#3b82f6"
          />
          <motion.div
            className="w-6 h-6 rounded border border-border flex-shrink-0"
            style={{ backgroundColor: color }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium hover:bg-secondary/80 transition-colors"
        >
          Por defecto
        </button>
      </div>
    </motion.div>
  );
};
