import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useClampOnMouseUp(isLoading: boolean) {
  useEffect(() => {
    if (isLoading) return;

    const handleMouseUp = () => {
      invoke("clamp_window")
        .then(() => console.log("✅ Ventana ajustada"))
        .catch((err) => console.error("❌ Error ajustando ventana:", err));
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isLoading]);
}
