import { useState, useEffect } from "react";
import { ThemeType, ViewType } from "./@types/settings.types";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { BehaviorType, ControlsPosition } from "@/@types/window.types";
import { BackButton } from "./components/molecules/BackButton";
import {
  MainSettingsView,
  AppSettingsView,
  ThemeSettingsView,
  WindowSettingsView,
  WindowControlsSettingsView,
  EditProfileView,
  ColorSettingsView,
  PersonalizeView,
} from "./views";
import { themeService, windowService } from "./services";
import React from "react";
import { AudioSettingsView } from "./views/AudioSettingsView";

export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenColorPicker?: () => void;
  onOpenWidgetsEditor?: () => void;
  controlsPosition: ControlsPosition;
  onControlsPositionChange: (position: ControlsPosition) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  onOpenColorPicker,
  onOpenWidgetsEditor,
  controlsPosition,
  onControlsPositionChange,
}) => {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    themeService.currentTheme(),
  );
  const [selectedColor, setSelectedColor] = useState(
    themeService.currentThemeColor(),
  );
  const [behavior, setBehavior] = useState<BehaviorType>(
    windowService.getBehavior(),
  );
  const historyRef = React.useRef<ViewType[]>([]);

  useEffect(() => {
    if (isOpen) setCurrentView("main");
  }, [isOpen]);

  const goToView = (view: ViewType) => {
    historyRef.current.push(currentView);
    setCurrentView(view);
  };

  const goBack = () => {
    const last = historyRef.current.pop();
    if (last) setCurrentView(last);
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
      <div className="absolute inset-0 bg-card/10 dark:bg-card/30 backdrop-blur-md z-50 animate-in fade-in duration-300 rounded-xl overflow-hidden" data-tauri-drag-region>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-50 p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {currentView !== "main" && <BackButton onClickAction={goBack} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            className="h-full"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {currentView === "main" && (
              <MainSettingsView
                setCurrentView={goToView}
                onOpenWidgetsEditor={onOpenWidgetsEditor ?? (() => {})}
              />
            )}

            {currentView === "app-settings" && (
              <AppSettingsView
                setCurrentView={goToView}
                onOpenColorPicker={onOpenColorPicker ?? (() => {})}
              />
            )}

            {currentView === "personalize" && (
              <PersonalizeView
                selectedTheme={selectedTheme}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                setSelectedTheme={setSelectedTheme}
              />
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

            {currentView === "window-controls" && (
              <WindowControlsSettingsView
                selectedPosition={controlsPosition}
                onPositionChange={onControlsPositionChange}
              />
            )}

            {currentView === "edit-profile" && <EditProfileView />}

            {currentView === "color-settings" && (
              <ColorSettingsView
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            )}
            {currentView === "audio-settings" && <AudioSettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};
