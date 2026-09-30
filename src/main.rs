mod event;
mod transport;
use hidapi::HidApi;

fn main() -> Result<(), Box<dyn std::error::Error>> {

   let api = HidApi::new()?;

   let vendorId: u16 = 0x1D50;
   let productId: u16 = 0x615E;
   let usagePage: u16 = 0xFF60;
   let usage: u16 = 0x61;

   while(true){
      let keyboard = transport::KeyboardHid::connect(&api, vendorId, productId, usagePage, usage)?;
      println!("Keyboard connected. Listening for events...");
      keyboard.listen()?;
   }

   Ok(())
}
