import { windowService } from "@/modules/settings/services";
import { getValue, setValue } from "@/services/store.service";
import { supabase } from "@/services/supabaseClient";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import { audioService } from "@/services/audio.service";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WINDOW_SIZES } from "@/constants/window.constants";

class PeerService {
  private peer: Peer | null = null;
  private isInitialized: boolean = false;
  private userId: string = "";
  private partnerId: string = "";
  private localStream: MediaStream | null = null;
  private currentCall: MediaConnection | null = null;
  private currentDataConnection: DataConnection | null = null;

  private initializing = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private incomingCall: boolean = false;
  private outgoingCall: boolean = false;
  private inCall: boolean = false;
  private selectedMicId: string | null = null;
  private selectedSpeakerId: string | null = null;

  private remoteAudioElement: HTMLAudioElement | null = null;

  private outgoingCallSoundTimer: ReturnType<typeof setTimeout> | null = null;

  public isIncomingCall(): boolean {
    return this.incomingCall;
  }

  public isOutgoingCall(): boolean {
    return this.outgoingCall;
  }

  public isInCall(): boolean {
    return this.inCall;
  }

  // Callbacks para el UI
  private onIncomingCallCallback: ((callerId: string) => void) | null = null;
  private onOutgoingCallCallback: (() => void) | null = null;
  private onCallConnectedCallback: (() => void) | null = null;
  private onCallEndedCallback: (() => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onChatMessageReceivedCallback: ((message: string) => void) | null =
    null;

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

      this.peer.on("connection", (conn) => {
        this.currentDataConnection = conn;
        conn.on("open", () => console.log("📡 Canal de datos recibido"));
        conn.on("data", (data) => {
          if (data === "__HANGUP__") {
            // El otro lado colgó — limpiar y notificar UI
            this.cleanup();
            this.onCallEndedCallback?.();
            return;
          }
          this.onChatMessageReceivedCallback?.(data as string);
        });
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

    const dataConn = this.peer.connect(this.partnerId);
    this.currentDataConnection = dataConn;
    dataConn.on("open", () => console.log("📡 Canal de datos abierto"));
    dataConn.on("data", (data) => {
      if (data === "__HANGUP__") {
        this.cleanup();
        this.onCallEndedCallback?.();
        return;
      }
      this.onChatMessageReceivedCallback?.(data as string);
    });

    // Obtener permisos de cámara/micrófono
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: !audioOnly,
      audio: this.selectedMicId
        ? { deviceId: { ideal: this.selectedMicId } }
        : true, // 👈 ahora sí usa el micro elegido
    });

    console.log("📹 Stream local listo, iniciando llamada a:", this.partnerId);

    // Llamar al partner
    const call = this.peer.call(this.partnerId, this.localStream);
    this.currentCall = call;

    // Configurar listeners de la llamada
    this.setupCallListeners(call);

    // Marcar llamada en curso
    this.onOutgoingCallCallback?.();
    this.outgoingCall = true;
    audioService.play("callStarted", { volume: 0.3 });
    this.outgoingCallSoundTimer = setTimeout(() => {
      audioService.play("outgoingCall", { loop: true, volume: 0.4 });
      this.outgoingCallSoundTimer = null;
    }, 1500);

    return this.localStream;
  }
  async stopRequestCall() {
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__HANGUP__");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.currentCall?.close();
    this.currentCall = null;
    this.currentDataConnection?.close();
    this.currentDataConnection = null;

    this.cleanup();
    this.onCallEndedCallback?.();
    audioService.play("callEnded", { volume: 0.3 });
  }

  // ✅ Aceptar llamada (el que recibe)
  async acceptCall(audioOnly = true): Promise<MediaStream> {
    if (!this.currentCall) throw new Error("No incoming call");

    this.incomingCall = false;

    // Obtener permisos
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: !audioOnly,
      audio: this.selectedMicId
        ? { deviceId: { ideal: this.selectedMicId } }
        : true,
    });

    // Responder con nuestro stream
    this.currentCall.answer(this.localStream);

    // Configurar listeners
    this.setupCallListeners(this.currentCall);

    audioService.stop("ringtone");
    audioService.play("callStarted", { volume: 0.3 });

    windowService.restoreBehavior();

    return this.localStream;
  }

  // ✅ Rechazar llamada
  rejectCall() {
    this.incomingCall = false;
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__HANGUP__");
      this.currentDataConnection.close();
      this.currentDataConnection = null;
    }
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    this.onCallEndedCallback?.();

    audioService.stop("ringtone");

    audioService.play("callEnded", { volume: 0.3 });

    this.incomingCall = false;

    windowService.restoreBehavior();
  }

  // ✅ Colgar llamada
  async endCall() {
    // Avisar al otro lado antes de cerrar
    if (this.currentDataConnection?.open) {
      this.currentDataConnection.send("__HANGUP__");
    }
    // Pequeño delay para que el mensaje llegue antes de cerrar la conexión
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.cleanup();
    this.inCall = false;
    audioService.play("callEnded", { volume: 0.3 });
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

  private setupCallListeners(call: MediaConnection) {
    const window = getCurrentWindow();
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

      audioService.stop("outgoingCall");
      this.onRemoteStreamCallback?.(remoteStream);
      this.onCallConnectedCallback?.();
      this.inCall = true;
    });

    call.on("close", () => {
      this.cleanup();
      this.onCallEndedCallback?.();
      window.setSize(WINDOW_SIZES.main);
      windowService.restoreBehavior();
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
    this.outgoingCall = false;
    this.inCall = false;

    if (this.outgoingCallSoundTimer) {
      clearTimeout(this.outgoingCallSoundTimer);
      this.outgoingCallSoundTimer = null;
    }
    audioService.stopAll();

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

    if (this.currentDataConnection) {
      this.currentDataConnection.close();
      this.currentDataConnection = null;
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
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return false;

    audioTrack.enabled = !audioTrack.enabled;

    audioService.play(audioTrack.enabled ? "unmute" : "mute", { volume: 0.2 });

    console.log(
      "🔇 Microfono",
      audioTrack.enabled ? "activado" : "desactivado",
    );

    return !audioTrack.enabled;
  }

  // ✅ Toggle Audio
  toggleDeaf(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return false;
    if (!this.remoteAudioElement) return false;

    if (
      audioTrack.enabled === false &&
      this.remoteAudioElement?.muted === false
    ) {
      audioService.play("mute", { volume: 0.2 });
      this.remoteAudioElement.muted = true;
      console.log("🔇 Audio y microfonos desactivados");
      return true;
    }

    audioTrack.enabled = !audioTrack.enabled;
    if (this.remoteAudioElement) {
      this.remoteAudioElement.muted = !audioTrack.enabled;
    }

    audioService.play(audioTrack.enabled ? "unmute" : "mute", { volume: 0.2 });
    console.log(
      "🔊 Audio y Micrófono",
      audioTrack.enabled ? "activados" : "desactivados",
    );

    return !audioTrack.enabled;
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

  onOutgoingCall(callback: () => void) {
    this.onOutgoingCallCallback = callback;
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

  onChatMessageReceived(callback: (message: string) => void) {
    this.onChatMessageReceivedCallback = callback;
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

  async simulateInCall() {
    if (import.meta.env.DEV) {
      // 👈 solo en desarrollo
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      if (!this.remoteAudioElement) {
        this.remoteAudioElement = document.createElement("audio");
        this.remoteAudioElement.autoplay = true;
        document.body.appendChild(this.remoteAudioElement);
      }

      this.inCall = true;
      this.onCallConnectedCallback?.();
    }
  }

  async simulateOutgoingCall() {
    if (import.meta.env.DEV) {
      // 👈 solo en desarrollo
      this.outgoingCall = true;
      this.onOutgoingCallCallback?.();
      audioService.play("callStarted", { volume: 0.3 });
      this.outgoingCallSoundTimer = setTimeout(() => {
        audioService.play("outgoingCall", { loop: true, volume: 0.4 });
        this.outgoingCallSoundTimer = null;
      }, 1500);
    }
  }

  // CHAT SECTION

  async sendChatMessage(message: string) {
    if (this.currentDataConnection && this.currentDataConnection.open) {
      this.currentDataConnection.send(message);
    } else {
      console.error("❌ No hay conexión de chat abierta");
    }
  }
}

export const peerService = new PeerService();
