import React from "react";
import { windowService } from "../services/window.service";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { ControlsPosition } from "@/@types/window.types";

import { WINDOW_CONTROLS_POSITION_OPTIONS } from "../constants/settings-navigation";
import { OptionCard } from "../components/molecules/OptionCard";

interface WindowControlsSettingsProps {
  selectedPosition: ControlsPosition;
  onPositionChange: (position: ControlsPosition) => void;
}

export const WindowControlsSettingsView: React.FC<WindowControlsSettingsProps> =
  ({ selectedPosition, onPositionChange }) => {
    const handleSelectPosition = async (position: ControlsPosition) => {
      try {
        await windowService.setControlsPosition(position);
        onPositionChange(position);
      } catch (error) {
        handleAppError(error, "settings", "settings/behavior-failed");
      }
    };

    return (
      <div className="h-full flex flex-col justify-center gap-3 px-6">
        <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
          Posición de los botones
        </span>
        <div className="flex gap-3">
          {WINDOW_CONTROLS_POSITION_OPTIONS.map((card, i) => (
            <OptionCard<ControlsPosition>
              key={String(card.value)}
              icon={card.icon}
              title={card.title}
              description={card.description}
              value={card.value}
              isActive={selectedPosition === card.value}
              onClick={(v) => handleSelectPosition(v)}
              index={i}
            />
          ))}
        </div>
      </div>
    );
  };
