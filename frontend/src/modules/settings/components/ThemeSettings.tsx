import { cn } from "@/lib/utils";
import { themeService } from "@/modules/settings/services/theme.service";

import React from "react";

interface ThemeSettingsProps {
  selectedTheme: "light" | "dark" | "glass";

  setSelectedTheme: (theme: "light" | "dark" | "glass") => void;
  size?: "sm" | "md" | "lg";
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({
  size = "lg",
  selectedTheme,
  setSelectedTheme,
}) => {
  const isSmall = size === "sm";
  const isMedium = size === "md";

  const gap = isSmall ? "gap-1.5" : isMedium ? "gap-2" : "gap-3";

  const handleSelectTheme = (theme: "light" | "dark" | "glass") => {
    setSelectedTheme(theme);
    themeService.setTheme(theme);
  };
  return (
    <div className={cn("flex flex-1 w-full items-center", gap)}>
      <button
        onClick={() => handleSelectTheme("light")}
        className={cn(
          "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2",
          "bg-gradient-to-br from-slate-50 to-slate-100",
          selectedTheme === "light"
            ? "border-primary ring-2 ring-primary/30"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-slate-300 to-slate-400",
            isSmall ? "w-8 h-8" : isMedium ? "w-12 h-12" : "w-16 h-16",
          )}
        />
        <div className="text-center px-2">
          <div
            className={cn(
              "text-slate-700 font-bold",
              isSmall ? "text-xs" : "text-sm",
            )}
          >
            Claro
          </div>
          <div
            className={cn(
              "text-slate-500 leading-tight",
              isSmall ? "text-[9px]" : "text-[10px]",
            )}
          >
            Para el día
          </div>
        </div>
      </button>

      <button
        onClick={() => handleSelectTheme("dark")}
        className={cn(
          "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2",
          "bg-gradient-to-br from-slate-800 to-slate-900",
          selectedTheme === "dark"
            ? "border-primary ring-2 ring-primary/30"
            : "border-slate-700 hover:border-slate-600",
        )}
      >
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-slate-400 to-slate-500",
            isSmall ? "w-8 h-8" : isMedium ? "w-12 h-12" : "w-16 h-16",
          )}
        />
        <div className="text-center px-2">
          <div
            className={cn(
              "text-slate-300 font-bold",
              isSmall ? "text-xs" : "text-sm",
            )}
          >
            Oscuro
          </div>
          <div
            className={cn(
              "text-slate-400 leading-tight",
              isSmall ? "text-[9px]" : "text-[10px]",
            )}
          >
            Para la noche
          </div>
        </div>
      </button>

      <button
        onClick={() => handleSelectTheme("glass")}
        className={cn(
          "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2",
          "bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm",
          selectedTheme === "glass"
            ? "border-primary ring-2 ring-primary/30"
            : "border-slate-300/30 hover:border-slate-400/50",
        )}
      >
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-blue-300 to-slate-400 opacity-80",
            isSmall ? "w-8 h-8" : isMedium ? "w-12 h-12" : "w-16 h-16",
          )}
        />
        <div className="text-center px-2">
          <div
            className={cn(
              "text-slate-700 font-bold",
              isSmall ? "text-xs" : "text-sm",
            )}
          >
            Cristal
          </div>
          <div
            className={cn(
              "text-slate-600 leading-tight",
              isSmall ? "text-[9px]" : "text-[10px]",
            )}
          >
            Transparente
          </div>
        </div>
      </button>
    </div>
  );
};
