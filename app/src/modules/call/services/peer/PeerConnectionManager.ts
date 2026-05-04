import Peer, { DataConnection, MediaConnection } from "peerjs";

export class PeerConnectionManager {
  private peer: Peer | null = null;
  private ready: boolean = false;
  private initializing: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(
    private readonly userId: string,
    private readonly onConnection: (conn: DataConnection) => void,
    private readonly onCall: (conn: MediaConnection) => void,
    private readonly onError: (type: string, message: string) => void,
  ) {}

  async connect() {
    if (this.ready && this.peer && !this.peer.destroyed) return;
    if (this.initializing) return;

    this.initializing = true;

    try {
      if (this.peer && !this.peer?.destroyed) {
        this.peer?.destroy();
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
        this.ready = true;
        this.reconnectAttempts = 0;
      });
      this.peer.on("connection", this.onConnection);
      this.peer.on("call", this.onCall);
      this.peer.on("error", (err) => {
        if (err.type === "unavailable-id") {
          this.handleReconnect();
          return;
        }
        this.onError(err.type, err.message);
      });
    } finally {
      this.initializing = false;
    }
  }

  getPeer() {
    if (!this.peer) throw new Error("Peer no inicializado");
    return this.peer;
  }

  destroy() {
    this.peer?.destroy();
    this.peer = null;
    this.ready = false;
  }

  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    this.peer?.destroy();
    this.ready = false;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    this.connect();
  }
}
