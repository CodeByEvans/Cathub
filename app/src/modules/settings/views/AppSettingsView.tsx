import React from "react";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { toast } from "@/components/ui/sonner";
import { handleAppError } from "@/shared/errors/appErrorHandler";

import { APP_SETTINGS } from "../constants/settings-navigation";
import { ViewType } from "../@types/settings.types";
import { GeneralSettingsTemplate } from "../components/templates/GeneralSettingsTemplate";

interface AppSettingsProps {
  setCurrentView: (view: ViewType) => void;
  onOpenColorPicker: () => void;
}

export const AppSettingsView: React.FC<AppSettingsProps> = ({
  setCurrentView,
  onOpenColorPicker,
}) => {
  const handleAutostart = async () => {
    try {
      const enabled = await isEnabled();
      if (enabled) {
        await disable();
        toast.success("Arranque automático desactivado");
      } else {
        await enable();
        toast.success("Arranque automático activado");
      }
    } catch (error) {
      handleAppError(error, "settings", "settings/autostart-failed");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-4 gap-4">
      <GeneralSettingsTemplate
        buttons={APP_SETTINGS}
        onAction={(action) => {
          switch (action) {
            case "personalize":
              onOpenColorPicker();
              break;
            case "window-settings":
              setCurrentView("window-settings");
              break;
            case "window-controls":
              setCurrentView("window-controls");
              break;
            case "autostart":
              handleAutostart();
              break;
            default:
              break;
          }
        }}
      />
    </div>
  );
};
