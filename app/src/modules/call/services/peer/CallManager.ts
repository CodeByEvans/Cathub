import { CallEventBus } from "./CallEventBus";
import { StreamManager } from "./StreamManager";
import { logger } from "@/shared/logger";

import {
  SignalingManager,
  IncomingOffer,
  SignalMessage,
  SignalCandidate,
  SignalError,
} from "./SignalingManager";

import { IWindowService } from "./interfaces/IWindowService";
import { IAudioService } from "@/shared/interfaces/IAudioService";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class CallManager {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private pendingOffer: IncomingOffer | null = null;
  private callConnectionId: string | null = null;
  private activeSpeakerId: string | null = null;
  private outgoingCallSoundTimer: ReturnType<typeof setTimeout> | null = null;

  private _isIncomingCall = false;
  private _isOutgoingCall = false;
  private _isInCall = false;

  get isIncomingCall() {
    return this._isIncomingCall;
  }
  get isOutgoingCall() {
    return this._isOutgoingCall;
  }
  get isInCall() {
    return this._isInCall;
  }

  constructor(
    private readonly events: CallEventBus,
    private readonly streams: StreamManager,
    private readonly audio: IAudioService,
    private readonly window: IWindowService,
    private readonly signaling: SignalingManager,
  ) {}

  // ── Señalización entrante ────────────────────────────────────────────────

  handleIncomingOffer(offer: IncomingOffer) {
    this.pendingOffer = offer;
    this._isIncomingCall = true;
    this.events.emitIncomingCall(offer.connectionId);
    this.audio.play("ringtone", { volume: 0.3, loop: true });
    this.window.bringToFront();
  }

  async handleAnswer(msg: SignalMessage) {
    if (!this.pc || msg.connectionId !== this.callConnectionId) return;
    try {
      await this.pc.setRemoteDescription(msg.sdp);
    } catch (error) {
      logger.warn("call", "handleAnswer failed", error);
    }
  }

  async handleCandidate(msg: SignalCandidate) {
    if (!this.pc || msg.connectionId !== this.callConnectionId) return;
    try {
      await this.pc.addIceCandidate(msg.candidate);
    } catch (error) {
      logger.debug("call", "addIceCandidate failed", error);
    }
  }

  handleConnectionError(msg: SignalError) {
    // Interno: una caída de la señalización no debe sonar como colgar ni
    // terminar una llamada en curso (el media fluye P2P).
    logger.warn("call", "Error de conexión (señalización)", msg);
  }

  // ── Llamadas ─────────────────────────────────────────────────────────────

  async startCall(
    audioOnly: boolean,
    micConstraints: MediaTrackConstraints | boolean,
    speakerId: string | null,
  ) {
    try {
      const localStream = await this.streams.getLocalStream(
        audioOnly,
        micConstraints,
      );
      this.activeSpeakerId = speakerId;
      this.callConnectionId = `mc_${this.randomId()}`;

      const pc = this.createPeerConnection();

      const dc = pc.createDataChannel("chat");
      this.setupDataChannel(dc);

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this._isOutgoingCall = true;
      this.events.emitOutgoingCall();
      this.audio.play("callStarted", { volume: 0.3 });
      this.outgoingCallSoundTimer = setTimeout(() => {
        this.audio.play("outgoingCall", { loop: true, volume: 0.4 });
        this.outgoingCallSoundTimer = null;
      }, 1500);

      await this.signaling.send("offer", {
        connectionId: this.callConnectionId,
        sdp: offer,
      });

      return localStream;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error al iniciar la llamada";
      this.events.emitErrorMessage(errorMsg);
      throw new Error(`No se pudo iniciar la llamada: ${errorMsg}`);
    }
  }

  async acceptCall(
    audioOnly: boolean,
    micConstraints: MediaTrackConstraints | boolean,
    speakerId: string | null,
  ) {
    if (!this.pendingOffer) throw new Error("No hay llamada entrante");
    const offer = this.pendingOffer;
    this.pendingOffer = null;
    this.callConnectionId = offer.connectionId;
    this.activeSpeakerId = speakerId;
    this._isIncomingCall = false;

    const localStream = await this.streams.getLocalStream(
      audioOnly,
      micConstraints,
    );
    const pc = this.createPeerConnection();
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    await pc.setRemoteDescription(offer.sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.audio.stop("ringtone");
    this.audio.play("callStarted", { volume: 0.3, loop: true });
    this.window.restoreBehavior();

    await this.signaling.send("answer", {
      connectionId: this.callConnectionId,
      sdp: answer,
    });

    return localStream;
  }

  rejectCall() {
    this._isIncomingCall = false;
    this.sendControl("__HANGUP__");
    this.pendingOffer = null;
    this.audio.stop("ringtone");
    this.audio.play("callEnded", { volume: 0.3 });
    this.cleanup();
    this.events.emitCallEnded();
    this.window.restoreBehavior();
  }

  async cancelCall() {
    this.sendControl("__HANGUP__");
    await new Promise((r) => setTimeout(r, 100));
    this.audio.play("callEnded", { volume: 0.3 });
    this.cleanup();
    this.events.emitCallEnded();
  }

  async endCall() {
    this.sendControl("__HANGUP__");
    await new Promise((r) => setTimeout(r, 100));
    this.audio.play("callEnded", { volume: 0.3 });
    this.cleanup();
    this.events.emitCallEnded();
  }

  // ── Chat y estado ────────────────────────────────────────────────────────

  async sendChatMessage(message: string) {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(message);
    }
  }

  sendTypingStatus(isTyping: boolean) {
    this.sendStatus("__TYPING__", isTyping);
  }

  toggleMute() {
    const isMuted = this.streams.toggleMute();
    this.audio.play(isMuted ? "mute" : "unmute", { volume: 0.2 });
    this.sendStatus("__MUTE__", isMuted);
    return isMuted;
  }

  toggleDeaf() {
    const isDeaf = this.streams.toggleDeaf();
    this.audio.play(isDeaf ? "mute" : "unmute", { volume: 0.2 });
    this.sendStatus("__DEAF__", isDeaf);
    return isDeaf;
  }

  toggleVideo() {
    return this.streams.toggleVideo();
  }

  // ── Interno ──────────────────────────────────────────────────────────────

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc = pc;

    pc.onicecandidate = (evt) => {
      if (!evt.candidate || !evt.candidate.candidate) return;
      if (!this.callConnectionId) return;
      this.signaling
        .send("candidate", {
          candidate: evt.candidate.toJSON(),
          connectionId: this.callConnectionId,
        })
        .catch(() => {});
    };

    pc.ontrack = async (evt) => {
      const remoteStream = evt.streams[0] ?? new MediaStream([evt.track]);
      await this.streams.attachRemoteStream(remoteStream, this.activeSpeakerId);
      this.audio.stop("outgoingCall");
      this.audio.stop("callStarted");
      this.audio.stop("ringtone");
      this.events.emitRemoteStream(remoteStream);
      this.events.emitCallConnected();
      this._isInCall = true;
      this._isOutgoingCall = false;
      this._isIncomingCall = false;
    };

    pc.ondatachannel = (evt) => {
      this.setupDataChannel(evt.channel);
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "failed" || state === "closed") {
        this.cleanup();
        this.events.emitCallEnded();
        this.window.restoreBehavior();
      }
    };

    return pc;
  }

  private setupDataChannel(dc: RTCDataChannel) {
    this.dataChannel = dc;
    dc.onmessage = (evt) => this.handleDataMessage(evt.data as string);
  }

  private handleDataMessage(data: string) {
    if (data === "__HANGUP__") {
      this.cleanup();
      this.events.emitCallEnded();
      this.window.restoreBehavior();
      return;
    }
    if (data.startsWith("__MUTE__:")) {
      const muted = data.split(":")[1] === "true";
      this.events.emitPartnerMuted(muted);
      return;
    }
    if (data.startsWith("__DEAF__:")) {
      const deafened = data.split(":")[1] === "true";
      this.events.emitPartnerDeafened(deafened);
      return;
    }
    if (data.startsWith("__TYPING__:")) {
      const typing = data.split(":")[1] === "true";
      this.events.emitPartnerTyping(typing);
      return;
    }
    // Un mensaje real siempre limpia el indicador de "escribiendo…"
    this.events.emitPartnerTyping(false);
    this.events.emitChatMessage(data);
  }

  private sendStatus(
    type: "__MUTE__" | "__DEAF__" | "__TYPING__",
    value: boolean,
  ) {
    try {
      if (this.dataChannel?.readyState === "open") {
        this.dataChannel.send(`${type}:${value}`);
      }
    } catch (error) {
      // Best-effort: no interrumpir la llamada por un mensaje de estado
      logger.debug("call", "sendStatus failed", error);
    }
  }

  private sendControl(message: "__HANGUP__") {
    try {
      if (this.dataChannel?.readyState === "open") {
        this.dataChannel.send(message);
      }
    } catch (error) {
      logger.debug("call", "sendControl failed", error);
    }
  }

  private cleanup() {
    this._isIncomingCall = false;
    this._isOutgoingCall = false;
    this._isInCall = false;

    if (this.outgoingCallSoundTimer) {
      clearTimeout(this.outgoingCallSoundTimer);
      this.outgoingCallSoundTimer = null;
    }
    this.audio.stopAll();
    this.streams.cleanup();

    if (this.dataChannel) {
      this.dataChannel.onmessage = null;
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ontrack = null;
      this.pc.ondatachannel = null;
      this.pc.oniceconnectionstatechange = null;
      this.pc.close();
      this.pc = null;
    }
    this.pendingOffer = null;
    this.callConnectionId = null;
    this.activeSpeakerId = null;
  }

  private randomId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // ── Simulaciones para development ────────────────────────────────────────

  simulateIncomingCall() {
    if (!import.meta.env.DEV) return;
    this._isIncomingCall = true;
    this.events.emitIncomingCall("fake-caller-id");
    this.audio.play("ringtone", { volume: 0.3, loop: true });
  }

  async simulateOutgoingCall() {
    if (!import.meta.env.DEV) return;
    this._isOutgoingCall = true;
    this.events.emitOutgoingCall();
    this.audio.play("callStarted", { volume: 0.3 });
    this.outgoingCallSoundTimer = setTimeout(() => {
      this.audio.play("outgoingCall", { loop: true, volume: 0.4 });
      this.outgoingCallSoundTimer = null;
    }, 1500);
  }

  async simulateInCall() {
    if (!import.meta.env.DEV) return;
    this._isInCall = true;
    this._isOutgoingCall = false;
    this.audio.play("callStarted", { volume: 0.3 });
    this.events.emitCallConnected();
  }
}
