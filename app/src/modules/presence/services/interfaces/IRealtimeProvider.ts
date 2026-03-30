import { RealtimeChannel } from "@supabase/supabase-js";

export interface IRealtimeProvider {
  createChannel(channelId: string): RealtimeChannel;
  removeChannel(channel: RealtimeChannel): Promise<void>;
}
