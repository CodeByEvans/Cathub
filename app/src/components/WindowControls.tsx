import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { Minus, X, Power } from "lucide-react";
import { QuitConfirmModal } from "./QuitConfirmModal";
import { windowService } from "@/modules/settings/services/window.service";
import { ControlsPosition } from "@/@types/window.types";

const controlClass =
  "h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent/40 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

const quitClass =
  "h-6 w-6 inline-flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function WindowControls({
  position = "right",
}: {
  position?: ControlsPosition;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const behavior = windowService.getBehavior();
  const isWidget = behavior === "widget";

  const minimize = () => {
    getCurrentWindow()
      .minimize()
      .catch(() => {});
  };

  const hide = () => {
    getCurrentWindow()
      .hide()
      .catch(() => {});
  };

  const quit = () => {
    invoke("quit_app").catch(() => {});
  };

  const minimizeButton = (
    <button
      key="minimize"
      type="button"
      onClick={minimize}
      className={controlClass}
      title="Minimizar"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
  );

  const closeButton = (
    <button
      key="close"
      type="button"
      onClick={hide}
      className={controlClass}
      title="Ocultar al tray"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );

  const quitButton = (
    <button
      key="quit"
      type="button"
      onClick={() => setConfirmOpen(true)}
      className={quitClass}
      title="Salir de Cathub"
    >
      <Power className="w-3.5 h-3.5" />
    </button>
  );

  const buttons = isWidget
    ? [quitButton]
    : position === "left"
      ? [quitButton, closeButton, minimizeButton]
      : [minimizeButton, closeButton, quitButton];

  return (
    <>
      <div className="flex items-center gap-0.5">{buttons}</div>

      <QuitConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={quit}
      />
    </>
  );
}
