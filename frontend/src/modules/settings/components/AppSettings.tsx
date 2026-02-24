import { Button } from "@/globals/components/atoms/button";
import { AppWindow, ArrowLeft, Palette } from "lucide-react";
import React, { useEffect } from "react";
import { ThemeSettings } from "./ThemeSettings";
import { themeService } from "@/modules/settings/services/theme.service";
import { WindowSettings } from "./WindowSettings";
import { windowService } from "../services/window.service";

interface AppSettingsProps {
  setCurrentView: (view: "main" | "app-settings") => void;
}

const BackButton: React.FC<{ onClickAction: () => void }> = ({
  onClickAction,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="flex items-center gap-1 self-start"
    onClick={onClickAction}
  >
    <ArrowLeft className="w-3 h-3" />
    Volver
  </Button>
);

export const AppSettings: React.FC<AppSettingsProps> = ({ setCurrentView }) => {
  const [activeSection, setActiveSection] = React.useState<
    "main" | "theme" | "window"
  >("main");
  const [selectedTheme, setSelectedTheme] = React.useState<
    "light" | "dark" | "glass"
  >("light");
  const [behavior, setBehavior] = React.useState<"widget" | "app" | "floating">(
    "app",
  );

  useEffect(() => {
    const init = async () => {
      const current = await themeService.getTheme();
      setSelectedTheme(current.theme);
      const windowBehavior = await windowService.currentBehavior();
      setBehavior(windowBehavior);
    };
    init();
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-start p-4 gap-4">
      {/* Botón volver separado */}
      {activeSection === "main" && (
        <BackButton onClickAction={() => setCurrentView("main")} />
      )}

      {activeSection !== "main" && (
        <BackButton onClickAction={() => setActiveSection("main")} />
      )}

      {/* Contenedor de botones de acción */}
      {activeSection === "main" && (
        <div className="flex flex-1 gap-3 w-full">
          <Button
            variant="outline"
            className="h-full flex-1 flex flex-col items-center justify-center border-2 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200"
            onClick={() => setActiveSection("theme")}
          >
            <Palette className="w-6 h-6 text-primary mb-1" />
            <span className="text-sm text-foreground text-center leading-tight">
              Cambiar tema
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-full flex-1 flex flex-col items-center justify-center border-2 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200"
            onClick={() => setActiveSection("window")}
          >
            <AppWindow className="w-6 h-6 text-primary mb-1" />
            <span className="text-sm text-foreground text-center leading-tight">
              Modo de ventana
            </span>
          </Button>
        </div>
      )}

      {/* Sección Cambiar Tema */}
      {activeSection === "theme" && (
        <ThemeSettings
          selectedTheme={selectedTheme}
          setSelectedTheme={(theme) => setSelectedTheme(theme)}
        />
      )}

      {activeSection === "window" && (
        <WindowSettings
          selectedBehavior={behavior}
          onBehaviorChange={(b) => setBehavior(b)}
        />
      )}
    </div>
  );
};
