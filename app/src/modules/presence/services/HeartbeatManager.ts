import { LastSeenManager } from "./LastSeenManager";

export class HeartbeatManager {
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly lastSeen: LastSeenManager) {}

  start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      try {
        await this.lastSeen.writeLastSeen();
      } catch (error) {
        console.error("❌ Error writing last seen:", error);
      }
    }, 30000); // Cada 30 segundos
  }

  stop() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = null;
  }
}
