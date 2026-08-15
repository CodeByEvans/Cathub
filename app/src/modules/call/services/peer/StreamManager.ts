import { logger } from "@/shared/logger";

export class StreamManager {
  private localStream: MediaStream | null = null;
  private remoteAudioEl: HTMLAudioElement | null = null;

  async getLocalStream(
    audioOnly: boolean,
    micConstraints: MediaTrackConstraints | boolean,
  ): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: !audioOnly,
      audio: micConstraints,
    });
    return this.localStream;
  }

  async attachRemoteStream(stream: MediaStream, speakerId: string | null) {
    if (!this.remoteAudioEl) {
      this.remoteAudioEl = document.createElement("audio");
      this.remoteAudioEl.autoplay = true;
      document.body.appendChild(this.remoteAudioEl);
    }
    this.remoteAudioEl.srcObject = stream;
    if (speakerId && this.remoteAudioEl.setSinkId) {
      try {
        await this.remoteAudioEl.setSinkId(speakerId);
      } catch (error) {
        // Dispositivo no disponible: seguir con la salida por defecto.
        logger.debug("call", "setSinkId failed", error);
      }
    }
    try {
      await this.remoteAudioEl.play();
    } catch (error) {
      logger.debug("call", "remote play failed", error);
    }
  }

  toggleMute(): boolean {
    const track = this.localStream?.getAudioTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return !track.enabled;
  }

  toggleDeaf(): boolean {
    const track = this.localStream?.getAudioTracks()[0];
    if (!track || !this.remoteAudioEl) return false;

    // Si ya mudo + remoto activo → activar deaf total
    if (!track.enabled && !this.remoteAudioEl.muted) {
      this.remoteAudioEl.muted = true;
      return true;
    }
    track.enabled = !track.enabled;
    this.remoteAudioEl.muted = !track.enabled;
    return !track.enabled;
  }

  toggleVideo(): boolean {
    const track = this.localStream?.getVideoTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return !track.enabled;
  }

  cleanup() {
    if (this.remoteAudioEl) {
      this.remoteAudioEl.srcObject = null;
      this.remoteAudioEl.remove();
      this.remoteAudioEl = null;
    }
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
  }
}
