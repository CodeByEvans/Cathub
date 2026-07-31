import { IPresenceRepository } from "./interfaces/IPresenceRepository";
import { logger } from "@/shared/logger";

export class LastSeenManager {
  constructor(
    private readonly userId: string,
    private readonly partnerId: string,
    private readonly repository: IPresenceRepository,
  ) {}

  /** Best-effort: un fallo de presencia no interrumpe al usuario; queda logueado. */
  async fetchLastSeen() {
    try {
      const lastSeen = await this.repository.getPartnerLastSeen(this.partnerId);
      return lastSeen;
    } catch (error) {
      logger.warn("presence", "Error en fetchLastSeen", error);
    }
  }

  async writeLastSeen() {
    try {
      const lastSeen = await this.repository.writeLastSeen(this.userId);
      return lastSeen;
    } catch (error) {
      logger.warn("presence", "Error en writeLastSeen", error);
    }
  }
}
