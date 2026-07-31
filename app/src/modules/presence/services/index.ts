import { supabase } from "@/services/supabaseClient";
import { PresenceEventBus } from "./PresenceEventBus";
import { PresenceManager } from "./PresenceManager";
import { LastSeenManager } from "./LastSeenManager";
import { IPresenceRepository } from "./interfaces/IPresenceRepository";
import { PresenceChannelManager } from "./PresenceChannelManager";
import { HeartbeatManager } from "./HeartbeatManager";
import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";
import { authProvider } from "@/shared/infrastructure/auth.provider";
import { realtimeProvider } from "@/shared/infrastructure/realtime.provider";

const presenceRepository: IPresenceRepository = {
  getPartnerLastSeen: async (partnerId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("last_seen")
      .eq("id", partnerId)
      .single();

    if (error || !data?.last_seen) return null;

    const lastSeen = new Date(data.last_seen);
    return lastSeen;
  },
  writeLastSeen: async (userId) => {
    await supabase
      .from("profiles")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", userId);
  },
};

export async function createPresenceService() {
  const userId = await authProvider.getUserId();
  const partnerId = await storageProvider.get(STORE_KEYS.partnerId);
  if (!partnerId) throw new Error("No partner");

  const connectionId = await storageProvider.get(STORE_KEYS.connectionId);
  if (!connectionId) throw new Error("No connection");

  const events = new PresenceEventBus();
  const lastSeen = new LastSeenManager(userId, partnerId, presenceRepository);
  const presenceChannel = new PresenceChannelManager(
    userId,
    partnerId,
    connectionId,
    realtimeProvider,
    events,
  );

  const heartBeat = new HeartbeatManager(lastSeen);
  const presence = new PresenceManager(
    events,
    lastSeen,
    presenceChannel,
    heartBeat,
  );

  return {
    events,
    lastSeen,
    presenceChannel,
    presence,
    heartBeat,
  };
}
