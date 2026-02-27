import React from "react";
import { windowService } from "../services/window.service";
import { BehaviorType } from "@/@types/window.types";

import { CardLayout } from "../components/organisms/CardLayout";

import { WINDOW_BEHAVIOR_OPTIONS } from "../constants/settings-navigation";
import { CardSettingsTemplate } from "../components/templates/CardSettingsTemplate";

interface WindowSettingsProps {
  selectedBehavior: BehaviorType;
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
    <>
      <CardSettingsTemplate<BehaviorType>
        cards={WINDOW_BEHAVIOR_OPTIONS}
        selectedValue={selectedBehavior}
        onAction={handleSelectBehavior}
      />
    </>
  );
};
