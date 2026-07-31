import { authProvider } from "@/shared/infrastructure/auth.provider";
import { NotesManager } from "./NotesManager";
import { NotesRepository } from "./NotesRepository";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";
import { storageProvider } from "@/shared/infrastructure/storage.provider";
import { supabase } from "@/services/supabaseClient";
import { NotesChannelManager } from "./NotesChannelManager";
import { realtimeProvider } from "@/shared/infrastructure/realtime.provider";
import { audioService } from "@/services/audio.service";

export async function createNotesService() {
  const userId = await authProvider.getUserId();
  const connectionId = await storageProvider.get(STORE_KEYS.connectionId);
  if (!connectionId) throw new Error("No connection");
  const repository = new NotesRepository(supabase, userId, connectionId);
  const channel = new NotesChannelManager(
    userId,
    connectionId,
    realtimeProvider,
  );
  return new NotesManager(repository, channel, audioService);
}
