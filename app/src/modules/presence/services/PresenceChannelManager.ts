import { RealtimeChannel } from "@supabase/supabase-js";
import { IRealtimeProvider } from "./interfaces/IRealtimeProvider";
import { PresenceEventBus } from "./PresenceEventBus";

type RealtimeStatus = "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR";

export class PresenceChannelManager {
  private channel: RealtimeChannel | null = null;

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private readonly userId: string,
    private readonly partnerId: string,
    private readonly connectionId: string,
    private readonly realtime: IRealtimeProvider,
    private readonly events: PresenceEventBus,
  ) {}

  async connect() {
    const channel = this.realtime.createChannel(this.connectionId);
    this.channel = channel;
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const partnerOnline = Object.values(state)
        .flat()
        .some((p: any) => p.user_id === this.partnerId);
      this.events.emitPartnerStatusChange(partnerOnline);
    });

    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const partnerLeft = leftPresences.some(
        (p: any) => p.user_id === this.partnerId,
      );
      if (partnerLeft) {
        this.events.emitPartnerLeft();
      }
    });

    channel.subscribe(async (status: RealtimeStatus) => {
      if (status === "SUBSCRIBED") {
        this.reconnectAttempts = 0;
        await channel.track({ user_id: this.userId });
      }

      if (
        status === "CLOSED" ||
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT"
      ) {
        this.reconnect();
      }
    });
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.connect();
  }

  async disconnect() {
    if (this.channel) {
      await this.realtime.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
