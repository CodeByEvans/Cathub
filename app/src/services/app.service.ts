import { supabase } from "./supabaseClient";
import { sessionRepository } from "@/shared/infrastructure/repositories/session.repository";
import { themeService } from "@/modules/settings/services/theme.service";
import { ThemeType } from "@/modules/settings/@types/settings.types";
import { audioService } from "./audio.service";

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
    const cachedUserId = await sessionRepository.getUserId();
    if (cachedUserId && cachedUserId !== user.id) {
      await this.clearCache();
    }
    await sessionRepository.setUserId(user.id);

    return { theme };
  }

  async clearCache() {
    await sessionRepository.clearConnectionCache();
    await sessionRepository.deleteUserId();
  }
}

export const appService = new AppService();
