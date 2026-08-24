import { CallEventBus } from "./CallEventBus";
import { StreamManager } from "./StreamManager";
import { logger } from "@/shared/logger";

import {
  SignalingManager,
  IncomingOffer,
  SignalMessage,
  SignalCandidate,
  SignalError,
  SignalChat,
  SignalStatus,
  SignalStatusType,
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
  private pendingOffer: IncomingOffer | null = null;
  private pendingCandidates: SignalCandidate[] = [];
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
    this.callConnectionId = offer.connectionId;
    this._isIncomingCall = true;
    this.events.emitIncomingCall(offer.connectionId);
    this.audio.play("ringtone", { volume: 0.3, loop: true });
    this.window.bringToFront();
  }

  async handleAnswer(msg: SignalMessage) {
    if (!this.pc || msg.connectionId !== this.callConnectionId) return;
    try {
      await this.pc.setRemoteDescription(msg.sdp);
      this._isInCall = true;
      this._isOutgoingCall = false;
      if (this.outgoingCallSoundTimer) {
        clearTimeout(this.outgoingCallSoundTimer);
        this.outgoingCallSoundTimer = null;
      }
      this.audio.stop("outgoingCall");
      this.events.emitCallConnected();
    } catch (error) {
      logger.warn("call", "handleAnswer failed", error);
    }
  }

  async handleCandidate(msg: SignalCandidate) {
    if (msg.connectionId !== this.callConnectionId) return;
    if (!this.pc) {
      // Candidates que llegan durante el ringing: encolar para no perderlos.
      this.pendingCandidates.push(msg);
      return;
    }
    try {
      await this.pc.addIceCandidate(msg.candidate);
    } catch (error) {
      logger.debug("call", "addIceCandidate failed", error);
    }
  }

  handleHangup() {
    // Colgar/cancelar remoto: terminar la llamada o el ringing.
    if (!this._isIncomingCall && !this._isOutgoingCall && !this._isInCall) {
      return;
    }
    this.cleanup();
    this.events.emitCallEnded();
    this.window.restoreBehavior();
  }

  handleChat(msg: SignalChat) {
    this.events.emitChatMessage(msg.message);
  }

  handleStatus(msg: SignalStatus) {
    switch (msg.type) {
      case "__MUTE__":
        this.events.emitPartnerMuted(msg.value);
        break;
      case "__DEAF__":
        this.events.emitPartnerDeafened(msg.value);
        break;
      case "__TYPING__":
        this.events.emitPartnerTyping(msg.value);
        break;
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

    try {
      const localStream = await this.streams.getLocalStream(
        audioOnly,
        micConstraints,
      );
      const pc = this.createPeerConnection();
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      await pc.setRemoteDescription(offer.sdp);

      // Volcar los ICE candidates que llegaron durante el ringing.
      const buffered = this.pendingCandidates;
      this.pendingCandidates = [];
      for (const c of buffered) {
        try {
          await pc.addIceCandidate(c.candidate);
        } catch (error) {
          logger.debug("call", "addIceCandidate (buffered) failed", error);
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.audio.stopAll();
      this.audio.play("callStarted", { volume: 0.3 });
      this.window.restoreBehavior();
      this._isInCall = true;
      this.events.emitCallConnected();

      await this.signaling.send("answer", {
        connectionId: this.callConnectionId,
        sdp: answer,
      });

      return localStream;
    } catch (error) {
      logger.error("call", "acceptCall failed", error);
      this.audio.stop("ringtone");
      this.cleanup();
      this.events.emitCallEnded();
      this.events.emitErrorMessage(
        error instanceof Error ? error.message : "Error al aceptar la llamada",
      );
      this.window.restoreBehavior();
      throw new Error("No se pudo aceptar la llamada");
    }
  }

  rejectCall() {
    this._isIncomingCall = false;
    this.signaling
      .send("hangup", { connectionId: this.callConnectionId })
      .catch(() => {});
    this.pendingOffer = null;
    this.audio.stop("ringtone");
    this.audio.play("callEnded", { volume: 0.3 });
    this.cleanup();
    this.events.emitCallEnded();
    this.window.restoreBehavior();
  }

  async cancelCall() {
    this.signaling
      .send("hangup", { connectionId: this.callConnectionId })
      .catch(() => {});
    await new Promise((r) => setTimeout(r, 100));
    this.audio.play("callEnded", { volume: 0.3 });
    this.cleanup();
    this.events.emitCallEnded();
    this.window.restoreBehavior();
  }

  async endCall() {
    this.signaling
      .send("hangup", { connectionId: this.callConnectionId })
      .catch(() => {});
    await new Promise((r) => setTimeout(r, 100));
    this.audio.play("callEnded", { volume: 0.3 });
    this.cleanup();
    this.events.emitCallEnded();
    this.window.restoreBehavior();
  }

  // ── Chat y estado ────────────────────────────────────────────────────────

  async sendChatMessage(message: string) {
    if (!this.callConnectionId) return;
    await this.signaling
      .send("chat", { connectionId: this.callConnectionId, message })
      .catch(() => {});
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

  private sendStatus(type: SignalStatusType, value: boolean) {
    if (!this.callConnectionId) return;
    this.signaling
      .send("status", { connectionId: this.callConnectionId, type, value })
      .catch(() => {});
  }

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
      try {
        const remoteStream = evt.streams[0] ?? new MediaStream([evt.track]);
        await this.streams.attachRemoteStream(remoteStream, this.activeSpeakerId);
        this.audio.stop("outgoingCall");
        this.audio.stop("callStarted");
        this.audio.stop("ringtone");
        this.events.emitRemoteStream(remoteStream);
      } catch (error) {
        logger.error("call", "ontrack failed", error);
      }
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

    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ontrack = null;
      this.pc.oniceconnectionstatechange = null;
      this.pc.close();
      this.pc = null;
    }
    this.pendingOffer = null;
    this.pendingCandidates = [];
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
