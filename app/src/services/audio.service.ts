import { SoundKey, SOUNDS } from "@/constants/sounds.constants";
import { logger } from "@/shared/logger";

class AudioService {
  private ctx: AudioContext | null = null;
  private buffers: Record<string, AudioBuffer> = {};
  private playing: Record<string, AudioBufferSourceNode> = {};
  private initPromise: Promise<void> | null = null;

  private createContext(): AudioContext {
    this.ctx = new AudioContext();

    this.ctx.addEventListener("statechange", () => {
      if (this.ctx?.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    });

    // Política de autoplay (WebView2/WKWebView): el contexto puede nacer
    // "suspended" sin gesto de usuario previo — se reanuda en la primera
    // interacción, garantizando audio aunque el primer play() llegue antes.
    if (typeof window !== "undefined") {
      const resume = () => {
        this.ctx?.resume().catch(() => {});
      };
      window.addEventListener("pointerdown", resume, { once: true });
      window.addEventListener("keydown", resume, { once: true });
    }

    return this.ctx;
  }

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.createContext();
    }
    return this.ctx!;
  }

  async init() {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadAll();
    return this.initPromise;
  }

  private async loadAll() {
    const ctx = this.getCtx();
    await Promise.all(
      Object.entries(SOUNDS).map(([key, sound]) => this.load(key, sound, ctx)),
    );
  }

  private async load(key: string, url: string, ctx: AudioContext) {
    try {
      const buf = await fetch(url).then((r) => r.arrayBuffer());
      this.buffers[key] = await ctx.decodeAudioData(buf);
    } catch {
      logger.warn("audio", `Failed to load sound: ${key}`);
    }
  }

  async reload() {
    this.buffers = {};
    await this.loadAll();
  }

  play(key: SoundKey, { volume = 0.1, loop = false } = {}) {
    if (this.playing[key]) return;

    const buffer = this.buffers[key];
    if (!buffer) return;

    const ctx = this.getCtx();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    try {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = loop;
      gain.gain.value = volume;

      source.connect(gain).connect(ctx.destination);
      source.start(0);

      if (loop) {
        this.playing[key] = source;
      }
    } catch {
      this.reload();
    }
  }

  stop(key: SoundKey) {
    try {
      this.playing[key]?.stop();
    } catch {}
    delete this.playing[key];
  }

  stopAll() {
    Object.keys(this.playing).forEach((k) => this.stop(k as SoundKey));
  }
}

export const audioService = new AudioService();
