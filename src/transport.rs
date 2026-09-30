use hidapi::{HidApi, HidDevice};

pub struct KeyboardHid {
    device: HidDevice,
}

impl KeyboardHid {
    pub fn connect(
        api: &HidApi,
        vendor_id: u16,
        product_id: u16,
        usage_page: u16,
        usage: u16,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        for device in api.device_list() {
            if device.vendor_id() == vendor_id
                && device.product_id() == product_id
                && device.usage_page() == usage_page
                && device.usage() == usage
            {
                println!(
                    "Found device: VID: {:04x}, PID: {:04x}, Product: {}, Path: {}",
                    device.vendor_id(),
                    device.product_id(),
                    device.product_string().unwrap_or("Unknown product"),
                    device.path().to_string_lossy()
                );
                let openDevice = device.open_device(api)?;
                return Ok(Self { device: openDevice });
            }
        }
        Err("Device not found".into())
    }

    pub fn listen(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut buf = [0u8; 64];
    
        loop {
            let size = self.device.read(&mut buf)?;

            if size > 0 {
                println!("Received {} bytes:", size);

                for byte in &buf[..size] {
                    print!("{:02x} ", byte);
                }
                println!();
            }
        }
    }
}