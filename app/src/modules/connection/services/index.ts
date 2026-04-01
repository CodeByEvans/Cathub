import { authProvider } from "@/shared/infrastructure/auth.provider";
import { PartnerRepository } from "./PartnerRepository";
import { supabase } from "@/services/supabaseClient";
import { ConnectionRepository } from "./ConnectionRepository";
import { ConnectionApiClient } from "./ConnectionApiClient";
import { envs } from "@/config/envs";
import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { ConnectionManager } from "./ConnectionManager";

export async function createConnectionService() {
  const userId = await authProvider.getUserId();
  const acessToken = await authProvider.getAccessToken();
  const apiUrl = `${envs.supabaseUrl}/functions/v1`;
  const partnerRepository = new PartnerRepository(supabase);
  const connectionRepository = new ConnectionRepository(supabase, userId);
  const apiClient = new ConnectionApiClient(userId, acessToken, apiUrl);

  const connectionManager = new ConnectionManager(
    partnerRepository,
    connectionRepository,
    apiClient,
    storageProvider,
    userId,
  );

  return connectionManager;
}
