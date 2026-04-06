import { IRealtimeProvider } from "@/interfaces/IRealtimeProvider";
import { supabase } from "@/services/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

export const realtimeProvider: IRealtimeProvider = {
  createChannel: (channelId: string) => {
    const channel = supabase.channel(channelId);
    return channel;
  },
  removeChannel: async (channel: RealtimeChannel) => {
    await supabase.removeChannel(channel);
  },
};
