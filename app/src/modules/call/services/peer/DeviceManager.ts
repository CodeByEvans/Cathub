import { IStorageProvider } from "../../../../interfaces/IStorageProvider";
import { STORE_KEYS } from "@/shared/infrastructure/store.keys";

export class DeviceManager {
  private selectedMicId: string | null = null;
  private selectedSpeakerId: string | null = null;

  constructor(private readonly storage: IStorageProvider) {}

  async loadSaved() {
    this.selectedMicId = await this.storage.get(STORE_KEYS.selectedMicId);
    this.selectedSpeakerId = await this.storage.get(STORE_KEYS.selectedSpeakerId);
  }

  async getDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      microphones: devices.filter((d) => d.kind === "audioinput"),
      speakers: devices.filter((d) => d.kind === "audiooutput"),
    };
  }

  async setDevices(micId: string, speakerId: string) {
    this.selectedMicId = micId;
    this.selectedSpeakerId = speakerId;
    await Promise.all([
      this.storage.set(STORE_KEYS.selectedMicId, micId),
      this.storage.set(STORE_KEYS.selectedSpeakerId, speakerId),
    ]);
  }

  getMicConstraints(): MediaTrackConstraints | boolean {
    return this.selectedMicId
      ? { deviceId: { ideal: this.selectedMicId } }
      : true;
  }

  get micId() {
    return this.selectedMicId;
  }

  get speakerId() {
    return this.selectedSpeakerId;
  }
}
