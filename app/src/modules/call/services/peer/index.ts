import { supabase } from "@/services/supabaseClient";
import { getValue, setValue } from "@/services/store.service";
import { audioService } from "@/services/audio.service";
import { windowService } from "@/modules/settings/services";

import { IAuthProvider } from "./interfaces/IAuthProvider";
import { IStorageProvider } from "./interfaces/IStorageProvider";

import { CallEventBus } from "./CallEventBus";
import { DeviceManager } from "./DeviceManager";
import { StreamManager } from "./StreamManager";
import { PeerConnectionManager } from "./PeerConnectionManager";
import { CallManager } from "./CallManager";

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

export async function createPeerService() {
  const userId = await authProvider.getUserId();
  const partnerId = await storageProvider.get("partner_id");
  if (!partnerId) throw new Error("No partner");

  const events = new CallEventBus();
  const streams = new StreamManager();
  const devices = new DeviceManager(storageProvider);
  await devices.loadSaved();

  const calls = new CallManager(events, streams, audioService, windowService);

  const connection = new PeerConnectionManager(
    userId,
    (conn) => calls.handleDataConnection(conn),
    (call) => calls.handleIncomingCall(call),
  );

  await connection.connect();

  return {
    events,
    devices,
    calls,
    connection,
    partnerId,
  };
}
