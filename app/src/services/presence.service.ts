import { supabase } from "./supabaseClient";

interface PresenceStatus {
  isOnline: boolean;
  lastSeen: Date | null;
}

type RealtimeStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR";

class PresenceService {
  private userId: string | null = null;
  private partnerId: string | null = null;
  private connectionId: string | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private onlineStatus: PresenceStatus = { isOnline: false, lastSeen: null };
  private onStatusChangeCallback: ((status: PresenceStatus) => void) | null =
    null;
  private visibilityHandler: (() => void) | null = null;
  private isReconnecting = false;
  private stopped = false;
  private readonly RECONNECT_DELAY_MS = 3000;

  getCurrentStatus() {
    return this.onlineStatus;
  }

  onStatusChange(callback: (status: PresenceStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  // ========== INICIO ==========

  async start(userId: string, partnerId: string, connectionId: string) {
    this.stopped = false;
    this.userId = userId;
    this.partnerId = partnerId;
    this.connectionId = connectionId;

    if (!this.partnerId) {
      console.warn("⚠️ No hay partner_id");
      return;
    }

    // Leer last_seen inicial del partner desde BD
    await this.fetchPartnerLastSeen();

    await this.connect();
    this.setupVisibilityListener();
  }

  // ========== CONEXIÓN ==========

  private async connect() {
    if (this.stopped || !this.partnerId || !this.userId) return;

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.channel = supabase
      .channel(`presence:${this.connectionId}`) // canal compartido con el partner
      .on("presence", { event: "sync" }, () => {
        const state = this.channel!.presenceState();
        const partnerOnline = Object.values(state)
          .flat()
          .some((p: any) => p.user_id === this.partnerId);

        this.updateStatus({
          isOnline: partnerOnline,
          lastSeen: this.onlineStatus.lastSeen, // conservar el último conocido
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const partnerLeft = leftPresences.some(
          (p: any) => p.user_id === this.partnerId,
        );
        if (partnerLeft) {
          // Partner se desconectó — leer su last_seen actualizado de la BD
          this.fetchPartnerLastSeen();
        }
      })
      .subscribe(async (status: RealtimeStatus) => {
        if (status === "SUBSCRIBED") {
          this.isReconnecting = false;
          // Anunciar que estoy online — Supabase mantiene el heartbeat automáticamente
          await this.channel!.track({ user_id: this.userId });
        }

        if (
          status === "TIMED_OUT" ||
          status === "CLOSED" ||
          status === "CHANNEL_ERROR"
        ) {
          console.warn(`⚠️ Canal ${status}, reintentando...`);
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

  // ========== FETCH last_seen (solo lectura, no heartbeat) ==========

  private async fetchPartnerLastSeen() {
    if (!this.partnerId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("last_seen")
        .eq("id", this.partnerId)
        .single();

      if (error || !data?.last_seen) return;

      const lastSeen = new Date(data.last_seen);
      this.updateStatus({
        isOnline: this.onlineStatus.isOnline,
        lastSeen,
      });
    } catch (err) {
      console.error("❌ Error en fetchPartnerLastSeen:", err);
    }
  }

  // Llamar esto desde appService.cleanup() al cerrar sesión
  async writeLastSeen() {
    if (!this.userId) return;
    await supabase
      .from("profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", this.userId);
  }

  // ========== VISIBILIDAD ==========

  private setupVisibilityListener() {
    if (typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          this.connect();
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  // ========== HELPERS ==========

  private updateStatus(status: PresenceStatus) {
    this.onlineStatus = status;
    this.onStatusChangeCallback?.(status);
  }

  // ========== PARADA ==========

  async stop() {
    this.stopped = true;
    this.isReconnecting = false;

    await this.writeLastSeen();

    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }

    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }

    this.userId = null;
    this.partnerId = null;
  }
}

export const presenceService = new PresenceService();
