use std::sync::Arc;
use std::time::Duration;

use futures_util::{SinkExt, StreamExt};
use serde_json::Value;
use tauri::{AppHandle, Emitter, Manager};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio_tungstenite::{connect_async, tungstenite::Message, MaybeTlsStream, WebSocketStream};

const HEARTBEAT_INTERVAL: Duration = Duration::from_secs(25);
const MAX_RECONNECT_ATTEMPTS: u32 = 2;
const REALTIME_VSN: &str = "2.0.0";

type WsStream = WebSocketStream<MaybeTlsStream<TcpStream>>;
type WsWrite = futures_util::stream::SplitSink<WsStream, Message>;
type WsRead = futures_util::stream::SplitStream<WsStream>;

struct Inner {
    sender: Option<WsWrite>,
    stopping: bool,
    connection_id: String,
    user_id: String,
    supabase_url: String,
    anon_key: String,
}

/// Señalización de llamadas en Rust (fuera del WebView) sobre Supabase
/// Realtime. Recibe broadcasts por WebSocket (protocolo Phoenix) y envía vía
/// el endpoint REST `/api/broadcast`. Así el frontend solo se encarga del
/// canal de medios (WebRTC) y no pierde señales cuando WebKit se suspende.
pub struct SignalingManager {
    app: AppHandle,
    inner: Arc<Mutex<Inner>>,
    client: reqwest::Client,
}

impl SignalingManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            inner: Arc::new(Mutex::new(Inner {
                sender: None,
                stopping: false,
                connection_id: String::new(),
                user_id: String::new(),
                supabase_url: String::new(),
                anon_key: String::new(),
            })),
            client: reqwest::Client::new(),
        }
    }

    fn ws_url(supabase_url: &str, anon_key: &str) -> String {
        let base = supabase_url
            .trim_end_matches('/')
            .replace("https://", "wss://")
            .replace("http://", "ws://");
        format!("{base}/realtime/v1/websocket?apikey={anon_key}&vsn={REALTIME_VSN}")
    }

    fn broadcast_url(supabase_url: &str) -> String {
        format!(
            "{}/realtime/v1/api/broadcast",
            supabase_url.trim_end_matches('/')
        )
    }

    pub fn start(
        &self,
        connection_id: String,
        user_id: String,
        supabase_url: String,
        anon_key: String,
    ) {
        let app = self.app.clone();
        let inner = self.inner.clone();
        tauri::async_runtime::spawn(async move {
            {
                let mut g = inner.lock().await;
                g.stopping = false;
                g.connection_id = connection_id;
                g.user_id = user_id;
                g.supabase_url = supabase_url;
                g.anon_key = anon_key;
                eprintln!(
                    "[signal] start user_id={} connection_id={} url={}",
                    g.user_id, g.connection_id, g.supabase_url
                );
            }
            run_loop(app, inner).await;
        });
    }

    pub async fn stop(&self) {
        let mut g = self.inner.lock().await;
        g.stopping = true;
        if let Some(mut sender) = g.sender.take() {
            let _ = sender.close().await;
        }
    }

    pub async fn send(&self, msg_type: String, mut payload: Value) -> Result<(), String> {
        let (url, key, topic, user_id) = {
            let g = self.inner.lock().await;
            (
                Self::broadcast_url(&g.supabase_url),
                g.anon_key.clone(),
                format!("call:{}", g.connection_id),
                g.user_id.clone(),
            )
        };

        // Identificar al emisor para poder filtrar el eco propio en recepción.
        if let Some(obj) = payload.as_object_mut() {
            obj.insert("src".to_string(), Value::String(user_id));
        }

        let body = serde_json::json!({
            "messages": [{
                "topic": topic,
                "event": msg_type,
                "payload": payload,
                "private": false,
            }]
        });

        let resp = self
            .client
            .post(&url)
            .header("apikey", key)
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if resp.status() == 202 {
            Ok(())
        } else {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            eprintln!("[signal] broadcast failed: {status} {body}");
            Err(format!("broadcast failed: {status}"))
        }
    }
}

async fn run_loop(app: AppHandle, inner: Arc<Mutex<Inner>>) {
    let mut attempts: u32 = 0;

    loop {
        if inner.lock().await.stopping {
            break;
        }

        let url = {
            let g = inner.lock().await;
            SignalingManager::ws_url(&g.supabase_url, &g.anon_key)
        };

        match connect_async(&url).await {
            Ok((ws, _)) => {
                attempts = 0;
                let (write, read) = ws.split();
                {
                    inner.lock().await.sender = Some(write);
                }
                let _ = app.emit("signal:open", ());
                let _ = handle_connection(&app, &inner, read).await;
                {
                    inner.lock().await.sender = None;
                }
                let _ = app.emit("signal:closed", ());
            }
            Err(e) => {
                eprintln!("[signal] connect failed: {e}");
                let _ = app.emit("signal:closed", ());
            }
        }

        if inner.lock().await.stopping {
            break;
        }

        attempts += 1;
        if attempts > MAX_RECONNECT_ATTEMPTS {
            eprintln!("[signal] reconnect attempts exhausted");
            let _ = app.emit(
                "signal:error",
                serde_json::json!({ "code": "RECONNECT_EXHAUSTED" }),
            );
            break;
        }

        tokio::time::sleep(Duration::from_secs(attempts as u64)).await;
    }
}

async fn handle_connection(
    app: &AppHandle,
    inner: &Arc<Mutex<Inner>>,
    mut read: WsRead,
) -> Result<(), String> {
    // Unirse al canal broadcast de la pareja.
    {
        let mut g = inner.lock().await;
        let topic = format!("realtime:call:{}", g.connection_id);
        let join = serde_json::json!([
            null, "1", topic, "phx_join",
            {
                "config": {
                    "broadcast": { "ack": false, "self": false },
                    "presence": { "key": "", "enabled": false },
                    "postgres_changes": [],
                    "private": false,
                }
            }
        ])
        .to_string();
        if let Some(sender) = g.sender.as_mut() {
            let _ = sender.send(Message::Text(join.into())).await;
        }
    }

    // Heartbeat Phoenix cada 25s para mantener viva la conexión.
    let hb_inner = inner.clone();
    let heartbeat = tauri::async_runtime::spawn(async move {
        let mut ticker = tokio::time::interval(HEARTBEAT_INTERVAL);
        ticker.tick().await;
        let mut ref_id: u32 = 0;
        loop {
            ticker.tick().await;
            ref_id += 1;
            let mut g = hb_inner.lock().await;
            let Some(sender) = g.sender.as_mut() else {
                break;
            };
            let msg = serde_json::json!([null, ref_id.to_string(), "phoenix", "heartbeat", {}])
                .to_string();
            if sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    let user_id = { inner.lock().await.user_id.clone() };

    while let Some(msg) = read.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                if let Ok(arr) = serde_json::from_str::<Vec<Value>>(&text) {
                    let event = arr.get(3).and_then(|v| v.as_str()).unwrap_or("");
                    let payload = arr.get(4).cloned().unwrap_or(Value::Null);
                    if event == "broadcast" {
                        // Broadcast entregado como JSON (en vez de binario).
                        // Forma: payload = {type: "broadcast", event, payload}.
                        let ev = payload.get("event").and_then(|v| v.as_str()).unwrap_or("");
                        let data = payload.get("payload").cloned().unwrap_or(Value::Null);
                        eprintln!("[signal] broadcast (json) event={ev}");
                        dispatch_broadcast(app, &user_id, ev, data);
                    } else {
                        handle_phoenix(app, event, payload);
                    }
                }
            }
            Ok(Message::Binary(bytes)) => {
                match decode_broadcast(&bytes) {
                    Some((event, payload)) => {
                        eprintln!("[signal] broadcast (binary) event={event}");
                        dispatch_broadcast(app, &user_id, &event, payload);
                    }
                    None => {
                        eprintln!("[signal] binary frame no decodificado (len={})", bytes.len());
                    }
                }
            }
            Ok(Message::Close(_)) => break,
            Err(e) => {
                eprintln!("[signal] read error: {e}");
                break;
            }
            _ => {}
        }
    }

    heartbeat.abort();
    Ok(())
}

fn handle_phoenix(app: &AppHandle, event: &str, payload: Value) {
    match event {
        "phx_reply" => {
            let status = payload.get("status").and_then(|v| v.as_str()).unwrap_or("");
            if status == "ok" {
                let _ = app.emit("signal:open", ());
            } else {
                eprintln!("[signal] phx_reply error: {payload}");
                let _ = app.emit(
                    "signal:error",
                    serde_json::json!({ "code": "JOIN_ERROR", "msg": payload }),
                );
            }
        }
        "phx_error" => {
            eprintln!("[signal] phx_error: {payload}");
            let _ = app.emit("signal:error", serde_json::json!({ "code": "JOIN_ERROR" }));
        }
        _ => {}
    }
}

fn handle_broadcast(app: &AppHandle, event: &str, payload: Value) {
    match event {
        "offer" => {
            wake(app);
            let _ = app.emit("signal:offer", payload);
        }
        "answer" => {
            let _ = app.emit("signal:answer", payload);
        }
        "candidate" => {
            let _ = app.emit("signal:candidate", payload);
        }
        "hangup" => {
            let _ = app.emit("signal:hangup", payload);
        }
        "chat" => {
            let _ = app.emit("signal:chat", payload);
        }
        "status" => {
            let _ = app.emit("signal:status", payload);
        }
        _ => {}
    }
}

/// Filtra el eco propio y limpia `src` antes de despachar el broadcast.
/// Al enviar por REST, el servidor entrega el broadcast a todos los suscritos,
/// incluida nuestra propia conexión (el `self: false` solo aplica al envío WS).
fn dispatch_broadcast(app: &AppHandle, user_id: &str, event: &str, mut data: Value) {
    if let Some(src) = data.get("src").and_then(|v| v.as_str()) {
        if src == user_id {
            eprintln!("[signal] eco propio ignorado event={event}");
            return;
        }
    }
    if let Some(obj) = data.as_object_mut() {
        obj.remove("src");
    }
    handle_broadcast(app, event, data);
}

/// Decodifica un frame de broadcast binario (kind 4) de Supabase Realtime.
/// Formato: [kind=4][topicLen][eventLen][metaLen][encoding][topic][event][meta][payload]
fn decode_broadcast(bytes: &[u8]) -> Option<(String, Value)> {
    if bytes.len() < 5 || bytes[0] != 4 {
        return None;
    }
    let topic_len = bytes[1] as usize;
    let event_len = bytes[2] as usize;
    let meta_len = bytes[3] as usize;
    let encoding = bytes[4];
    let mut offset = 5;

    let _topic = std::str::from_utf8(bytes.get(offset..offset + topic_len)?)
        .ok()?
        .to_string();
    offset += topic_len;

    let event = std::str::from_utf8(bytes.get(offset..offset + event_len)?)
        .ok()?
        .to_string();
    offset += event_len;

    // metadata (JSON, opcional) — no la necesitamos
    offset += meta_len;

    let payload_bytes = bytes.get(offset..)?;
    if encoding != 1 {
        return None;
    }
    let payload = serde_json::from_slice::<Value>(payload_bytes).ok()?;
    Some((event, payload))
}

fn wake(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_always_on_top(true);
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

#[tauri::command]
pub fn signal_start(
    manager: tauri::State<'_, SignalingManager>,
    connection_id: String,
    user_id: String,
    supabase_url: String,
    anon_key: String,
) {
    manager.start(connection_id, user_id, supabase_url, anon_key);
}

#[tauri::command]
pub async fn signal_send(
    manager: tauri::State<'_, SignalingManager>,
    msg_type: String,
    payload: Value,
) -> Result<(), String> {
    manager.send(msg_type, payload).await
}

#[tauri::command]
pub async fn signal_stop(manager: tauri::State<'_, SignalingManager>) -> Result<(), String> {
    manager.stop().await;
    Ok(())
}
