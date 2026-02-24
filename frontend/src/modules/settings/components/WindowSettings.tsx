import React from "react";
import { cn } from "@/lib/utils";
import { Monitor, AppWindow, Layers } from "lucide-react";
import { windowService } from "../services/window.service";

export type BehaviorType = "widget" | "app" | "floating";

interface WindowSettingsProps {
  selectedBehavior: BehaviorType | null;
  onBehaviorChange: (behavior: BehaviorType) => void;
  size?: "sm" | "md" | "lg";
}

export const WindowSettings: React.FC<WindowSettingsProps> = ({
  selectedBehavior,
  onBehaviorChange,
}) => {
  const options: {
    value: BehaviorType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "widget",
      label: "Widget",
      description: "Solo en escritorio",
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      value: "app",
      label: "App",
      description: "Ventana normal",
      icon: <AppWindow className="w-5 h-5" />,
    },
    {
      value: "floating",
      label: "Flotante",
      description: "Siempre visible",
      icon: <Layers className="w-5 h-5" />,
    },
  ];

  const handleSelectBehavior = async (behavior: BehaviorType) => {
    try {
      await windowService.setBehavior(behavior);
      onBehaviorChange(behavior);
    } catch (error) {
      console.error("Error al cambiar el comportamiento de la ventana:", error);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 w-full h-full items-center justify-center px-4",
      )}
    >
      {options.map(({ value, label, description, icon }) => {
        const isSelected = selectedBehavior === value;

        return (
          <button
            key={value}
            onClick={() => handleSelectBehavior(value)}
            className={cn(
              "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 px-2 transition-all duration-300 border-2",
              "bg-secondary/50",
              isSelected
                ? "border-primary ring-2 ring-primary/30 scale-[1.02] bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 transition-colors duration-300",
                isSelected ? "text-primary" : "text-muted-foreground",
              )}
            >
              {icon}
            </div>
            <div className="text-center leading-none">
              <div className="text-xs font-semibold text-foreground">
                {label}
              </div>
              <div className="text-[9px] text-muted-foreground">
                {description}
              </div>
            </div>
            {isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};
