import { useState } from "react";
import { ThemeColor, ThemeType, ViewType } from "./@types/settings.types";
import { X } from "lucide-react";

import { BehaviorType } from "@/@types/window.types";
import { BackButton } from "./components/molecules/BackButton";
import {
  MainSettingsView,
  AppSettingsView,
  ThemeSettingsView,
  WindowSettingsView,
  EditProfileView,
  ColorSettingsView,
} from "./views";
import { themeService, windowService } from "./services";

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    themeService.currentTheme(),
  );
  const [selectedColor, setSelectedColor] = useState<ThemeColor>(
    themeService.currentThemeColor(),
  );
  const [behavior, setBehavior] = useState<BehaviorType>(
    windowService.currentBehavior(),
  );
  const [history, setHistory] = useState<ViewType[]>([]);

  const goToView = (view: ViewType) => {
    setHistory((prev) => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setCurrentView(last);
      return prev.slice(0, -1);
    });
  };

  const handleClose = () => {
    setCurrentView("main");
    onClose();
  };

  if (!isOpen) return null;
  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200 rounded-xl" />
      {/* Panel - Full widget overlay */}
      <div className="absolute inset-0 bg-card/10 dark:bg-card/30 backdrop-blur-md z-50 animate-in fade-in duration-300 rounded-xl overflow-hidden">
        {/* Main Menu */}
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-50 p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {currentView !== "main" && <BackButton onClickAction={goBack} />}

        {currentView === "main" && (
          <MainSettingsView setCurrentView={goToView} />
        )}

        {currentView === "app-settings" && (
          <AppSettingsView setCurrentView={goToView} />
        )}

        {currentView === "theme-settings" && (
          <ThemeSettingsView
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
          />
        )}

        {currentView === "window-settings" && (
          <WindowSettingsView
            selectedBehavior={behavior}
            onBehaviorChange={setBehavior}
          />
        )}

        {currentView === "edit-profile" && <EditProfileView />}

        {currentView === "color-settings" && (
          <ColorSettingsView
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        )}
      </div>
    </>
  );
};
