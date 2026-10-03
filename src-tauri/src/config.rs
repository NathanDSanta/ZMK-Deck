use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, path::Path};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    #[serde(default)]
    pub functions: HashMap<String, Function>,

    #[serde(default)]
    pub buttons: HashMap<u8, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum Function {
    #[serde(rename = "print")]
    Print { message: String },

    #[serde(rename = "open_url")]
    OpenUrl { url: String },
}

impl Default for Config {
    fn default() -> Self {
        Self {
            functions: HashMap::new(),
            buttons: HashMap::new(),
        }
    }
}

impl Config {
    pub fn load(path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        if !path.exists() {
            let config = Self::default();

            config.save(path)?;

            return Ok(config);
        }

        let contents = fs::read_to_string(path)?;

        Ok(serde_json::from_str(&contents)?)
    }

    pub fn save(&self, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
        let contents = serde_json::to_string_pretty(self)?;

        fs::write(path, contents)?;

        Ok(())
    }
}
