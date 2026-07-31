import { authProvider } from "@/shared/infrastructure/auth.provider";
import { PartnerRepository } from "./PartnerRepository";
import { supabase } from "@/services/supabaseClient";
import { ConnectionRepository } from "./ConnectionRepository";
import { ConnectionApiClient } from "./ConnectionApiClient";
import { envs } from "@/config/envs";
import { ConnectionManager } from "./ConnectionManager";
import { ConnectionChannelManager } from "./ConnectionChannelManager";
import { realtimeProvider } from "@/shared/infrastructure/realtime.provider";
import { ConnectionEventBus } from "./ConnectionEventBus";

export async function createConnectionService() {
  const userId = await authProvider.getUserId();
  const acessToken = await authProvider.getAccessToken();
  const apiUrl = `${envs.apiUrl}`;
  const events = new ConnectionEventBus();

  const partnerRepository = new PartnerRepository(supabase);
  const connectionRepository = new ConnectionRepository(supabase, userId);
  const apiClient = new ConnectionApiClient(acessToken, apiUrl);

  const channel = new ConnectionChannelManager(
    userId,
    realtimeProvider,
    events,
  );

  const connectionManager = new ConnectionManager(
    partnerRepository,
    connectionRepository,
    apiClient,
    channel,
    userId,
  );

  return {
    connection: connectionManager,
    events,
    breakConnection: () => connectionManager.breakConnection(),
  };
}
