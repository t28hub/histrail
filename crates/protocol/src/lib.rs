//! Contract types, the single source of truth for every wire format.

pub mod jsonrpc;
pub mod method;
pub mod pages;
mod version;

pub use version::{PROTOCOL_VERSION, SUPPORTED_VERSIONS};
