import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { hasValue, setValue } from "./store.service";

export async function initAutostart() {
  const firstLaunch = await hasValue("firstLaunch");

  if (!import.meta.env.DEV) {
    if (!firstLaunch) {
      console.log("🚀 Primera vez que se ejecuta");
      await enable();
      await setValue("firstLaunch", true);
    }
  } else {
    try {
      console.log("🛠️ Modo dev, autostart desactivado");
      await disable();
      const enabled = await isEnabled();
      console.log("Autostart desactivado:", !enabled);
    } catch (error) {
      console.error("Error al desactivar autostart:", error);
    }
  }
}
