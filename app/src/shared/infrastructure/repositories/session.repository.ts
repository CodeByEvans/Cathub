import { storageProvider } from "../storage.provider";
import { STORE_KEYS } from "../store.keys";

export interface ConnectionCache {
  connectionId: string;
  partnerId: string;
  partnerName: string;
}

/**
 * Dueño único de la caché de sesión: userId + triple de conexión + link de
 * invitación. Antes estas lecturas/borrados estaban duplicados a mano en
 * `AppService` y `ConnectionManager`.
 */
export const sessionRepository = {
  async getUserId(): Promise<string | null> {
    return storageProvider.get(STORE_KEYS.userId);
  },

  async setUserId(userId: string): Promise<void> {
    await storageProvider.set(STORE_KEYS.userId, userId);
  },

  async deleteUserId(): Promise<void> {
    await storageProvider.delete(STORE_KEYS.userId);
  },

  async getConnectionCache(): Promise<ConnectionCache | null> {
    const [connectionId, partnerId, partnerName] = await Promise.all([
      storageProvider.get(STORE_KEYS.connectionId),
      storageProvider.get(STORE_KEYS.partnerId),
      storageProvider.get(STORE_KEYS.partnerName),
    ]);

    if (connectionId && partnerId && partnerName) {
      return { connectionId, partnerId, partnerName };
    }

    return null;
  },

  async saveConnectionCache(cache: ConnectionCache): Promise<void> {
    await storageProvider.set(STORE_KEYS.connectionId, cache.connectionId);
    await storageProvider.set(STORE_KEYS.partnerId, cache.partnerId);
    await storageProvider.set(STORE_KEYS.partnerName, cache.partnerName);
  },

  /** Borra la conexión cacheada (usado al romper conexión y al cerrar sesión). */
  async clearConnectionCache(): Promise<void> {
    await storageProvider.clear([
      STORE_KEYS.connectionId,
      STORE_KEYS.partnerId,
      STORE_KEYS.partnerName,
    ]);
  },

  async getConnectionRequestLink(): Promise<string | null> {
    return storageProvider.get(STORE_KEYS.connectionRequestLink);
  },

  async setConnectionRequestLink(link: string): Promise<void> {
    await storageProvider.set(STORE_KEYS.connectionRequestLink, link);
  },

  async deleteConnectionRequestLink(): Promise<void> {
    await storageProvider.delete(STORE_KEYS.connectionRequestLink);
  },
};
