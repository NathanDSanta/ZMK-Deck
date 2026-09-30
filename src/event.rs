
pub struct KeyboardEvent {
    pub code: u8,
}

pub fn decode(data: &[u8]) -> Option<KeyboardEvent> {
    if data.len() < 2 {
        return None;
    }

    let code = data[1];

    Some(KeyboardEvent { code })
}