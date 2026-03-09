use tauri::{
    Manager,
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
};
#[cfg(desktop)]
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_window_state::StateFlags;
use window_vibrancy::*;

// Comando de ejemplo
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Método para ocultar el dock (Sólo para macOS)
#[tauri::command]
fn set_dock_visibility(app: tauri::AppHandle, visible: bool) {
    #[cfg(target_os = "macos")]
    {
        use tauri::ActivationPolicy;
        if visible {
            let _ = app.set_activation_policy(ActivationPolicy::Regular);
        } else {
            let _ = app.set_activation_policy(ActivationPolicy::Accessory);
        }
    }
}

// Comando para clamar la ventana
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

#[cfg(target_os = "windows")]
unsafe extern "system" fn subclass_proc(
    hwnd: windows_sys::Win32::Foundation::HWND,
    msg: u32,
    wparam: windows_sys::Win32::Foundation::WPARAM,
    lparam: windows_sys::Win32::Foundation::LPARAM,
    _uid: usize,
    _data: usize,
) -> windows_sys::Win32::Foundation::LRESULT {
    use windows_sys::Win32::Foundation::RECT;
    use windows_sys::Win32::Graphics::Gdi::{
        GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST,
    };
    use windows_sys::Win32::UI::Shell::DefSubclassProc;
    use windows_sys::Win32::UI::WindowsAndMessaging::{WM_MOVING, WM_NCACTIVATE};

    if msg == WM_NCACTIVATE {
        return DefSubclassProc(hwnd, msg, 1, lparam);
    }

    if msg == WM_MOVING {
        let rect = &mut *(lparam as *mut RECT);
        let monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);

        let mut mi = MONITORINFO {
            cbSize: std::mem::size_of::<MONITORINFO>() as u32,
            rcMonitor: RECT {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            rcWork: RECT {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
            dwFlags: 0,
        };
        GetMonitorInfoW(monitor, &mut mi);

        let width = rect.right - rect.left;
        let height = rect.bottom - rect.top;

        // rcWork respeta la barra de tareas, a diferencia de rcMonitor
        rect.left = rect.left.max(mi.rcWork.left).min(mi.rcWork.right - width);
        rect.top = rect.top.max(mi.rcWork.top).min(mi.rcWork.bottom - height);
        rect.right = rect.left + width;
        rect.bottom = rect.top + height;

        return 1; // TRUE → Windows aplica el RECT modificado
    }

    DefSubclassProc(hwnd, msg, wparam, lparam)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(StateFlags::POSITION)
                .build(),
        )
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_geolocation::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
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
                use windows_sys::Win32::UI::Shell::SetWindowSubclass;

                apply_acrylic(&window, Some((0, 0, 0, 10))).expect("Windows only");

                let hwnd = window.hwnd().unwrap().0;

                // Esquinas redondeadas
                let preference: u32 = 2;
                unsafe {
                    DwmSetWindowAttribute(
                        hwnd,
                        DWMWA_WINDOW_CORNER_PREFERENCE.try_into().unwrap(),
                        &preference as *const u32 as *const _,
                        std::mem::size_of::<u32>() as u32,
                    );

                    // ← Registrar el clamping nativo
                    SetWindowSubclass(hwnd, Some(subclass_proc), 1, 0);
                }
            }

            #[cfg(target_os = "macos")]
            apply_liquid_glass(&window, NSGlassEffectViewStyle::Regular, None, Some(16.0))
           .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
        
            #[cfg(desktop)]
            {
                let show = MenuItem::with_id(app, "show", "Mostrar", true, None::<&str>)?;
                let quit = MenuItem::with_id(app, "quit", "Cerrar app", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&show, &quit])?;
            
                TrayIconBuilder::new()
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event | match event.id.as_ref() {
                        "show" => {
                            let window = app.get_webview_window("main").unwrap();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                        "quit" => app.exit(0),
                        _ => {},
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {button: MouseButton::Left, ..} = event {
                            let app = tray.app_handle();
                            let window = app.get_webview_window("main").unwrap();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    })
                    .build(app)?;
            }            
        
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, clamp_window, set_dock_visibility])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
