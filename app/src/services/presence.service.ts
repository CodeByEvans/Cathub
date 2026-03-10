// services/presence.service.ts
import { supabase } from "./supabaseClient";
import { getValue } from "./store.service";

interface PresenceStatus {
  isOnline: boolean;
  lastSeen: Date | null;
}

class PresenceService {
  // Para enviar (heartbeat)
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatFrequency = 5000; // 5 segundos
  private currentUserId: string | null = null;

  // Para recibir (checking)
  private checkInterval: NodeJS.Timeout | null = null;
  private partnerId: string | null = null;

  private onlineStatus: PresenceStatus = {
    isOnline: false,
    lastSeen: null,
  };

  getCurrentStatus() {
    return this.onlineStatus;
  }

  // Threshold
  private readonly ONLINE_THRESHOLD_MS = 15000; // 15 segundos

  // Callbacks
  private onStatusChangeCallback: ((status: PresenceStatus) => void) | null =
    null;

  /**
   * Inicia TODO:
   * - Envía heartbeat del usuario actual
   * - Escucha heartbeat de la pareja
   */
  async start(userId: string) {
    this.currentUserId = userId;
    this.partnerId = await getValue("partner_id");

    if (!this.partnerId) {
      console.warn("⚠️ No hay partner_id, solo enviando heartbeat propio");
      this.startHeartbeat();
      return;
    }

    // console.log("🚀 Iniciando presence service");
    // console.log("   📤 Enviando heartbeat como:", userId);
    // console.log("   📥 Escuchando heartbeat de:", this.partnerId);

    // Iniciar ambos
    this.startHeartbeat();
    this.startListening();
  }

  // ========== HEARTBEAT (enviar) ==========

  private startHeartbeat() {
    if (!this.currentUserId) return;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // console.log("💓 Iniciando heartbeat");

    // Enviar inmediatamente
    this.sendHeartbeat();

    // Luego cada 5 segundos
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatFrequency);
  }

  private async sendHeartbeat() {
    if (!this.currentUserId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", this.currentUserId);

      if (error) {
        console.error("❌ Error en heartbeat:", error);
      }
    } catch (err) {
      console.error("❌ Error enviando heartbeat:", err);
    }
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      // console.log("⏹️ Heartbeat detenido");
    }
  }

  // ========== LISTENING (recibir) ==========

  private async startListening() {
    if (!this.partnerId) return;

    await this.checkPartnerStatus();

    const channel = supabase
      .channel("partner-presence")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${this.partnerId}`,
        },
        (payload) => {
          const lastSeen = new Date(payload.new.last_seen);
          const isOnline =
            Date.now() - lastSeen.getTime() < this.ONLINE_THRESHOLD_MS;
          const status = { isOnline, lastSeen };
          this.onlineStatus = status;
          this.onStatusChangeCallback?.(status);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  private async checkPartnerStatus() {
    if (!this.partnerId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("last_seen")
        .eq("id", this.partnerId)
        .single();

      if (error) {
        console.error("❌ Error consultando pareja:", error);
        return;
      }

      if (!data?.last_seen) {
        this.notifyStatusChange({ isOnline: false, lastSeen: null });
        return;
      }

      const lastSeen = new Date(data.last_seen);
      const diffMs = Date.now() - lastSeen.getTime();
      const isOnline = diffMs < this.ONLINE_THRESHOLD_MS;

      /*console.log(
        `${isOnline ? "🟢" : "🔴"} Pareja ${isOnline ? "ONLINE" : "OFFLINE"} (${Math.floor(diffMs / 1000)}s)`,
      );
      */

      this.notifyStatusChange({ isOnline, lastSeen });
      this.onlineStatus = { isOnline, lastSeen };
    } catch (err) {
      console.error("❌ Error en checkPartnerStatus:", err);
    }
  }

  private stopListening() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("⏹️ Listening detenido");
    }
  }

  // ========== CALLBACKS ==========

  private notifyStatusChange(status: PresenceStatus) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  onStatusChange(callback: (status: PresenceStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  // ========== PUBLIC API ==========

  /**
   * Detiene TODO (heartbeat + listening)
   */
  stop() {
    console.log("🛑 Deteniendo presence service");
    this.stopHeartbeat();
    this.stopListening();
    this.currentUserId = null;
    this.partnerId = null;
  }
}

export const presenceService = new PresenceService();
