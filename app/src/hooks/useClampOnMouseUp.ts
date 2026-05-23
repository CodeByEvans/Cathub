import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useClampOnMouseUp() {
  useEffect(() => {
    const handleMouseUp = () => {
      invoke("clamp_window").catch(() => {});
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
}
