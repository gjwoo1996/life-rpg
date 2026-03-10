#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ai;
mod commands;
mod db;

use db::Database;
use tauri::Manager;

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
            let path = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."))
                .join("life-rpg.db");
            let db = Database::new(path).map_err(|e| e.to_string())?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_character,
            commands::get_character,
            commands::get_stats,
            commands::update_character_xp,
            commands::create_goal,
            commands::list_goals,
            commands::create_activity_log,
            commands::list_activity_logs,
            crate::ai::client::analyze_activity,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
