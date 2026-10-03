use hidapi::{HidApi, HidDevice};
use std::ffi::CString;

pub struct KeyboardHid {
    device: HidDevice,
}

impl KeyboardHid {
    pub fn connect_path(
        api: &HidApi,
        path: &CString,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let device = api.open_path(path)?;

        Ok(Self { device })
    }

    pub fn listen<F>(
        &self,
        mut callback: F,
    ) -> Result<(), Box<dyn std::error::Error>>
    where
        F: FnMut(u8),
    {
        let mut buffer = [0u8; 64];

        loop {
            let size = self.device.read(&mut buffer)?;

            if size == 0 {
                continue;
            }

            let byte = buffer[0];

            callback(byte);
        }
    }
}
