import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface IncomingOffer {
  connectionId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface SignalMessage {
  connectionId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface SignalCandidate {
  connectionId: string;
  candidate: RTCIceCandidateInit;
}

export interface SignalError {
  code?: string;
  msg?: unknown;
}

export type SignalEvent = "offer" | "answer" | "candidate";

export interface SignalHandlers {
  onOpen?: () => void;
  onOffer?: (offer: IncomingOffer) => void;
  onAnswer?: (msg: SignalMessage) => void;
  onCandidate?: (msg: SignalCandidate) => void;
  onError?: (msg: SignalError) => void;
  onClosed?: () => void;
}

/**
 * Cliente de señalización que delega en Rust (Supabase Realtime). El frontend
 * solo habla con Rust vía `invoke`/`listen`; WebRTC queda aislado en el canal
 * de medios.
 */
export class SignalingManager {
  private unlisteners: UnlistenFn[] = [];
  private started = false;

  constructor(private handlers: SignalHandlers = {}) {}

  setHandlers(handlers: SignalHandlers) {
    this.handlers = handlers;
  }

  async start(connectionId: string, userId: string, supabaseUrl: string, anonKey: string) {
    if (this.started) return;
    this.started = true;

    await invoke("signal_start", { connectionId, userId, supabaseUrl, anonKey });

    this.unlisteners.push(await listen("signal:open", () => this.handlers.onOpen?.()));
    this.unlisteners.push(
      await listen<IncomingOffer>("signal:offer", (e) => this.handlers.onOffer?.(e.payload)),
    );
    this.unlisteners.push(
      await listen<SignalMessage>("signal:answer", (e) => this.handlers.onAnswer?.(e.payload)),
    );
    this.unlisteners.push(
      await listen<SignalCandidate>("signal:candidate", (e) =>
        this.handlers.onCandidate?.(e.payload),
      ),
    );
    this.unlisteners.push(
      await listen<SignalError>("signal:error", (e) => this.handlers.onError?.(e.payload)),
    );
    this.unlisteners.push(await listen("signal:closed", () => this.handlers.onClosed?.()));
  }

  async send(event: SignalEvent, payload: unknown) {
    await invoke("signal_send", { msgType: event, payload });
  }

  async stop() {
    if (!this.started) return;
    this.started = false;
    for (const unlisten of this.unlisteners) unlisten();
    this.unlisteners = [];
    await invoke("signal_stop");
  }
}
