import React from "react";
import { windowService } from "../services/window.service";
import { BehaviorType } from "@/@types/window.types";

import { CardLayout } from "../components/organisms/CardLayout";

import { WINDOW_BEHAVIOR_OPTIONS } from "../constants/settings-navigation";
import { OptionCard } from "../components/molecules/OptionCard";

interface WindowSettingsProps {
  selectedBehavior: BehaviorType | null;
  onBehaviorChange: (behavior: BehaviorType) => void;
}

export const WindowSettingsView: React.FC<WindowSettingsProps> = ({
  selectedBehavior,
  onBehaviorChange,
}) => {
  const handleSelectBehavior = async (behavior: BehaviorType) => {
    try {
      await windowService.setBehavior(behavior);
      onBehaviorChange(behavior);
    } catch (error) {
      console.error("Error al cambiar el comportamiento de la ventana:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <CardLayout>
        {WINDOW_BEHAVIOR_OPTIONS.map((option) => (
          <OptionCard<BehaviorType>
            key={option.theme}
            icon={option.icon}
            title={option.title}
            description={option.description}
            value={option.theme}
            isActive={selectedBehavior === option.theme}
            onClick={handleSelectBehavior}
          />
        ))}
      </CardLayout>
    </div>
  );
};
