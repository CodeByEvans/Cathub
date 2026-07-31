import { audioService } from "@/services/audio.service";
import { windowService } from "@/modules/settings/services";

import { CallEventBus } from "./CallEventBus";
import { DeviceManager } from "./DeviceManager";
import { StreamManager } from "./StreamManager";
import { PeerConnectionManager } from "./PeerConnectionManager";
import { CallManager } from "./CallManager";
import { authProvider } from "@/shared/infrastructure/auth.provider";
import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";

export async function createPeerService() {
  const userId = await authProvider.getUserId();
  const partnerId = await storageProvider.get(STORE_KEYS.partnerId);
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
    (message) => calls.handleCallError(message),
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
