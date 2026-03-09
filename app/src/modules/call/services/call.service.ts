// src/services/call.service.ts
import { windowService } from "@/modules/settings/services";
import { getValue, setValue } from "@/services/store.service";
import { supabase } from "@/services/supabaseClient";
import Peer, { MediaConnection } from "peerjs";
import { audioService } from "@/services/audio.service";

class CallService {
  private peer: Peer | null = null;
  private isInitialized: boolean = false;
  private userId: string = "";
  private partnerId: string = "";
  private localStream: MediaStream | null = null;
  private currentCall: MediaConnection | null = null;

  private initializing = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private incomingCall: boolean = false;
  private inCall: boolean = false;
  private selectedMicId: string | null = null;
  private selectedSpeakerId: string | null = null;

  public isIncomingCall(): boolean {
    return this.incomingCall;
  }

  public isInCall(): boolean {
    return this.inCall;
  }

  // Callbacks para el UI
  private onIncomingCallCallback: ((callerId: string) => void) | null = null;
  private onCallConnectedCallback: (() => void) | null = null;
  private onCallEndedCallback: (() => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;

  async initialize() {
    if (this.isInitialized && this.peer && !this.peer.destroyed) {
      console.log("⚠️ Ya inicializado");
      return;
    }

    if (this.initializing) {
      // console.log("⚠️ Inicialización en progreso");
      return;
    }

    this.initializing = true;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) throw new Error("No user");

      this.userId = user.data.user.id;

      const partnerId = await getValue("partner_id");
      if (typeof partnerId !== "string") throw new Error("No partner");

      this.partnerId = partnerId;

      const savedMic = await getValue("selectedMicId");
      const savedSpeaker = await getValue("selectedSpeakerId");

      if (typeof savedMic === "string") this.selectedMicId = savedMic;
      if (typeof savedSpeaker === "string")
        this.selectedSpeakerId = savedSpeaker;

      //console.log("📞 Inicializando Peer con ID:", this.userId);
      // console.log("🔗 Conectando con partner ID:", this.partnerId);

      if (this.peer && !this.peer.destroyed) {
        this.peer.destroy();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      this.peer = new Peer(this.userId, {
        debug: 1,
        host: "peerjs.92k.de",
        secure: true,
        port: 443,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      this.peer.on("open", () => {
        // console.log("✅ Peer listo:", id);
        this.isInitialized = true;
        this.reconnectAttempts = 0;
      });

      this.peer.on("error", (err) => {
        console.error("❌ Error:", err);

        if (err.type === "unavailable-id") {
          this.handleReconnect();
        }
      });

      this.peer.on("call", (call) => {
        console.log("📞 Llamada entrante:", call.peer);
        this.currentCall = call;
        this.incomingCall = true;
        this.onIncomingCallCallback?.(call.peer);

        audioService.play("ringtone", { volume: 0.3, loop: true });

        windowService.bringToFront();
      });
    } finally {
      this.initializing = false;
    }
  }

  // ✅ Iniciar llamada (el que llama)
  async startCall(audioOnly = true): Promise<MediaStream> {
    if (!this.partnerId) throw new Error("No partner");
    if (!this.peer) throw new Error("Peer not initialized");

    // Obtener permisos de cámara/micrófono
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: !audioOnly,
      audio: this.selectedMicId
        ? { deviceId: { exact: this.selectedMicId } }
        : true, // 👈 ahora sí usa el micro elegido
    });

    console.log("📹 Stream local listo, iniciando llamada a:", this.partnerId);

    // Llamar al partner
    const call = this.peer.call(this.partnerId, this.localStream);
    this.currentCall = call;

    // Configurar listeners de la llamada
    this.setupCallListeners(call);

    return this.localStream;
  }

  // ✅ Aceptar llamada (el que recibe)
  async acceptCall(audioOnly = true): Promise<MediaStream> {
    if (!this.currentCall) throw new Error("No incoming call");

    this.incomingCall = false;

    // Obtener permisos
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: !audioOnly,
      audio: this.selectedMicId
        ? { deviceId: { exact: this.selectedMicId } }
        : true,
    });

    // Responder con nuestro stream
    this.currentCall.answer(this.localStream);

    // Configurar listeners
    this.setupCallListeners(this.currentCall);

    audioService.stop("ringtone");

    windowService.restoreBehavior();

    return this.localStream;
  }

  // ✅ Rechazar llamada
  rejectCall() {
    this.incomingCall = false;
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    this.onCallEndedCallback?.();

    audioService.stop("ringtone");

    this.incomingCall = false;

    windowService.restoreBehavior();
  }

  // ✅ Colgar llamada
  async endCall() {
    this.cleanup();
    this.inCall = false;
    this.onCallEndedCallback?.();
  }

  async getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      microphones: devices.filter((d) => d.kind === "audioinput"),
      speakers: devices.filter((d) => d.kind === "audiooutput"),
    };
  }

  setAudioDevices(micId: string, speakerId: string) {
    this.selectedMicId = micId;
    this.selectedSpeakerId = speakerId;

    // Persistir para la próxima sesión
    setValue("selectedMicId", micId);
    setValue("selectedSpeakerId", speakerId);
  }

  // Configurar eventos de la llamada
  private remoteAudioElement: HTMLAudioElement | null = null;

  private setupCallListeners(call: MediaConnection) {
    call.on("stream", async (remoteStream) => {
      console.log("📹 Stream remoto recibido");

      if (!this.remoteAudioElement) {
        this.remoteAudioElement = document.createElement("audio");
        this.remoteAudioElement.autoplay = true;
        document.body.appendChild(this.remoteAudioElement);
      }

      this.remoteAudioElement.srcObject = remoteStream;

      if (this.selectedSpeakerId && this.remoteAudioElement.setSinkId) {
        await this.remoteAudioElement.setSinkId(this.selectedSpeakerId);
      }

      await this.remoteAudioElement.play();

      this.onRemoteStreamCallback?.(remoteStream);
      this.onCallConnectedCallback?.();
      this.inCall = true;
    });

    call.on("close", () => {
      this.cleanup();
      this.onCallEndedCallback?.();
      this.inCall = false;
    });

    call.on("error", (err) => {
      console.error("❌ Error en llamada:", err);
      this.cleanup();
      this.onCallEndedCallback?.();
    });
  }

  // Y en cleanup, limpiar también el audio
  private cleanup() {
    this.incomingCall = false;

    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
      this.remoteAudioElement.remove();
      this.remoteAudioElement = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Máximo número de reconexiones alcanzado");
      return;
    }

    this.reconnectAttempts++;

    console.log(`🔄 Reintentando (${this.reconnectAttempts})...`);

    if (this.peer && !this.peer.destroyed) {
      this.peer.destroy();
    }

    this.isInitialized = false;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.initialize();
  }
  // ✅ Toggle mute
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // true = muted
      }
    }
    return false;
  }

  // ✅ Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // true = video off
      }
    }
    return false;
  }

  // Setters para callbacks (conectan con el UI)
  onIncomingCall(callback: (callerId: string) => void) {
    this.onIncomingCallCallback = callback;
  }

  onCallConnected(callback: () => void) {
    this.onCallConnectedCallback = callback;
  }

  onCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback;
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  destroy() {
    this.cleanup();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isInitialized = false;
  }

  simulateIncomingCall() {
    if (import.meta.env.DEV) {
      // 👈 solo en desarrollo
      this.incomingCall = true;
      this.onIncomingCallCallback?.("fake-caller-id");
      audioService.play("ringtone", { loop: true, volume: 0.4 });
    }
  }

  simulateInCall() {
    if (import.meta.env.DEV) {
      // 👈 solo en desarrollo
      this.inCall = true;
      this.onCallConnectedCallback?.();
    }
  }
}

export const callService = new CallService();
