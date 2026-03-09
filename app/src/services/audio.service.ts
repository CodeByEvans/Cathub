import { SoundKey, SOUNDS } from "@/constants/sounds.constants";

class AudioService {
  private ctx = new AudioContext();
  private buffers: Record<string, AudioBuffer> = {};
  private playing: Record<string, AudioBufferSourceNode> = {};

  async init() {
    await Promise.all(
      Object.entries(SOUNDS).map(([key, sound]) => this.load(key, sound)),
    );
  }

  async load(key: string, url: string) {
    if (this.buffers[key]) return;
    const buf = await fetch(url).then((r) => r.arrayBuffer());
    this.buffers[key] = await this.ctx.decodeAudioData(buf);
  }

  play(key: SoundKey, { volume = 0.1, loop = false } = {}) {
    if (this.playing[key]) return;
    const buffer = this.buffers[key];
    if (!buffer) return;

    if (this.ctx.state === "suspended") this.ctx.resume();

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    source.loop = loop;
    gain.gain.value = volume;

    source.connect(gain).connect(this.ctx.destination);
    source.start(0);

    if (loop) {
      this.playing[key] = source;
    }
  }

  stop(key: SoundKey) {
    this.playing[key]?.stop();
    delete this.playing[key];
  }

  stopAll() {
    Object.keys(this.playing).forEach((k) => this.stop(k as SoundKey));
  }
}

export const audioService = new AudioService();
