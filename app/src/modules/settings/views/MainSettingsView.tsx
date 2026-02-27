import { authService } from "@/modules/auth/services/auth.service";

import { GeneralSettingsTemplate } from "../components/templates/GeneralSettingsTemplate";
import { MAIN_SETTINGS } from "../constants/settings-navigation";
import { ViewType } from "../@types/settings.types";

export interface SettingsPanelProps {
  setCurrentView: (view: ViewType) => void;
}

export const MainSettingsView: React.FC<SettingsPanelProps> = ({
  setCurrentView,
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-start p-4 gap-4">
      <GeneralSettingsTemplate
        buttons={MAIN_SETTINGS}
        onAction={(action) => {
          switch (action) {
            case "app-settings":
              setCurrentView("app-settings");
              break;
            case "edit-profile":
              setCurrentView("edit-profile");
              break;
            case "break-connection":
              break;
            case "logout":
              authService.logout();
              break;
          }
        }}
      />
    </div>
  );
};
