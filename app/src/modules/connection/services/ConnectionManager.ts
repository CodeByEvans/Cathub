import { IStorageProvider } from "@/interfaces/IStorageProvider";
import { IConnectionApiClient } from "../interfaces/IConnectionApiClient";
import { IPartnerRepository } from "../interfaces/IPartnerRepository";
import { IConnectionRepository } from "../interfaces/IConnectionRepository";
import { ConnectionChannelManager } from "./ConnectionChannelManager";

export class ConnectionManager {
  constructor(
    private readonly partner: IPartnerRepository,
    private readonly repository: IConnectionRepository,
    private readonly apiClient: IConnectionApiClient,
    private readonly storage: IStorageProvider,
    private readonly channel: ConnectionChannelManager,
    private readonly userId: string,
  ) {}

  async start(): Promise<{
    connection: {
      connectionId: string;
      partnerName: string;
      partnerId: string;
    } | null;
    link: string | null;
  }> {
    await this.channel.connect();
    const connection = await this.getConnection();
    if (connection) return { connection, link: null };
    const link = await this.ensureConnectionRequestLink();
    return { connection: null, link };
  }

  async stop() {
    await this.channel.disconnect();
  }

  async createConnection(connectionRequestId: string) {
    try {
      const connection =
        await this.apiClient.createConnection(connectionRequestId);
      if (!connection) throw new Error("No se pudo crear la conexión");

      await this.storage.set("connection_id", connection.id);

      const partnerId =
        connection.user_a === this.userId
          ? connection.user_b
          : connection.user_a;

      const partnerData = await this.partner.getPartnerData(partnerId);
      if (!partnerData)
        throw new Error("No se pudo obtener la información del partner");

      await this.storage.delete("connection_request_link");
      const result = {
        connectionId: connection.id,
        partnerName: partnerData.username,
        partnerId,
      };

      await this.saveCache(result);

      return result;
    } catch (error) {
      console.error(error);
      throw new Error("Error al crear la conexión");
    }
  }

  private async getCachedConnection() {
    const connectionId = await this.storage.get("connection_id");
    const partnerId = await this.storage.get("partner_id");
    const partnerName = await this.storage.get("partner_name");

    if (connectionId && partnerId && partnerName) {
      return {
        connectionId,
        partnerId,
        partnerName,
      };
    }

    return null;
  }

  async getConnection() {
    try {
      const cachedConnection = await this.getCachedConnection();
      if (cachedConnection) return cachedConnection;
      const connection = await this.repository.getConnection();
      if (!connection) return null;

      const partnerId =
        connection.user_a === this.userId
          ? connection.user_b
          : connection.user_a;
      const partnerData = await this.partner.getPartnerData(partnerId);

      if (!partnerData)
        throw new Error("No se pudo obtener la información del partner");

      const result = {
        connectionId: connection.id,
        partnerName: partnerData.username,
        partnerId,
      };

      await this.saveCache(result);

      return result;
    } catch (error) {
      console.error(error);
      throw new Error("Error al obtener la conexión");
    }
  }

  private async ensureConnectionRequestLink() {
    const cachedLink = await this.storage.get("connection_request_link");
    if (cachedLink) return cachedLink;

    let link = await this.apiClient.getConnectionRequestLink();
    if (!link) {
      link = await this.apiClient.generateConnectionRequestLink();
    }
    if (!link) throw new Error("No se pudo generar el enlace de conexión");

    await this.storage.set("connection_request_link", link);
    return link;
  }

  async generateConnectionRequestLink() {
    return this.apiClient.generateConnectionRequestLink();
  }

  async getConnectionRequestLink() {
    return this.apiClient.getConnectionRequestLink();
  }

  // Helper

  private async saveCache(data: {
    connectionId: string;
    partnerId: string;
    partnerName: string;
  }) {
    await this.storage.set("connection_id", data.connectionId);
    await this.storage.set("partner_id", data.partnerId);
    await this.storage.set("partner_name", data.partnerName);
  }
}
