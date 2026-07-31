import { appService } from "@/services/app.service";
import { supabase } from "@/services/supabaseClient";
import { AppError } from "@/shared/errors/AppError";
import { logger } from "@/shared/logger";

export const authService = {
  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  },
  register: async (username: string, email: string, password: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (data) {
      throw new AppError("auth/email-in-use");
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          username,
        },
      },
    });
    if (error) {
      throw error;
    }
  },
  async logout() {
    try {
      // Limpiar todo antes de logout
      await appService.clearCache();

      // Hacer logout en Supabase
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      logger.info("auth", "Logout exitoso");
    } catch (error) {
      logger.error("auth", "Error en logout", error);
      throw error;
    }
  },
};
