import { IRealtimeProvider } from "@/interfaces/IRealtimeProvider";
import { supabase } from "@/services/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

export const realtimeProvider: IRealtimeProvider = {
  createChannel: (channelId: string, config?: { presence?: { key: string } }) => {
    const channel = supabase.channel(channelId, { config: config as any });
    return channel;
  },
  removeChannel: async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
  },
};
