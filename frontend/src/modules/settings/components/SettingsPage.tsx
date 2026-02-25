import { useEffect, useState } from "react";
import { SettingsProps, ViewType } from "../@types/settings.types";
import { X } from "lucide-react";
import { MainSettingsView } from "../views/MainSettingsView";
import { AppSettingsView } from "../views/AppSettingsView";
import { themeService } from "../services/theme.service";
import { ThemeType } from "@/@types/theme.types";
import { BehaviorType } from "@/@types/window.types";
import { windowService } from "../services/window.service";
import { BackButton } from "./molecules/BackButton";
import { ThemeSettingsView } from "../views/ThemeSettingsView";
import { WindowSettingsView } from "../views/WindowSettingsView";

export const SettingsPage: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>("light");
  const [behavior, setBehavior] = useState<BehaviorType>("app");
  const [history, setHistory] = useState<ViewType[]>([]);

  useEffect(() => {
    const init = async () => {
      const current = await themeService.getTheme();
      setSelectedTheme(current.theme);
      const windowBehavior = await windowService.currentBehavior();
      setBehavior(windowBehavior);
    };
    init();
  }, []);

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
      <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-50 animate-in fade-in duration-300 rounded-xl overflow-hidden">
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
      </div>
    </>
  );
};
