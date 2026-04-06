import { SoundKey } from "@/constants/sounds.constants";

export interface IAudioService {
  play(sound: SoundKey, options?: { volume?: number; loop?: boolean }): void;
  stop(sound: SoundKey): void;
  stopAll(): void;
}
