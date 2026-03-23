// services/presence.service.ts
import { supabase } from "./supabaseClient";
import { getValue } from "./store.service";

interface PresenceStatus {
  isOnline: boolean;
  lastSeen: Date | null;
}

type RealtimeStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR";

class PresenceService {
  private partnerId: string | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private onlineStatus: PresenceStatus = { isOnline: false, lastSeen: null };
  private onStatusChangeCallback: ((status: PresenceStatus) => void) | null =
    null;
  private visibilityHandler: (() => void) | null = null;
  private isReconnecting = false;
  private stopped = false;

  private readonly ONLINE_THRESHOLD_MS = 15000;
  private readonly RECONNECT_DELAY_MS = 3000;

  getCurrentStatus() {
    return this.onlineStatus;
  }

  onStatusChange(callback: (status: PresenceStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  // ========== INICIO ==========

  async start(_userId?: string) {
    this.stopped = false;
    this.partnerId = await getValue("partner_id");

    if (!this.partnerId) {
      console.warn("⚠️ No hay partner_id, no hay nada que escuchar");
      return;
    }

    await this.connect();
    this.setupVisibilityListener();
  }

  // ========== CONEXIÓN ==========

  private async connect() {
    if (this.stopped || !this.partnerId) return;

    // Limpiar canal previo si existe
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    // Leer estado actual antes de suscribirse (cubre el hueco mientras estaba desconectado)
    await this.fetchPartnerStatus();

    this.channel = supabase
      .channel(`partner-presence:${this.partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${this.partnerId}`,
        },
        (payload) => {
          if (!payload.new?.last_seen) return;
          const lastSeen = new Date(payload.new.last_seen);
          const isOnline =
            Date.now() - lastSeen.getTime() < this.ONLINE_THRESHOLD_MS;
          this.updateStatus({ isOnline, lastSeen });
        },
      )
      .subscribe((status: RealtimeStatus) => {
        if (status === "SUBSCRIBED") {
          // Al (re)suscribirse con éxito, re-leer por si hubo cambios durante la reconexión
          this.isReconnecting = false;
          this.fetchPartnerStatus();
        }

        if (
          status === "TIMED_OUT" ||
          status === "CLOSED" ||
          status === "CHANNEL_ERROR"
        ) {
          console.warn(
            `⚠️ Canal ${status}, reintentando en ${this.RECONNECT_DELAY_MS}ms...`,
          );
          this.scheduleReconnect();
        }
      });
  }

  private scheduleReconnect() {
    if (this.isReconnecting || this.stopped) return;
    this.isReconnecting = true;

    setTimeout(() => {
      if (!this.stopped) this.connect();
    }, this.RECONNECT_DELAY_MS);
  }

  // ========== FETCH PUNTUAL ==========

  private async fetchPartnerStatus() {
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
        this.updateStatus({ isOnline: false, lastSeen: null });
        return;
      }

      const lastSeen = new Date(data.last_seen);
      const isOnline =
        Date.now() - lastSeen.getTime() < this.ONLINE_THRESHOLD_MS;
      this.updateStatus({ isOnline, lastSeen });
    } catch (err) {
      console.error("❌ Error en fetchPartnerStatus:", err);
    }
  }

  // ========== VISIBILIDAD (web / RN) ==========

  private setupVisibilityListener() {
    // Web
    if (typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          console.log("👁️ App visible, reconectando...");
          this.connect();
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
      return;
    }

    // React Native: llama manualmente a handleAppForeground() desde tu AppState listener
    // AppState.addEventListener('change', state => {
    //   if (state === 'active') presenceService.handleAppForeground();
    // });
  }

  /** Llama esto desde AppState en React Native cuando la app vuelve al primer plano */
  handleAppForeground() {
    if (!this.stopped) {
      console.log("📱 App en primer plano, reconectando...");
      this.connect();
    }
  }

  // ========== HELPERS ==========

  private updateStatus(status: PresenceStatus) {
    this.onlineStatus = status;
    this.onStatusChangeCallback?.(status);
  }

  // ========== PARADA ==========

  async stop() {
    console.log("🛑 Deteniendo presence service");
    this.stopped = true;
    this.isReconnecting = false;

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.partnerId = null;
  }
}

export const presenceService = new PresenceService();
