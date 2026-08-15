# Migración JS → Rust: audio y señalización de llamadas

> Documento de referencia para entender la nueva arquitectura de audio y llamadas de Cathub tras mover la lógica crítica fuera del WebView (WebKit) hacia el backend Rust.

## 1. Resumen ejecutivo

Antes, todo el sistema de llamadas vivía en el WebView (WebKit/WKWebView) usando la librería **PeerJS**, que mezcla dos responsabilidades: señalización (descubrir al otro usuario y negociar la llamada) y medios (audio/vídeo WebRTC). Esto generaba tres problemas:

1. **Sonidos que se apagaban**: el `AudioContext` de WebKit se suspendía al perder foco/ociosidad, dejando mudos los sonidos de UI.
2. **Señales perdidas**: si WebKit se suspendía, dejaba de recibir la señalización (p. ej. llamadas entrantes).
3. **Dependencia de terceros**: la señalización iba a `peerjs.92k.de`, un PeerServer público que dejó de responder.

La migración resuelve estos problemas moviendo al **backend Rust**:

- **Audio** → Rust (`rodio`) reproduce los sonidos de forma nativa.
- **Señalización** → Rust (`tokio-tungstenite` + `reqwest`) se conecta a **Supabase Realtime** (ya usada para presencia/notas), recibe las señales siempre (aunque WebKit duerma) y **despierta el frontend** cuando llega una llamada.
- **Medios** → `RTCPeerConnection` nativo del navegador, solo activo durante la llamada. **PeerJS se elimina por completo.**

## 2. Contexto y problemas originales

| Problema | Causa raíz | Dónde se manifestaba |
|---|---|---|
| Suena "colgar" en cada caída de red | `CallManager.handleCallError` hacía `audio.play("callEnded")` + `cleanup()` ante *cualquier* error de PeerJS (incluido `network`) | `CallManager.ts` |
| Reconexión infinita | Los eventos `disconnected`, `error` y el heartbeat llamaban `peer.reconnect()` sin límite | `PeerConnectionManager.ts` |
| Sonidos de UI que se apagaban | `AudioContext` suspendido por WebKit al quedar en segundo plano | `audio.service.ts` |
| Señales que se pierden | La señalización (socket de PeerJS) corría en el WebView | todo el módulo call |
| Servidor caído | `peerjs.92k.de` (terceros) inalcanzable | `PeerConnectionManager.ts` (`host`) |

## 3. Arquitectura: antes vs. después

### Antes

```
┌───────────────────── WebView (WebKit) ─────────────────────┐
│  PeerJS  ── señalización (WS → peerjs.92k.de)              │
│          └─ medios (WebRTC vía PeerJS)                     │
│  AudioContext (WebAudio) → sonidos UI y de llamada         │
└────────────────────────────────────────────────────────────┘
        ▲ todo depende de que WebKit esté vivo
```

### Después

```
┌───────────────────── WebView (frontend) ────────────────────┐
│  Medios WebRTC nativo (solo en llamada)                     │
│    RTCPeerConnection + RTCDataChannel                       │
│  SignalingManager.ts  →  invoke()/listen()  (sin WebSocket) │
│  audio.service.ts     →  invoke()            (sin WebAudio) │
└───────────────▲───────────────────────────────▲─────────────┘
                │ invoke / eventos Tauri         │
┌───────────────┴───────────────────────────────┴─────────────┐
│  Rust (src-tauri)  ─ siempre vivo, ajeno al WebView         │
│  ├─ signaling.rs: WS → Supabase Realtime (recibe señales)   │
│  │                REST → /api/broadcast (envía señales)     │
│  │                wake() al recibir una llamada             │
│  └─ audio.rs: rodio (sonidos nativos)                       │
└─────────────────────────────────────────────────────────────┘
```

## 4. Audio nativo (Rust + rodio)

### `app/src-tauri/src/audio.rs`

- Clase `AudioManager`, guardada en estado Tauri (`app.manage(...)`).
- Usa la crate **`rodio`** para reproducir los `.wav` embebidos con `include_bytes!` (sin rutas de assets en runtime).
- **Por qué un hilo dedicado**: `rodio::OutputStream` no es `Send` (al menos en CoreAudio de macOS), así que no puede guardarse en el estado de Tauri (que exige `Send + Sync`). La solución es un hilo `std::thread` que posee el `OutputStream` y recibe comandos por un canal `mpsc`.
- Los sonidos en bucle (ringtone, outgoingCall, callStarted) se guardan en un `HashMap<String, Sink>` dentro del hilo para poder detenerlos.
- Los sonidos de un solo disparo usan `Sink::detach()` para sonar sin bloquear.

**Comandos expuestos:**

| Comando | Parámetros | Descripción |
|---|---|---|
| `play_sound` | `key, volume, looping` | Reproduce un sonido (key en camelCase) |
| `stop_sound` | `key` | Detiene un bucle |
| `stop_all_sounds` | — | Detiene todos los bucles |

**Sonidos** (carpeta `app/src-tauri/sounds/`): `hover`, `click`, `ringtone`, `error`, `send`, `incomingNote`, `mute`, `unmute`, `callStarted`, `callEnded`, `outgoingCall`. *(Nota: `Notification.wav` quedó sin usar.)*

### Frontend

- `app/src/services/audio.service.ts`: ahora es un **adaptador** que llama a `invoke("play_sound", …)`. Ya no usa `AudioContext` ni `decodeAudioData`.
- `app/src/constants/sounds.constants.ts`: solo exporta `SOUND_KEYS` y el tipo `SoundKey` (los `import …wav` de Vite desaparecieron).
- Se eliminaron las llamadas a `audioService.init()` en `main.tsx` y `app.service.ts`.
- `IAudioService` (interfaz) **no cambió**, así que `CallManager`, `NotesManager`, `useChat` y settings siguen intactos.

## 5. Señalización (Supabase Realtime)

### `app/src-tauri/src/signaling.rs`

- `SignalingManager` guardada en estado Tauri.
- **Conexión** (WebSocket, `tokio-tungstenite`) a:
  ```
  wss://otvudprkslkrilfkmalz.supabase.co/realtime/v1/websocket?apikey={ANON}&vsn=2.0.0
  ```
- **Unión al canal** (protocolo Phoenix) con `phx_join` al topic `realtime:call:{connectionId}`.
- **Heartbeat** cada 25 s (topic `phoenix`, event `heartbeat`) para mantener viva la conexión.
- **Recepción**: los broadcasts llegan como **frames binarios** (kind-4) que se decodifican manualmente.
- **Envío**: vía **REST** (`reqwest`) al endpoint `/realtime/v1/api/broadcast`, evitando el frame binario de envío (kind-3).
- **Wake**: al recibir un `offer`, hace `window.show()` + `unminimize()` + `set_focus()` + `set_always_on_top(true)` y emite el evento `signal:offer`.
- **Reconexión** con límite de 2 intentos y backoff.

### Protocolo Phoenix al detalle

**Trama texto (JSON array)**: `[join_ref, ref, topic, event, payload]`

- Join:
  ```json
  [null, "1", "realtime:call:{connectionId}", "phx_join",
   {"config":{"broadcast":{"ack":false,"self":false},
              "presence":{"key":"","enabled":false},
              "postgres_changes":[],"private":false}}]
  ```
- Heartbeat:
  ```json
  [null, "1", "phoenix", "heartbeat", {}]
  ```

**Broadcast entrante (binario, kind 4)**:

```
byte0 = 4 (kind)
byte1 = longitud del topic
byte2 = longitud del event
byte3 = longitud del metadata
byte4 = encoding (1 = JSON)
[bytes del topic][bytes del event][bytes del metadata][payload JSON]
```

El `event` es el nombre del evento de broadcast (`offer` / `answer` / `candidate`), y el payload JSON es el mensaje de señalización.

**Envío (REST)**:

```
POST https://…/realtime/v1/api/broadcast
headers: apikey, Content-Type: application/json
body: { "messages": [ { "topic": "call:{connectionId}", "event": "offer", "payload": {...}, "private": false } ] }
→ responde 202
```

### Contrato de comandos

| Comando | Parámetros | Descripción |
|---|---|---|
| `signal_start` | `connectionId, supabaseUrl, anonKey` | Conecta y se une al canal |
| `signal_send` | `msgType, payload` | Envía un broadcast (`offer`/`answer`/`candidate`) |
| `signal_stop` | — | Cierra la conexión |

### Contrato de eventos (Rust → frontend)

| Evento | Payload | Cuándo |
|---|---|---|
| `signal:open` | — | Conexión/join correcto |
| `signal:offer` | `{connectionId, sdp}` | Llamada entrante (hace wake) |
| `signal:answer` | `{connectionId, sdp}` | Respuesta a nuestra oferta |
| `signal:candidate` | `{connectionId, candidate}` | ICE candidate |
| `signal:error` | `{code?, msg?}` | Error de conexión/join |
| `signal:closed` | — | Conexión cerrada |

## 6. Canal de medios (WebRTC nativo)

### `app/src/modules/call/services/peer/SignalingManager.ts`

- `start(connectionId, supabaseUrl, anonKey)` → `invoke("signal_start", …)` y registra `listen(...)` de `@tauri-apps/api/event`.
- `send(event, payload)` → `invoke("signal_send", { msgType: event, payload })`.
- `stop()` → desregistra listeners y `invoke("signal_stop")`.
- **No hay `dst`**: el canal es compartido solo por la pareja (broadcast), así que el destino es implícito.

### `app/src/modules/call/services/peer/CallManager.ts`

Gestiona el ciclo de vida de la llamada con `RTCPeerConnection` nativo:

- **`startCall`**: `getUserMedia` → crea `RTCPeerConnection` + `createDataChannel("chat")` → `addTrack` → `createOffer`/`setLocalDescription` → `signal_send("offer")`.
- **`acceptCall`**: `setRemoteDescription` + `addTrack` → `createAnswer` → `signal_send("answer")`.
- **`handleCandidate`**: `pc.addIceCandidate(...)`.
- **`ontrack`**: adjunta el stream remoto (`StreamManager.attachRemoteStream`) y emite `callConnected`.
- **`onicecandidate`**: reenvía cada candidato por `signal_send("candidate")`.
- **`RTCDataChannel`** (chat + estado): transporta `__MUTE__:<bool>`, `__DEAF__:<bool>`, `__TYPING__:<bool>`, `__HANGUP__` y mensajes de chat.
- **Colgar**: envía `__HANGUP__` por el data channel y cierra el `RTCPeerConnection`; el otro lado lo detecta por `oniceconnectionstatechange` (`failed`/`closed`) o por el mensaje `__HANGUP__`.
- **`handleConnectionError`**: solo loguea (una caída de señalización **no** suena como colgar ni termina una llamada en curso; el media es P2P).

**Configuración ICE** (STUN): `stun:stun.l.google.com:19302`, `stun:stun1.l.google.com:19302`.

### Archivos que no cambian

- `StreamManager.ts` (`getUserMedia`, `attachRemoteStream`, mute/deaf/video, `cleanup`).
- `CallEventBus.ts`, `DeviceManager.ts`.

### Eliminados

- `PeerConnectionManager.ts` (el antiguo wrapper de PeerJS).
- `connectionErrors.ts` (taxonomía de errores de PeerJS; ya no aplica).
- Dependencias `peerjs` y `@types/peerjs`.

## 7. Flujo de una llamada

### 7.1 Llamada entrante

```
Rust (signaling.rs)                        Frontend (CallManager)
───────────────                            ───────────────────────
recibe frame binario "offer"
  │ decode_broadcast()
  │ wake()  → show + focus + always-on-top
  │ emit("signal:offer", payload)
  │                                        handleIncomingOffer(offer)
  │                                          _isIncomingCall = true
  │                                          emitIncomingCall()  → ringtone + bringToFront
  │                                        ── usuario acepta ──
  │                                        acceptCall()
  │                                          getUserMedia → RTCPeerConnection
  │                                          addTrack + setRemoteDescription(offer.sdp)
  │                                          createAnswer + setLocalDescription
  │  ←── REST POST /api/broadcast ─────────  signal_send("answer", {connectionId, sdp})
  │
  │  recibe "candidate" ───────────────►     handleCandidate → pc.addIceCandidate
  │                                          ontrack → attachRemoteStream → callConnected
```

### 7.2 Llamada saliente

```
Rust (signaling.rs)                        Frontend (CallManager)
───────────────                            ───────────────────────
  │                                        startCall()
  │                                          getUserMedia → RTCPeerConnection
  │                                          createDataChannel("chat")
  │                                          addTrack + createOffer + setLocalDescription
  │  ←── REST POST "offer" ────────────────  signal_send("offer", {connectionId, sdp})
  │
  │  recibe "answer" ──────────────────►     handleAnswer → pc.setRemoteDescription
  │  recibe "candidate" ───────────────►     handleCandidate → pc.addIceCandidate
  │                                          ontrack → attachRemoteStream → callConnected
```

### 7.3 Colgar

```
Lado A                                      Lado B
──────                                      ──────
endCall()
  dataChannel.send("__HANGUP__")  ─────────►  handleDataMessage("__HANGUP__")
  audio.play("callEnded")                        cleanup() + emitCallEnded()
  cleanup() (cierra pc)                          (sin sonido de colgar local)
  emitCallEnded()
  pc.close() → oniceconnectionstatechange("closed")
```

## 8. Estructura de archivos (nueva)

```
app/
├── src/
│   ├── services/
│   │   └── audio.service.ts            # adaptador invoke (sin WebAudio)
│   ├── constants/
│   │   └── sounds.constants.ts         # solo SoundKey
│   └── modules/call/
│       ├── context/CallContext.tsx     # startCall(audioOnly), signaling.stop()
│       └── services/peer/
│           ├── index.ts                # createPeerService (wiring)
│           ├── SignalingManager.ts     # invoke + listen
│           ├── CallManager.ts          # RTCPeerConnection + DataChannel
│           ├── CallEventBus.ts         # (sin cambios)
│           ├── StreamManager.ts        # (sin cambios)
│           ├── DeviceManager.ts        # (sin cambios)
│           └── interfaces/IWindowService.ts
└── src-tauri/
    ├── src/
    │   ├── audio.rs                    # AudioManager (rodio)
    │   ├── signaling.rs                # SignalingManager (Supabase Realtime)
    │   ├── lib.rs                      # mod + manage + invoke_handler
    │   └── main.rs
    └── sounds/                         # los .wav (include_bytes!)
```

## 9. Dependencias

**Rust (añadidas):**

| Crate | Uso |
|---|---|
| `rodio 0.19` | reproducción de audio |
| `tokio 1` | runtime asíncrono (WS, timeouts) |
| `tokio-tungstenite 0.24` (`native-tls`) | cliente WebSocket |
| `futures-util 0.3` | Sink/Stream del WS |
| `reqwest 0.12` | envío de broadcast por REST |

**Frontend (eliminadas):** `peerjs`, `@types/peerjs`.

## 10. Decisiones y alternativas

- **Señalización: Supabase Realtime vs. PeerServer propio vs. peerjs.92k.de.**
  Se eligió Supabase Realtime porque ya estaba en uso (presencia/notas/conexión), no añade infraestructura propia y elimina la dependencia del PeerServer ajeno. Un PeerServer propio (peerjs-server) habría exigido un host con WebSocket persistente (Vercel no sirve).
- **Envío por REST vs. WebSocket binario.** Se usa REST (`/api/broadcast`) para evitar implementar el frame binario de envío (kind-3). La recepción sí usa el WebSocket binario (kind-4).
- **Audio en hilo dedicado vs. estado Tauri.** Se usa hilo + `mpsc` porque `rodio::OutputStream` no es `Send`.
- **Reconexión con límite (2).** Si no conecta en 2 intentos, se detiene y loguea, evitando el bucle infinito anterior.

## 11. Limitaciones, riesgos y pendientes

- **Formato binario del broadcast entrante (kind-4)**: deducido del código de `@supabase/realtime-js`. Conviene validarlo en runtime la primera vez; si el servidor entregara JSON en algún caso, añadir un fallback de parseo.
- **Seguridad**: el canal `realtime:call:{connectionId}` es público con la anon key (el `connectionId` es un UUID conocido solo por la pareja). Nivel similar al anterior.
- **`Notification.wav`** quedó sin uso en `src-tauri/sounds/`.
- **Futuro — llamadas de grupo**: si el producto crece a 3+ personas, el media requerirá un SFU (LiveKit/mediasoup); la señalización por Supabase Realtime seguiría sirviendo para coordinar la sala.
