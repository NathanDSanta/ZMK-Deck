use hidapi::{BusType, DeviceInfo, HidApi};
use std::ffi::CString;

#[derive(Debug, Clone)]
pub struct DeviceDescriptor {
    pub vendor_id: u16,
    pub product_id: u16,
    pub product_string: String,
    pub manufacturer: String,
    pub transport_type: String,
    pub path: CString,
}

pub fn find_matching_devices(
    api: &mut HidApi,
    usage_page: u16,
    usage: u16,
) -> Result<Vec<DeviceDescriptor>, Box<dyn std::error::Error>> {
    api.refresh_devices()?;

    let devices = api
        .device_list()
        .filter(|device| {
            device.usage_page() == usage_page &&
            device.usage() == usage
        })
        .map(create_descriptor)
        .collect();

    Ok(devices)
}

fn create_descriptor(
    device: &DeviceInfo,
) -> DeviceDescriptor {
    let product = device
        .product_string()
        .unwrap_or("Unknown Product");

    let manufacturer = device
        .manufacturer_string()
        .unwrap_or("Unknown Manufacturer");

    DeviceDescriptor {
        vendor_id: device.vendor_id(),
        product_id: device.product_id(),
        product_string: product.to_string(),
        manufacturer: manufacturer.to_string(),
        transport_type: detect_transport(device),
        path: device.path().to_owned(),
    }
}

fn detect_transport(device: &DeviceInfo) -> String {
    match device.bus_type() {
        BusType::Bluetooth => "Bluetooth".to_string(),

        BusType::Usb => "USB / Standard HID".to_string(),

        _ => {
            let path = device
                .path()
                .to_string_lossy()
                .to_lowercase();

            if path.contains("uhid") || path.contains("0005:") {
                "Bluetooth".to_string()
            } else {
                "USB / Standard HID".to_string()
            }
        }
    }
}
