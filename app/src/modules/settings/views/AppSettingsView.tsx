import React from "react";

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
            default:
              break;
          }
        }}
      />
    </div>
  );
};
