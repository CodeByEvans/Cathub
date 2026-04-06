import { supabase } from "./supabaseClient";
import { getValue, setValue, deleteValue } from "./store.service";
import { themeService } from "@/modules/settings/services/theme.service";
import { ThemeType } from "@/modules/settings/@types/settings.types";
import { audioService } from "./audio.service";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";

class AppService {
  async initialize(): Promise<{ theme: ThemeType }> {
    const theme = themeService.currentTheme();
    await audioService.init();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("No hay usuario autenticado");

    // Limpiar caché si cambió el usuario
    const cachedUserId = await getValue(STORE_KEYS.userId);
    if (cachedUserId && cachedUserId !== user.id) {
      await this.clearCache();
    }
    await setValue(STORE_KEYS.userId, user.id);

    return { theme };
  }

  async clearCache() {
    await deleteValue(STORE_KEYS.connectionId);
    await deleteValue(STORE_KEYS.partnerId);
    await deleteValue(STORE_KEYS.partnerName);
    await deleteValue(STORE_KEYS.userId);
  }
}

export const appService = new AppService();
