export interface IDeviceActions {
  getDevices(): Promise<{
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>;
  setDevices(micId: string, speakerId: string): Promise<void>;
}
