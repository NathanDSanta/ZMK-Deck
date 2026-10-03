import { invoke } from "@tauri-apps/api/core";

export async function getConfig() {
  return await invoke("get_config");
}

export async function saveConfig(config) {
  return await invoke("save_config", {
    newConfig: config,
  });
}
