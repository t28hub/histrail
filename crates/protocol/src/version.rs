/// The protocol version this build sends, changed only by backward-incompatible changes.
pub const PROTOCOL_VERSION: &str = "2026-11-28";

/// Every protocol version this build accepts, newest first.
pub const SUPPORTED_VERSIONS: &[&str] = &[PROTOCOL_VERSION];
