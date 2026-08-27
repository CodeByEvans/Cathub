import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { Minus, X, Power } from "lucide-react";
import { QuitConfirmModal } from "./QuitConfirmModal";
import { windowService } from "@/modules/settings/services/window.service";
import { ControlsPosition } from "@/@types/window.types";

const circleBase =
  "h-3.5 w-3.5 rounded-full flex items-center justify-center border border-black/10 transition-transform active:scale-90";

const glyphClass =
  "text-black/60 opacity-0 group-hover:opacity-100 transition-opacity";

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
      className={`${circleBase} bg-[#febc2e] hover:bg-[#ffcc4d]`}
      title="Minimizar"
    >
      <Minus className={`w-2.5 h-2.5 ${glyphClass}`} strokeWidth={2.5} />
    </button>
  );

  const closeButton = (
    <button
      key="close"
      type="button"
      onClick={hide}
      className={`${circleBase} bg-[#28c840] hover:bg-[#3ddb56]`}
      title="Ocultar al tray"
    >
      <X className={`w-2.5 h-2.5 ${glyphClass}`} strokeWidth={2.5} />
    </button>
  );

  const quitButton = (
    <button
      key="quit"
      type="button"
      onClick={() => setConfirmOpen(true)}
      className={`${circleBase} bg-[#ff5f57] hover:bg-[#ff7a73]`}
      title="Salir de Cathub"
    >
      <Power className={`w-2.5 h-2.5 ${glyphClass}`} strokeWidth={2.5} />
    </button>
  );

  const buttons = isWidget
    ? [quitButton]
    : position === "left"
      ? [quitButton, closeButton, minimizeButton]
      : [minimizeButton, closeButton, quitButton];

  return (
    <>
      <div className="flex items-center gap-1.5 group">{buttons}</div>

      <QuitConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={quit}
      />
    </>
  );
}
