export interface IPresenceRepository {
  getPartnerLastSeen(partnerId: string): Promise<Date | null>;
  writeLastSeen(userId: string): Promise<void>;
}
