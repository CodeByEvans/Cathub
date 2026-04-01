export interface IPartnerRepository {
  getPartnerData(partnerId: string): Promise<{ username: string } | null>;
}
