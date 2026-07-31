import { storageProvider } from "../storage.provider";
import { STORE_KEYS } from "../store.keys";

/**
 * Estado de onboarding: primer arranque (habilita autostart) e introducción
 * completada (gate de LoginScreen/Introduction).
 */
export const onboardingRepository = {
  /** true si la app nunca se ha ejecutado en este dispositivo. */
  async isFirstLaunch(): Promise<boolean> {
    return (await storageProvider.get(STORE_KEYS.firstLaunch)) === null;
  },

  async markLaunched(): Promise<void> {
    await storageProvider.set(STORE_KEYS.firstLaunch, true);
  },

  async isIntroductionCompleted(): Promise<boolean> {
    return (
      (await storageProvider.get(STORE_KEYS.introductionCompleted)) === true
    );
  },

  async completeIntroduction(): Promise<void> {
    await storageProvider.set(STORE_KEYS.introductionCompleted, true);
  },

  async resetIntroduction(): Promise<void> {
    await storageProvider.delete(STORE_KEYS.introductionCompleted);
  },
};
