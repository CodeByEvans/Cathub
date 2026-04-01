import { IStorageProvider } from "@/interfaces/IStorageProvider";
import { IConnectionApiClient } from "../interfaces/IConnectionApiClient";
import { IPartnerRepository } from "../interfaces/IPartnerRepository";
import { IConnectionRepository } from "../interfaces/IConnectionRepository";

export class ConnectionManager {
  constructor(
    private readonly partner: IPartnerRepository,
    private readonly repository: IConnectionRepository,
    private readonly apiClient: IConnectionApiClient,
    private readonly storage: IStorageProvider,
    private readonly userId: string,
  ) {}

  async createConnection(connectionRequestId: string) {
    try {
      const connection =
        await this.apiClient.createConnection(connectionRequestId);
      if (!connection) throw new Error("No se pudo crear la conexión");

      await this.storage.set("connection_link", connection.id);

      const partnerId =
        connection.user_a === this.userId
          ? connection.user_b
          : connection.user_a;

      const partnerData = await this.partner.getPartnerData(partnerId);
      if (!partnerData)
        throw new Error("No se pudo obtener la información del partner");

      await this.storage.set("partner_name", partnerData.username);
      await this.storage.set("partner_id", partnerId);

      return {
        connectionId: connection.id,
        partnerName: partnerData.username,
        partnerId,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error al crear la conexión");
    }
  }

  async getConnection() {
    try {
      const connection = await this.repository.getConnection();

      if (!connection) return null;

      const partnerId =
        connection.user_a === this.userId
          ? connection.user_b
          : connection.user_a;
      const partnerData = await this.partner.getPartnerData(partnerId);

      if (!partnerData)
        throw new Error("No se pudo obtener la información del partner");

      await this.storage.set("partner_name", partnerData.username);
      await this.storage.set("partner_id", partnerId);

      return {
        connectionId: connection.id,
        partnerName: partnerData.username,
        partnerId,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener la conexión");
    }
  }

  async generateConnectionRequestLink() {
    return this.apiClient.generateConnectionRequestLink();
  }

  async getConnectionRequestLink() {
    return this.apiClient.getConnectionRequestLink();
  }
}
