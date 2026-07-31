import { AppError, isAppError } from "@/shared/errors/AppError";
import { sessionRepository } from "@/shared/infrastructure/repositories/session.repository";
import { IConnectionApiClient } from "../interfaces/IConnectionApiClient";
import { IPartnerRepository } from "../interfaces/IPartnerRepository";
import { IConnectionRepository } from "../interfaces/IConnectionRepository";
import { ConnectionChannelManager } from "./ConnectionChannelManager";

export class ConnectionManager {
  constructor(
    private readonly partner: IPartnerRepository,
    private readonly repository: IConnectionRepository,
    private readonly apiClient: IConnectionApiClient,
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

  async breakConnection(): Promise<boolean> {
    const cached = await this.getCachedConnection();
    if (!cached) return false;

    const success = await this.apiClient.breakConnection(cached.connectionId);
    if (success) {
      await sessionRepository.clearConnectionCache();
    }
    return success;
  }

  async createConnection(connectionRequestId: string) {
    try {
      const connection =
        await this.apiClient.createConnection(connectionRequestId);

      const partnerId =
        connection.user_a === this.userId
          ? connection.user_b
          : connection.user_a;

      const partnerData = await this.partner.getPartnerData(partnerId);
      if (!partnerData)
        throw new AppError("connection/create-failed", {
          message: "No se pudo obtener la información del partner",
        });

      await sessionRepository.deleteConnectionRequestLink();
      const result = {
        connectionId: connection.id,
        partnerName: partnerData.username,
        partnerId,
      };

      await this.saveCache(result);

      return result;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw new AppError("connection/create-failed", { cause: error });
    }
  }

  private async getCachedConnection() {
    return sessionRepository.getConnectionCache();
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
        throw new AppError("connection/fetch-failed", {
          message: "No se pudo obtener la información del partner",
        });

      const result = {
        connectionId: connection.id,
        partnerName: partnerData.username,
        partnerId,
      };

      await this.saveCache(result);

      return result;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw new AppError("connection/fetch-failed", { cause: error });
    }
  }

  private async ensureConnectionRequestLink() {
    const cachedLink = await sessionRepository.getConnectionRequestLink();
    if (cachedLink) return cachedLink;

    const existing = await this.apiClient.getConnectionRequestLink();
    const link = existing ?? (await this.apiClient.generateConnectionRequestLink());

    await sessionRepository.setConnectionRequestLink(link);
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
    await sessionRepository.saveConnectionCache(data);
  }
}
