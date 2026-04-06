import { appService } from "@/services/app.service";
import { supabase } from "@/services/supabaseClient";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  register: async (username: string, email: string, password: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (data) {
        throw new Error("The email is already in use");
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

      return;
    } catch (error) {
      console.error(error);
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

      console.log("✅ Logout exitoso");
    } catch (error) {
      console.error("Error en logout:", error);
      throw error;
    }
  },
};
