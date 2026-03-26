import { IStorageProvider } from "./interfaces/IStorageProvider";

export class DeviceManager {
  private selectedMicId: string | null = null;
  private selectedSpeakerId: string | null = null;

  constructor(private readonly storage: IStorageProvider) {}

  async loadSaved() {
    this.selectedMicId = await this.storage.get("selectedMicId");
    this.selectedSpeakerId = await this.storage.get("selectedSpeakerId");
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
      this.storage.set("selectedMicId", micId),
      this.storage.set("selectedSpeakerId", speakerId),
    ]);
  }

  getMicConstraints(): MediaTrackConstraints | boolean {
    return this.selectedMicId
      ? { deviceId: { ideal: this.selectedMicId } }
      : true;
  }

  get speakerId() {
    return this.selectedSpeakerId;
  }
}
