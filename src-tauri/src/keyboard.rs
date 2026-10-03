use crate::{
    actions, config::Config, device::find_matching_devices, state::AppState, transport::KeyboardHid,
};

use hidapi::HidApi;
use std::{sync::Arc, thread, time::Duration};

const TARGET_USAGE_PAGE: u16 = 0xFF60;
const TARGET_USAGE: u16 = 0x0061;

pub fn start_listener(state: AppState) {
    thread::spawn(move || {
        if let Err(error) = run_listener(state) {
            eprintln!("Keyboard listener stopped: {}", error);
        }
    });
}

fn run_listener(state: AppState) -> Result<(), Box<dyn std::error::Error>> {
    loop {
        let mut api = HidApi::new()?;

        let devices = find_matching_devices(&mut api, TARGET_USAGE_PAGE, TARGET_USAGE)?;

        if devices.is_empty() {
            thread::sleep(Duration::from_secs(3));
            continue;
        }

        // For now, automatically use the first device.
        //
        // Later we'll let React select the device.
        let device = &devices[0];

        println!("Connecting to keyboard: {}", device.product_string);

        match KeyboardHid::connect_path(&api, &device.path) {
            Ok(keyboard) => {
                println!("Keyboard connected.");

                let config = Arc::clone(&state.config);

                let result = keyboard.listen(move |byte| {
                    handle_byte(byte, &config);
                });

                if let Err(error) = result {
                    eprintln!("Keyboard disconnected: {}", error);
                }
            }

            Err(error) => {
                eprintln!("Failed to connect: {}", error);
            }
        }

        thread::sleep(Duration::from_secs(1));
    }
}

fn handle_byte(byte: u8, config: &Arc<std::sync::RwLock<Config>>) {
    println!("Received byte: 0x{:02X}", byte);

    let config = match config.read() {
        Ok(config) => config,

        Err(error) => {
            eprintln!("Failed to read config: {}", error);

            return;
        }
    };

    let Some(function_name) = config.buttons.get(&byte) else {
        println!("No function mapped to 0x{:02X}", byte);

        return;
    };

    let Some(function) = config.functions.get(function_name) else {
        eprintln!("Function '{}' doesn't exist!", function_name);

        return;
    };

    if let Err(error) = actions::execute(function) {
        eprintln!("Action '{}' failed: {}", function_name, error);
    }
}
