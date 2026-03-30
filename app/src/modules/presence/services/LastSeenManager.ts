import { IPresenceRepository } from "./interfaces/IPresenceRepository";

export class LastSeenManager {
  constructor(
    private readonly userId: string,
    private readonly partnerId: string,
    private readonly repository: IPresenceRepository,
  ) {}

  async fetchLastSeen() {
    try {
      const lastSeen = await this.repository.getPartnerLastSeen(this.partnerId);
      return lastSeen;
    } catch (error) {
      console.error("❌ Error en fetchLastSeen:", error);
    }
  }

  async writeLastSeen() {
    try {
      const lastSeen = await this.repository.writeLastSeen(this.userId);
      return lastSeen;
    } catch (error) {
      console.error("❌ Error en writeLastSeen:", error);
    }
  }
}
