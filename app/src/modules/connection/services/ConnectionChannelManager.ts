import { RealtimeChannel } from "@supabase/supabase-js";
import { ConnectionEventBus } from "./ConnectionEventBus";
import { IRealtimeProvider } from "@/interfaces/IRealtimeProvider";

class ConnectionChannelManager {
  private channel: RealtimeChannel | null = null;

  constructor(
    private readonly userId: string,
    private readonly connectionId: string,
    private readonly realtime: IRealtimeProvider,
    private readonly events: ConnectionEventBus,
  ) {}

  async connect() {
    this.channel = this.realtime.createChannel(this.connectionId);

    this.channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "connections" },
      (payload) => {
        const newConnection = payload.new;
        if (
          newConnection.user_a === this.userId ||
          newConnection.user_b === this.userId
        ) {
          this.events.emitConnectionAccepted(newConnection);
        }
      },
    );

    this.channel.subscribe();
  }

  async disconnect() {
    if (!this.channel) return;
    await this.realtime.removeChannel(this.channel);
    this.channel = null;
  }
}
