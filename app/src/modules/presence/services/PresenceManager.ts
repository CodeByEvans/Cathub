import { HeartbeatManager } from "./HeartbeatManager";
import { LastSeenManager } from "./LastSeenManager";
import { PresenceChannelManager } from "./PresenceChannelManager";
import { PresenceEventBus } from "./PresenceEventBus";

export class PresenceManager {
  constructor(
    private readonly events: PresenceEventBus,
    private readonly lastSeen: LastSeenManager,
    private readonly channel: PresenceChannelManager,
    private readonly heartbeat: HeartbeatManager,
  ) {}

  async start() {
    const lastSeen = await this.lastSeen.fetchLastSeen();

    if (lastSeen) {
      this.events.emitLastSeen(lastSeen);
    }

    this.events.onPartnerLeft(async () => {
      const lastSeen = await this.lastSeen.fetchLastSeen();
      this.events.emitStatusChange({
        isOnline: false,
        lastSeen: lastSeen ?? null,
      });
      if (lastSeen) this.events.emitLastSeen(lastSeen);
    });

    await this.channel.connect();
    this.heartbeat.start();
  }

  async stop() {
    this.heartbeat.stop();
    await this.lastSeen.writeLastSeen();
    await this.channel.disconnect();
  }
}
