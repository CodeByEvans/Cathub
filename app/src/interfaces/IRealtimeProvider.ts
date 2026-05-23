import { RealtimeChannel } from "@supabase/supabase-js";

export interface IRealtimeProvider {
  createChannel(channelId: string, config?: { presence?: { key: string } }): RealtimeChannel;
  removeChannel(channel: RealtimeChannel): Promise<void>;
}
