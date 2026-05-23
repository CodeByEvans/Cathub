import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Sun, Moon, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { themeService } from "@/modules/settings/services/theme.service";
import { ThemeType } from "@/modules/settings/@types/settings.types";
import { ColorWheel, hexToHsl } from "./ColorWheel";

interface ColorPickerPanelProps {
  onClose: () => void;
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

export const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({
  onClose,
}) => {
  const [color, setColor] = useState(themeService.currentThemeColor());
  const [theme, setTheme] = useState(themeService.currentTheme());
  const [lightness, setLightness] = useState(() => {
    const [, , l] = hexToHsl(themeService.currentThemeColor());
    return l;
  });

  const applyColor = (newColor: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(newColor)) return;
    themeService.setColor(newColor);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    applyColor(newColor);
  };

  const handleThemeChange = (t: ThemeType) => {
    setTheme(t);
    themeService.setTheme(t);
  };

  const handleReset = () => {
    themeService.resetColor();
    setColor(themeService.currentThemeColor());
    setLightness(50);
  };

  return (
    <motion.div
      className="w-[240px] h-full flex flex-col justify-center px-3 py-3 border-l border-border/30 relative"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-0.5 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <span className="text-[10px] tracking-wide uppercase text-muted-foreground text-center mb-1">
        Personalizar
      </span>

      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5">
          {THEME_OPTIONS.map(({ value, icon, label }) => (
            <motion.button
              key={value}
              onClick={() => handleThemeChange(value)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "w-[88px] h-9 rounded-lg flex items-center gap-2 px-2 border transition-colors",
                theme === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <ColorWheel
            color={color}
            onChange={handleColorChange}
            size={100}
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
              className="w-14 h-1 accent-primary"
            />
            <span className="text-[9px] text-muted-foreground">Claro</span>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={color}
              onChange={(e) => {
                const val = e.target.value;
                setColor(val);
                if (/^#[0-9a-fA-F]{6}$/.test(val)) applyColor(val);
              }}
              className="w-[72px] h-5 rounded border border-border bg-secondary/50 px-1 text-[10px] text-foreground text-center font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="#3b82f6"
            />
            <motion.div
              className="w-5 h-5 rounded border border-border flex-shrink-0"
              style={{ backgroundColor: color }}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>

          <button
            onClick={handleReset}
            className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium hover:bg-secondary/80 transition-colors"
          >
            Por defecto
          </button>
        </div>
      </div>
    </motion.div>
  );
};
