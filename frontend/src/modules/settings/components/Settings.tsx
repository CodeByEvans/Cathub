import { useState } from "react";
import { ArrowLeft, Palette, UserX, UserCog, LogOut, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/globals/components/atoms/button";

type ThemeType = "light" | "dark" | "glass";
type WidgetSize = "lg" | "md" | "sm";
type ViewType = "main" | "theme";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  onEditProfile?: () => void;
  onBreakConnection?: () => void;
  onLogout?: () => void;
  size?: WidgetSize;
}

export function SettingsPanel({
  isOpen,
  onClose,
  currentTheme = "light",
  onThemeChange,
  onEditProfile,
  onBreakConnection,
  onLogout,
  size = "lg",
}: SettingsPanelProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(currentTheme);
  const [showConfirmBreak, setShowConfirmBreak] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("main");

  const handleThemeChange = (theme: ThemeType) => {
    setSelectedTheme(theme);
    document.documentElement.classList.remove("light", "dark", "glass");
    if (theme !== "light") {
      document.documentElement.classList.add(theme);
    }
    onThemeChange?.(theme);
  };

  const handleBreakConnection = () => {
    setShowConfirmBreak(false);
    onBreakConnection?.();
    onClose();
  };

  const handleClose = () => {
    setCurrentView("main");
    setShowConfirmBreak(false);
    onClose();
  };

  if (!isOpen) return null;

  const isSmall = size === "sm";
  const isMedium = size === "md";

  // Button sizing
  const buttonClasses = isSmall ? "h-full" : "h-full";
  const iconSize = isSmall ? "w-5 h-5" : isMedium ? "w-6 h-6" : "w-8 h-8";
  const textSize = isSmall ? "text-[10px]" : isMedium ? "text-xs" : "text-sm";
  const padding = isSmall ? "p-2" : isMedium ? "p-3" : "p-4";
  const gap = isSmall ? "gap-1.5" : isMedium ? "gap-2" : "gap-3";

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200 rounded-xl"
        onClick={handleClose}
      />

      {/* Panel - Full widget overlay */}
      <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-50 animate-in fade-in duration-300 rounded-xl overflow-hidden">
        {/* Main Menu */}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-50 p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
        >
          <X
            className={cn(
              isSmall ? "w-3 h-3" : "w-4 h-4",
              "text-muted-foreground",
            )}
          />
        </button>
        {currentView === "main" && (
          <div className={cn("h-full flex items-center", padding)}>
            <div className={cn("flex flex-1", gap)}>
              {/* Theme Button */}
              <Button
                variant="outline"
                className={cn(
                  buttonClasses,
                  "flex-1 flex flex-col items-center justify-center border-2 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 transition-all duration-200",
                )}
                onClick={() => setCurrentView("theme")}
              >
                <Palette className={cn(iconSize, "text-primary mb-1")} />
                <span
                  className={cn(
                    textSize,
                    " text-foreground text-center leading-tight",
                  )}
                >
                  Cambiar tema
                </span>
              </Button>

              {/* Edit Profile Button */}
              <Button
                variant="outline"
                className={cn(
                  buttonClasses,
                  "flex-1 flex flex-col items-center justify-center border-2 bg-secondary/50 hover:bg-secondary border-border/50 hover:border-border transition-all duration-200",
                )}
                onClick={() => {
                  onEditProfile?.();
                  handleClose();
                }}
              >
                <UserCog className={cn(iconSize, "text-primary mb-1")} />
                <span
                  className={cn(
                    textSize,
                    "text-foreground text-center leading-tight",
                  )}
                >
                  Editar perfil
                </span>
              </Button>

              {/* Break Connection Button */}
              {!showConfirmBreak ? (
                <Button
                  variant="outline"
                  className={cn(
                    buttonClasses,
                    "flex-1 flex flex-col items-center justify-center border-2 bg-secondary/50 hover:bg-destructive/10 border-border/50 hover:border-destructive/50 transition-all duration-200",
                  )}
                  onClick={() => setShowConfirmBreak(true)}
                >
                  <UserX className={cn(iconSize, "text-destructive mb-1")} />
                  <span
                    className={cn(
                      textSize,
                      "text-foreground text-center leading-tight",
                    )}
                  >
                    Romper conexión
                  </span>
                </Button>
              ) : (
                <div
                  className={cn(
                    buttonClasses,
                    "flex-1 flex flex-col items-center justify-center rounded-lg border-2 border-destructive bg-destructive/10",
                    isSmall ? "p-1.5" : "p-2",
                  )}
                >
                  <p
                    className={cn(
                      isSmall ? "text-[9px]" : "text-[10px]",
                      "text-destructive font-semibold text-center mb-1.5 leading-tight",
                    )}
                  >
                    ¿Seguro?
                  </p>
                  <div className="flex gap-1.5 w-full px-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "flex-1",
                        isSmall ? "h-5 text-[8px]" : "h-6 text-[9px]",
                      )}
                      onClick={() => setShowConfirmBreak(false)}
                    >
                      No
                    </Button>
                    <Button
                      size="sm"
                      className={cn(
                        "flex-1 bg-destructive hover:bg-destructive/90",
                        isSmall ? "h-5 text-[8px]" : "h-6 text-[9px]",
                      )}
                      onClick={handleBreakConnection}
                    >
                      Sí
                    </Button>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <Button
                variant="outline"
                className={cn(
                  buttonClasses,
                  "flex-1 flex flex-col items-center justify-center border-2 bg-secondary/50 hover:bg-secondary border-border/50 hover:border-border transition-all duration-200",
                )}
                onClick={() => {
                  onLogout?.();
                  handleClose();
                }}
              >
                <LogOut
                  className={cn(iconSize, "text-muted-foreground mb-1")}
                />
                <span
                  className={cn(
                    textSize,
                    "text-foreground text-center leading-tight",
                  )}
                >
                  Cerrar sesión
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Theme Selection View */}
        {currentView === "theme" && (
          <div className={cn("h-full flex flex-col", padding)}>
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("main")}
              className={cn(
                "self-start mb-2",
                isSmall ? "h-5 text-[9px]" : "h-6 text-[10px]",
              )}
            >
              <ArrowLeft
                className={cn(isSmall ? "w-2.5 h-2.5 mr-1" : "w-3 h-3 mr-1")}
              />
              Volver
            </Button>

            {/* Theme options in horizontal row */}
            <div className={cn("flex flex-1 items-center", gap)}>
              <button
                onClick={() => handleThemeChange("light")}
                className={cn(
                  "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2",
                  "bg-gradient-to-br from-slate-50 to-slate-100",
                  selectedTheme === "light"
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <div
                  className={cn(
                    "rounded-full bg-gradient-to-br from-slate-300 to-slate-400",
                    isSmall ? "w-8 h-8" : isMedium ? "w-12 h-12" : "w-16 h-16",
                  )}
                />
                <div className="text-center px-2">
                  <div
                    className={cn(
                      "text-slate-700 font-bold",
                      isSmall ? "text-xs" : "text-sm",
                    )}
                  >
                    Claro
                  </div>
                  <div
                    className={cn(
                      "text-slate-500 leading-tight",
                      isSmall ? "text-[9px]" : "text-[10px]",
                    )}
                  >
                    Para el día
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={cn(
                  "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2",
                  "bg-gradient-to-br from-slate-800 to-slate-900",
                  selectedTheme === "dark"
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-slate-700 hover:border-slate-600",
                )}
              >
                <div
                  className={cn(
                    "rounded-full bg-gradient-to-br from-slate-400 to-slate-500",
                    isSmall ? "w-8 h-8" : isMedium ? "w-12 h-12" : "w-16 h-16",
                  )}
                />
                <div className="text-center px-2">
                  <div
                    className={cn(
                      "text-slate-300 font-bold",
                      isSmall ? "text-xs" : "text-sm",
                    )}
                  >
                    Oscuro
                  </div>
                  <div
                    className={cn(
                      "text-slate-400 leading-tight",
                      isSmall ? "text-[9px]" : "text-[10px]",
                    )}
                  >
                    Para la noche
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleThemeChange("glass")}
                className={cn(
                  "flex-1 h-full rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2",
                  "bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm",
                  selectedTheme === "glass"
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-slate-300/30 hover:border-slate-400/50",
                )}
              >
                <div
                  className={cn(
                    "rounded-full bg-gradient-to-br from-blue-300 to-slate-400 opacity-80",
                    isSmall ? "w-8 h-8" : isMedium ? "w-12 h-12" : "w-16 h-16",
                  )}
                />
                <div className="text-center px-2">
                  <div
                    className={cn(
                      "text-slate-700 font-bold",
                      isSmall ? "text-xs" : "text-sm",
                    )}
                  >
                    Cristal
                  </div>
                  <div
                    className={cn(
                      "text-slate-600 leading-tight",
                      isSmall ? "text-[9px]" : "text-[10px]",
                    )}
                  >
                    Transparente
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
