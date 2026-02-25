use std::thread;
use tauri::{Manager, PhysicalPosition, WindowEvent};
#[cfg(desktop)]
use tauri_plugin_deep_link::DeepLinkExt;
use window_vibrancy::*;
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

// Comando de ejemplo
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn clamp_window(window: tauri::Window) {
    if let Ok(monitor) = window.current_monitor() {
        if let Some(monitor) = monitor {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();

            if let (Ok(win_size), Ok(win_pos)) = (window.outer_size(), window.outer_position()) {
                let mut x = win_pos.x;
                let mut y = win_pos.y;

                let max_x = screen_pos.x + screen_size.width as i32 - win_size.width as i32;
                let max_y = screen_pos.y + screen_size.height as i32 - win_size.height as i32;

                x = x.clamp(screen_pos.x, max_x);
                y = y.clamp(screen_pos.y, max_y);

                let _ = window
                    .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }));
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().with_state_flags(StateFlags::POSITION).build())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_geolocation::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(desktop)]
            if let Err(e) = app.deep_link().register("cathub") {
                println!("Failed to register deep link scheme: {:?}", e);
            }

            app.deep_link().on_open_url(|event| {
                dbg!(event.urls());
            });

            #[cfg(target_os = "windows")]
            {
                use windows_sys::Win32::Graphics::Dwm::{
                    DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE,
                };

                apply_acrylic(&window, Some((0, 0, 0, 125))).expect("Windows only");

                let hwnd = window.hwnd().unwrap().0;
                let preference: u32 = 2;
                unsafe {
                    DwmSetWindowAttribute(
                        hwnd,
                        DWMWA_WINDOW_CORNER_PREFERENCE.try_into().unwrap(),
                        &preference as *const u32 as *const _,
                        std::mem::size_of::<u32>() as u32,
                    );
                }
            }

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(16.0))
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");


            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, clamp_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
