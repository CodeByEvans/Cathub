import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useClampOnMouseUp(
  ref: React.RefObject<HTMLElement | null>,
  isLoading: boolean,
) {
  useEffect(() => {
    if (isLoading) return;
    const el = ref.current;
    if (!el) return;

    const handleMouseUp = () => {
      invoke("clamp_window")
        .then(() => console.log("✅ Ventana ajustada"))
        .catch((err) => console.error("❌ Error ajustando ventana:", err));
    };

    el.addEventListener("mouseup", handleMouseUp);

    return () => {
      el.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref, isLoading]);
}
