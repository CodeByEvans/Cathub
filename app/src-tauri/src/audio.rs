use std::collections::HashMap;
use std::io::Cursor;
use std::sync::mpsc;

use rodio::{Decoder, OutputStream, Sink, Source};

fn sound_bytes(key: &str) -> Option<&'static [u8]> {
    match key {
        "hover" => Some(include_bytes!("../sounds/Hover.wav")),
        "click" => Some(include_bytes!("../sounds/Click.wav")),
        "ringtone" => Some(include_bytes!("../sounds/Ringtone.wav")),
        "error" => Some(include_bytes!("../sounds/Error.wav")),
        "send" => Some(include_bytes!("../sounds/Send.wav")),
        "incomingNote" => Some(include_bytes!("../sounds/Note_in_app.wav")),
        "mute" => Some(include_bytes!("../sounds/Mute.wav")),
        "unmute" => Some(include_bytes!("../sounds/Unmute.wav")),
        "callStarted" => Some(include_bytes!("../sounds/Call_Started.wav")),
        "callEnded" => Some(include_bytes!("../sounds/Call_Ended.wav")),
        "outgoingCall" => Some(include_bytes!("../sounds/Outgoing_Call.wav")),
        _ => None,
    }
}

enum Command {
    Play { key: String, volume: f32, looping: bool },
    Stop { key: String },
    StopAll,
}

/// El `OutputStream` de rodio no es `Send` (al menos en CoreAudio), por lo que
/// vive en un hilo dedicado y `AudioManager` solo expone un `Sender`, que sí es
/// `Send + Sync` y puede guardarse en el estado de Tauri.
pub struct AudioManager {
    tx: mpsc::Sender<Command>,
}

impl AudioManager {
    pub fn new() -> Result<Self, String> {
        let (tx, rx) = mpsc::channel::<Command>();

        std::thread::spawn(move || {
            let (_stream, handle) = match OutputStream::try_default() {
                Ok(v) => v,
                Err(_) => return,
            };
            let mut loops: HashMap<String, Sink> = HashMap::new();

            while let Ok(cmd) = rx.recv() {
                match cmd {
                    Command::Play {
                        key,
                        volume,
                        looping,
                    } => {
                        let Some(bytes) = sound_bytes(&key) else { continue };
                        let Ok(source) = Decoder::new(Cursor::new(bytes)) else {
                            continue;
                        };

                        let Ok(sink) = Sink::try_new(&handle) else {
                            continue;
                        };
                        sink.set_volume(volume);

                        if looping {
                            sink.append(source.repeat_infinite());
                            loops.insert(key, sink);
                        } else {
                            sink.append(source);
                            sink.detach();
                        }
                    }
                    Command::Stop { key } => {
                        if let Some(sink) = loops.remove(&key) {
                            sink.stop();
                        }
                    }
                    Command::StopAll => {
                        for (_, sink) in loops.drain() {
                            sink.stop();
                        }
                    }
                }
            }
        });

        Ok(Self { tx })
    }

    fn send(&self, cmd: Command) {
        let _ = self.tx.send(cmd);
    }
}

#[tauri::command]
pub fn play_sound(manager: tauri::State<AudioManager>, key: String, volume: f32, looping: bool) {
    manager.send(Command::Play {
        key,
        volume,
        looping,
    });
}

#[tauri::command]
pub fn stop_sound(manager: tauri::State<AudioManager>, key: String) {
    manager.send(Command::Stop { key });
}

#[tauri::command]
pub fn stop_all_sounds(manager: tauri::State<AudioManager>) {
    manager.send(Command::StopAll);
}
