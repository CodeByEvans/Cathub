import { audioService } from "@/services/audio.service";
import { windowService } from "@/modules/settings/services";

import { CallEventBus } from "./CallEventBus";
import { DeviceManager } from "./DeviceManager";
import { StreamManager } from "./StreamManager";
import { SignalingManager } from "./SignalingManager";
import { CallManager } from "./CallManager";
import { authProvider } from "@/shared/infrastructure/auth.provider";
import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";
import { envs } from "@/config/envs";

export async function createPeerService() {
  const userId = await authProvider.getUserId();
  const partnerId = await storageProvider.get(STORE_KEYS.partnerId);
  if (!partnerId) throw new Error("No partner");

  const connectionId = await storageProvider.get(STORE_KEYS.connectionId);
  if (!connectionId) throw new Error("No connection");

  const events = new CallEventBus();
  const streams = new StreamManager();
  const devices = new DeviceManager(storageProvider);
  await devices.loadSaved();

  const signaling = new SignalingManager();
  const calls = new CallManager(events, streams, audioService, windowService, signaling);

  signaling.setHandlers({
    onOffer: (offer) => calls.handleIncomingOffer(offer),
    onAnswer: (msg) => calls.handleAnswer(msg),
    onCandidate: (msg) => calls.handleCandidate(msg),
    onError: (msg) => calls.handleConnectionError(msg),
  });

  await signaling.start(connectionId, userId, envs.supabaseUrl, envs.supabaseAnonKey);

  return {
    events,
    devices,
    calls,
    signaling,
    partnerId,
  };
}
