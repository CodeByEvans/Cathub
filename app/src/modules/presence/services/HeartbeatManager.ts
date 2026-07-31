import { LastSeenManager } from "./LastSeenManager";

export class HeartbeatManager {
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly lastSeen: LastSeenManager) {}

  start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      // LastSeenManager ya loguea sus errores (best-effort).
      await this.lastSeen.writeLastSeen();
    }, 30000); // Cada 30 segundos
  }

  stop() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = null;
  }
}
