use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{command, State};

#[cfg(target_os = "macos")]
use super::keychain_macos as platform;
#[cfg(target_os = "windows")]
use super::keychain_windows as platform;

/// Single credential entry that stores all API keys as JSON
pub const KEYCHAIN_SERVICE: &str = "com.council-of-ai-agents.keys";
pub const KEYCHAIN_ACCOUNT: &str = "api-keys";

/// Legacy per-provider keychain account name (macOS migration only)
pub const LEGACY_ACCOUNT: &str = "api-key";

/// Legacy per-provider service names for migration (macOS migration only)
pub const LEGACY_SERVICES: &[(&str, &str)] = &[
    ("anthropic", "com.council-of-ai-agents.anthropic"),
    ("openai", "com.council-of-ai-agents.openai"),
    ("google", "com.council-of-ai-agents.google"),
    ("xai", "com.council-of-ai-agents.xai"),
    ("deepseek", "com.council-of-ai-agents.deepseek"),
    ("mistral", "com.council-of-ai-agents.mistral"),
    ("together", "com.council-of-ai-agents.together"),
    ("cohere", "com.council-of-ai-agents.cohere"),
];

/// In-memory cache for API keys. `None` means not loaded yet.
pub struct ApiKeyCache {
    keys: Mutex<Option<HashMap<String, String>>>,
}

impl Default for ApiKeyCache {
    fn default() -> Self {
        Self {
            keys: Mutex::new(None),
        }
    }
}

/// Extract the provider suffix from a service string.
/// e.g. "com.council-of-ai-agents.anthropic" → "anthropic"
fn extract_provider(service: &str) -> String {
    service
        .rsplit('.')
        .next()
        .unwrap_or(service)
        .to_string()
}

/// Ensure cache is populated. Called once on first access.
fn ensure_loaded(cache: &ApiKeyCache) -> HashMap<String, String> {
    let mut guard = cache.keys.lock().unwrap();

    if let Some(ref keys) = *guard {
        return keys.clone();
    }

    // Try reading the credential store
    let mut keys = platform::read_keychain_blob();

    // If empty, try migrating legacy entries (macOS only; no-op on Windows)
    if keys.is_empty() {
        let legacy = platform::migrate_legacy_keys();
        if !legacy.is_empty() {
            let _ = platform::write_keychain_blob(&legacy);
            keys = legacy;
        }
    }

    *guard = Some(keys.clone());
    keys
}

#[command]
pub fn save_api_key(service: String, api_key: String, cache: State<ApiKeyCache>) -> Result<(), String> {
    let provider = extract_provider(&service);
    let mut keys = ensure_loaded(&cache);

    keys.insert(provider, api_key);
    platform::write_keychain_blob(&keys)?;

    // Update cache
    let mut guard = cache.keys.lock().unwrap();
    *guard = Some(keys);

    Ok(())
}

#[command]
pub fn get_api_key(service: String, cache: State<ApiKeyCache>) -> Result<Option<String>, String> {
    let provider = extract_provider(&service);
    let keys = ensure_loaded(&cache);
    Ok(keys.get(&provider).cloned())
}

#[command]
pub fn delete_api_key(service: String, cache: State<ApiKeyCache>) -> Result<(), String> {
    let provider = extract_provider(&service);
    let mut keys = ensure_loaded(&cache);

    keys.remove(&provider);
    platform::write_keychain_blob(&keys)?;

    // Update cache
    let mut guard = cache.keys.lock().unwrap();
    *guard = Some(keys);

    Ok(())
}

#[command]
pub fn has_api_key(service: String, cache: State<ApiKeyCache>) -> Result<bool, String> {
    let provider = extract_provider(&service);
    let keys = ensure_loaded(&cache);
    Ok(keys.contains_key(&provider))
}
