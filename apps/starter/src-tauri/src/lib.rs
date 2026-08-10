#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // macOS keeps Overlay + system traffic lights from tauri.conf.json.
      // Windows / Linux hide native chrome; the React TitleBar draws controls.
      #[cfg(not(target_os = "macos"))]
      {
        use tauri::Manager;
        if let Some(window) = app.get_webview_window("main") {
          window.set_decorations(false)?;
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
