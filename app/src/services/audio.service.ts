import { invoke } from "@tauri-apps/api/core";
import { SoundKey } from "@/constants/sounds.constants";

/**
 * Los sonidos de la app los reproduce Rust de forma nativa (rodio), fuera del
 * WebView. El AudioContext de WebKit se suspendía al perder foco, dejando mudos
 * los sonidos de UI; aquí solo delegamos en el backend.
 */
class AudioService {
  play(key: SoundKey, { volume = 0.1, loop = false } = {}) {
    invoke("play_sound", { key, volume, looping: loop }).catch(() => {});
  }

  stop(key: SoundKey) {
    invoke("stop_sound", { key }).catch(() => {});
  }

  stopAll() {
    invoke("stop_all_sounds").catch(() => {});
  }
}

export const audioService = new AudioService();
