mod actions;
mod commands;
mod config;
mod device;
mod keyboard;
mod state;
mod transport;

use config::Config;
use state::AppState;

use std::path::PathBuf;

fn main() {
    let config_path = PathBuf::from("config.json");

    let config = Config::load(&config_path).expect("Failed to load configuration");

    let state = AppState::new(config, config_path);

    keyboard::start_listener(state.clone());

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
