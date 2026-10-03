use crate::config::Function;

pub fn execute(
    function: &Function,
) -> Result<(), Box<dyn std::error::Error>> {
    match function {
        Function::Print { message } => {
            println!("{}", message);
        }

        Function::OpenUrl { url } => {
            open::that(url)?;
        }
    }

    Ok(())
}
