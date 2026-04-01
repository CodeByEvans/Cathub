import { supabase } from "@/services/supabaseClient";
import { PresenceEventBus } from "./PresenceEventBus";
import { PresenceManager } from "./PresenceManager";
import { LastSeenManager } from "./LastSeenManager";
import { IPresenceRepository } from "./interfaces/IPresenceRepository";
import { PresenceChannelManager } from "./PresenceChannelManager";
import { IRealtimeProvider } from "../../../interfaces/IRealtimeProvider";
import { RealtimeChannel } from "@supabase/supabase-js";
import { HeartbeatManager } from "./HeartbeatManager";
import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { authProvider } from "@/shared/infrastructure/auth.provider";

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

const realtimeProvider: IRealtimeProvider = {
  createChannel: (channelId: string) => {
    const channel = supabase.channel(channelId);
    return channel;
  },
  removeChannel: async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
  },
};

export async function createPresenceService() {
  const userId = await authProvider.getUserId();
  const partnerId = await storageProvider.get("partner_id");
  if (!partnerId) throw new Error("No partner");

  const connectionId = await storageProvider.get("connection_id");
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
