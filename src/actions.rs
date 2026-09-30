use crate::event::KeyboardEvent;

pub fn handle_event(event: KeyboardEvent) {
    match event.code {
        0x01 => println!("Key 1 pressed"),
        0x02 => println!("Key 2 pressed"),
        0x03 => println!("Key 3 pressed"),
        _ => println!("Unknown key code: {}", event.code),
    }
}