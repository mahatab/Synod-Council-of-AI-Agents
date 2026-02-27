use security_framework::passwords::{
    delete_generic_password, get_generic_password, set_generic_password,
};
use tauri::command;

const KEYCHAIN_ACCOUNT: &str = "api-key";

#[command]
pub fn save_api_key(service: String, api_key: String) -> Result<(), String> {
    // Delete existing key first (if any) to avoid duplicates
    let _ = delete_generic_password(&service, KEYCHAIN_ACCOUNT);

    set_generic_password(&service, KEYCHAIN_ACCOUNT, api_key.as_bytes())
        .map_err(|e| format!("Failed to save API key to Keychain: {}", e))
}

#[command]
pub fn get_api_key(service: String) -> Result<Option<String>, String> {
    match get_generic_password(&service, KEYCHAIN_ACCOUNT) {
        Ok(bytes) => {
            let key = String::from_utf8(bytes.to_vec())
                .map_err(|e| format!("Failed to decode API key: {}", e))?;
            Ok(Some(key))
        }
        Err(_) => Ok(None),
    }
}

#[command]
pub fn delete_api_key(service: String) -> Result<(), String> {
    delete_generic_password(&service, KEYCHAIN_ACCOUNT)
        .map_err(|e| format!("Failed to delete API key from Keychain: {}", e))
}

#[command]
pub fn has_api_key(service: String) -> Result<bool, String> {
    match get_generic_password(&service, KEYCHAIN_ACCOUNT) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}
