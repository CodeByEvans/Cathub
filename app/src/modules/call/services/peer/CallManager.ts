import { DataConnection, MediaConnection } from "peerjs";
import Peer from "peerjs";
import { CallEventBus } from "./CallEventBus";
import { StreamManager } from "./StreamManager";

import { IWindowService } from "./interfaces/IWindowService";
import { IAudioService } from "@/shared/interfaces/IAudioService";

export class CallManager {
  private currentCall: MediaConnection | null = null;
  private currentDataConnection: DataConnection | null = null;
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
  ) {}

  handleDataConnection(conn: DataConnection) {
    this.currentDataConnection = conn;
    conn.on("data", (data) => this.handleDataMessage(data as string));
  }

  handleIncomingCall(call: MediaConnection) {
    this.currentCall = call;
    this._isIncomingCall = true;
    this.events.emitIncomingCall(call.peer);
    this.audio.play("ringtone", { volume: 0.3, loop: true });
    this.window.bringToFront();
  }

  async startCall(
    peer: Peer,
    partnerId: string,
    audioOnly: boolean,
    micConstraints: MediaTrackConstraints | boolean,
    speakerId: string | null,
  ) {
    const dataConn = peer.connect(partnerId);
    this.currentDataConnection = dataConn;
    dataConn.on("data", (data) => this.handleDataMessage(data as string));

    const localStream = await this.streams.getLocalStream(
      audioOnly,
      micConstraints,
    );
    const call = peer.call(partnerId, localStream);
    this.currentCall = call;
    this.setupCallListeners(call, speakerId);

    this._isOutgoingCall = true;
    this.events.emitOutgoingCall();
    this.audio.play("callStarted", { volume: 0.3, loop: true });
    this.outgoingCallSoundTimer = setTimeout(() => {
      this.audio.play("outgoingCall", { loop: true, volume: 0.4 });
      this.outgoingCallSoundTimer = null;
    }, 1500);

    return localStream;
  }

  async acceptCall(
    audioOnly: boolean,
    micConstraints: MediaTrackConstraints | boolean,
    speakerId: string | null,
  ) {
    if (!this.currentCall) throw new Error("No hay llamada entrante");
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__CALL_ACCEPTED__");
    }
    this._isIncomingCall = false;

    const localStream = await this.streams.getLocalStream(
      audioOnly,
      micConstraints,
    );
    this.currentCall.answer(localStream);
    this.setupCallListeners(this.currentCall, speakerId);

    this.audio.stop("ringtone");
    this.audio.play("callStarted", { volume: 0.3, loop: true });
    this.window.restoreBehavior();

    return localStream;
  }

  rejectCall() {
    this._isIncomingCall = false;
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__HANGUP__");
      this.currentDataConnection.close();
    }
    this.currentCall?.close();
    this.currentCall = null;
    this.currentDataConnection = null;
    this.audio.stop("ringtone");
    this.audio.play("callEnded", { volume: 0.3 });
    this.events.emitCallEnded();
    this.window.restoreBehavior();
  }

  async cancelCall() {
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__HANGUP__");
      await new Promise((r) => setTimeout(r, 100));
    }

    this.cleanup();
    this.audio.play("callEnded", { volume: 0.3 });
    this.events.emitCallEnded();
  }

  async endCall() {
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__HANGUP__");
      await new Promise((r) => setTimeout(r, 100));
    }
    this.cleanup();
    this.audio.play("callEnded", { volume: 0.3 });
    this.events.emitCallEnded();
  }

  async sendChatMessage(message: string) {
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send(message);
    }
  }

  toggleMute() {
    const isMuted = this.streams.toggleMute();
    this.audio.play(isMuted ? "mute" : "unmute", { volume: 0.2 });
    return isMuted;
  }

  toggleDeaf() {
    const isDeaf = this.streams.toggleDeaf();
    this.audio.play(isDeaf ? "mute" : "unmute", { volume: 0.2 });
    return isDeaf;
  }
  toggleVideo() {
    return this.streams.toggleVideo();
  }

  private setupCallListeners(call: MediaConnection, speakerId: string | null) {
    call.on("stream", async (remoteStream) => {
      await this.streams.attachRemoteStream(remoteStream, speakerId);
      this.audio.stop("outgoingCall");
      this.events.emitRemoteStream(remoteStream);
      this.events.emitCallConnected();
      this._isInCall = true;
      this._isOutgoingCall = false;
    });

    call.on("close", () => {
      this.cleanup();
      this.events.emitCallEnded();
      this.window.restoreBehavior();
    });

    call.on("error", () => {
      this.cleanup();
      this.events.emitCallEnded();
    });
  }

  private handleDataMessage(data: string) {
    if (data === "__HANGUP__") {
      this.cleanup();
      this.events.emitCallEnded();
      return;
    }
    if (data === "__CALL_ACCEPTED__") {
      this._isInCall = true;
      this._isOutgoingCall = false;
      this.events.emitCallConnected();
      return;
    }
    this.events.emitChatMessage(data);
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
    this.currentCall?.close();
    this.currentCall = null;
    this.currentDataConnection?.close();
    this.currentDataConnection = null;
  }

  // Simulaciones de llamada para development
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
