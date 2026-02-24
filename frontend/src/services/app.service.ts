import { supabase } from "./supabaseClient";
import { connectionService } from "@/modules/connection/services/connection.service";
import { callService } from "@/modules/call/services/call.service";
import { presenceService } from "./presence.service"; // ← Importar
import { getValue, setValue, deleteValue } from "./store.service";
import { Theme, themeService } from "@/modules/settings/services/theme.service";

export interface AppState {
  isLinked: boolean;
  partnerName: string;
  partnerId: string | null;
  connectionId: string | null;
}

class AppService {
  async initialize(): Promise<AppState & { theme: Theme }> {
    // --------------------------
    // 0. Inicializar theme
    // --------------------------
    const theme = themeService.currentTheme();
    // Aquí tu singleton ya actualizó document.documentElement con la clase correcta

    // --------------------------
    // 1. Obtener usuario actual
    // --------------------------
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("No hay usuario autenticado");
    }

    const currentUserId = user.id;

    // --------------------------
    // 2. Verificar caché
    // --------------------------
    const cachedUserId = await getValue("user_id");
    if (cachedUserId && cachedUserId !== currentUserId) {
      console.log("🧹 Usuario diferente detectado, limpiando caché...");
      await this.clearCache();
    }

    await setValue("user_id", currentUserId);

    // --------------------------
    // 3. Intentar obtener conexión desde caché
    // --------------------------
    const cachedConnectionId = await getValue("connection_id");
    const cachedPartnerId = await getValue("partner_id");
    const cachedPartnerName = await getValue("partner_name");

    if (cachedConnectionId && cachedPartnerId) {
      const isValid = await this.validateConnection(
        currentUserId,
        cachedPartnerId,
        cachedConnectionId,
      );

      if (isValid) {
        // console.log("✅ Conexión en caché válida");

        await presenceService.start(currentUserId);
        await callService.initialize();

        return {
          isLinked: true,
          partnerName: cachedPartnerName || "Amor",
          partnerId: cachedPartnerId,
          connectionId: cachedConnectionId,
          theme,
        };
      } else {
        console.log("⚠️ Conexión en caché inválida, limpiando...");
        await this.clearCache();
      }
    }

    // --------------------------
    // 4. Buscar conexión en BD
    // --------------------------
    const connection = await connectionService.getConnection();

    if (connection) {
      console.log("✅ Conexión encontrada:", connection);

      await setValue("connection_id", connection.id);
      await setValue("partner_name", connection.partnerName);

      const partnerId = await this.getPartnerIdFromConnection(
        connection.id,
        currentUserId,
      );

      if (partnerId) {
        await setValue("partner_id", partnerId);
      }

      await presenceService.start(currentUserId);
      await callService.initialize();

      return {
        isLinked: true,
        partnerName: connection.partnerName,
        partnerId: partnerId,
        connectionId: connection.id,
        theme,
      };
    }

    // --------------------------
    // 5. Usuario sin pareja
    // --------------------------
    console.log("ℹ️ Usuario sin pareja");

    return {
      isLinked: false,
      partnerName: "",
      partnerId: null,
      connectionId: null,
      theme,
    };
  }

  private async validateConnection(
    userId: string,
    partnerId: string,
    connectionId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("id", connectionId)
        .single();

      if (error || !data) {
        return false;
      }

      const isUserInConnection =
        data.user_a === userId || data.user_b === userId;
      const isPartnerInConnection =
        data.user_a === partnerId || data.user_b === partnerId;
      const isDifferent = data.user_a !== data.user_b;

      return isUserInConnection && isPartnerInConnection && isDifferent;
    } catch (error) {
      console.error("Error validando conexión:", error);
      return false;
    }
  }

  private async getPartnerIdFromConnection(
    connectionId: string,
    currentUserId: string,
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("connections")
        .select("user_a, user_b")
        .eq("id", connectionId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.user_a === currentUserId ? data.user_b : data.user_a;
    } catch (error) {
      console.error("Error obteniendo partner_id:", error);
      return null;
    }
  }

  async clearCache() {
    await deleteValue("connection_id");
    await deleteValue("partner_id");
    await deleteValue("partner_name");

    console.log("✅ Caché limpiada");
  }

  async cleanup() {
    await deleteValue("connection_id");
    await deleteValue("partner_id");
    await deleteValue("partner_name");
    await deleteValue("user_id");

    presenceService.stop();

    await callService.destroy();
    console.log("✅ App limpiada completamente");
  }
}

export const appService = new AppService();
