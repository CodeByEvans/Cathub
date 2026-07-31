import { authService } from "@/modules/auth/services/auth.service";
import { toast } from "@/components/ui/sonner";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { AppError } from "@/shared/errors/AppError";
import { useConnection } from "@/modules/connection/contexts/ConnectionContext";

import { GeneralSettingsTemplate } from "../components/templates/GeneralSettingsTemplate";
import { MAIN_SETTINGS } from "../constants/settings-navigation";
import { ViewType } from "../@types/settings.types";

export interface SettingsPanelProps {
  setCurrentView: (view: ViewType) => void;
}

export const MainSettingsView: React.FC<SettingsPanelProps> = ({
  setCurrentView,
}) => {
  const { breakConnection } = useConnection();

  const handleBreakConnection = async () => {
    try {
      const result = await breakConnection();
      if (result) {
        toast.success("Conexión rota correctamente");
      } else {
        // false = no había conexión cacheada que romper
        handleAppError(new AppError("connection/break-failed"), "connection");
      }
    } catch (error) {
      handleAppError(error, "connection");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start p-4 gap-4">
      <GeneralSettingsTemplate
        buttons={MAIN_SETTINGS}
        onAction={(action) => {
          switch (action) {
            case "app-settings":
              setCurrentView("app-settings");
              break;
            case "audio-settings":
              setCurrentView("audio-settings");
              break;
            case "edit-profile":
              setCurrentView("edit-profile");
              break;
            case "break-connection":
              handleBreakConnection();
              break;
            case "logout":
              authService
                .logout()
                .catch((error) =>
                  handleAppError(error, "auth", "auth/logout-failed"),
                );
              break;
          }
        }}
      />
    </div>
  );
};
