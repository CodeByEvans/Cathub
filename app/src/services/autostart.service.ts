import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { onboardingRepository } from "@/shared/infrastructure/repositories/onboarding.repository";
import { logger } from "@/shared/logger";

export async function initAutostart() {
  const firstLaunch = await onboardingRepository.isFirstLaunch();

  if (!import.meta.env.DEV) {
    if (firstLaunch) {
      logger.info("autostart", "Primer arranque: activando autostart");
      await enable();
      await onboardingRepository.markLaunched();
    }
  } else {
    try {
      await disable();
      const enabled = await isEnabled();
      logger.debug("autostart", `Modo dev, autostart desactivado: ${!enabled}`);
    } catch (error) {
      logger.error("autostart", "Error al desactivar autostart", error);
    }
  }
}
