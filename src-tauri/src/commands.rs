use crate::{config::Config, state::AppState};

use tauri::State;

#[tauri::command]
pub fn get_config(state: State<'_, AppState>) -> Result<Config, String> {
    let config = state.config.read().map_err(|error| error.to_string())?;

    Ok(config.clone())
}

#[tauri::command]
pub fn save_config(new_config: Config, state: State<'_, AppState>) -> Result<(), String> {
    // Save to disk first.
    new_config
        .save(&state.config_path)
        .map_err(|error| error.to_string())?;

    // Update the live configuration.
    let mut config = state.config.write().map_err(|error| error.to_string())?;

    *config = new_config;

    Ok(())
}
