import React from "react";
import { windowService } from "../services/window.service";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { BehaviorType } from "@/@types/window.types";

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
      handleAppError(error, "settings", "settings/behavior-failed");
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
