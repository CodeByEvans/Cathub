import { IAuthProvider } from "@/interfaces/IAuthProvider";
import { IStorageProvider } from "@/interfaces/IStorageProvider";
import { getValue, setValue } from "@/services/store.service";
import { supabase } from "@/services/supabaseClient";
import { PresenceEventBus } from "./PresenceEventBus";
import { PresenceManager } from "./PresenceManager";
import { LastSeenManager } from "./LastSeenManager";
import { IPresenceRepository } from "./interfaces/IPresenceRepository";
import { PresenceChannelManager } from "./PresenceChannelManager";
import { IRealtimeProvider } from "./interfaces/IRealtimeProvider";
import { RealtimeChannel } from "@supabase/supabase-js";

const authProvider: IAuthProvider = {
  getUserId: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user?.id) throw new Error("No user");
    return data.user.id;
  },
};

const storageProvider: IStorageProvider = {
  get: async (key) => {
    const v = await getValue(key);
    return typeof v === "string" ? v : null;
  },
  set: async (key: string, value: string): Promise<void> => {
    await setValue(key, value);
  },
};

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
  const presence = new PresenceManager(events, lastSeen, presenceChannel);

  await presence.start();

  return {
    events,
    lastSeen,
    presenceChannel,
    presence,
  };
}
