//! The methods every client can call, tied to their params and results.

use schemars::{JsonSchema, Schema, SchemaGenerator};
use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::pages;

/// The kind of client, taken from the transport a request arrived on so it cannot be faked.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ClientKind {
    /// The browser extension, through the Native Messaging proxy.
    Extension,
}

/// A request method, tying its name to its params and result.
pub trait Method {
    /// The `method` member, such as `pages/ingest`.
    const NAME: &'static str;
    /// The kinds of client allowed to call the method.
    const CLIENTS: &'static [ClientKind];
    /// The params without `_meta`, which [`crate::jsonrpc::Params`] adds.
    type Params: Serialize + DeserializeOwned + JsonSchema;
    /// The result of a successful call.
    type Result: Serialize + DeserializeOwned + JsonSchema;
}

/// What [`METHODS`] records about a [`Method`].
#[derive(Debug, Clone, Copy)]
pub struct MethodInfo {
    /// [`Method::NAME`].
    pub name: &'static str,
    /// [`Method::CLIENTS`].
    pub clients: &'static [ClientKind],
    /// Writes the schema of [`Method::Params`].
    pub params_schema: fn(&mut SchemaGenerator) -> Schema,
    /// Writes the schema of [`Method::Result`].
    pub result_schema: fn(&mut SchemaGenerator) -> Schema,
}

impl MethodInfo {
    /// Records `M`.
    #[must_use]
    pub const fn of<M: Method>() -> Self {
        Self {
            name: M::NAME,
            clients: M::CLIENTS,
            params_schema: M::Params::json_schema,
            result_schema: M::Result::json_schema,
        }
    }
}

/// Every method, so generated schemas and dispatch tables cannot miss one.
pub const METHODS: &[MethodInfo] = &[MethodInfo::of::<pages::Ingest>()];

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use super::*;

    #[test]
    fn names_each_method_once() {
        // Act
        let names: HashSet<_> = METHODS.iter().map(|method| method.name).collect();

        // Assert
        assert_eq!(names.len(), METHODS.len());
    }

    #[test]
    fn avoids_the_names_json_rpc_reserves() {
        // Act
        let reserved: Vec<_> = METHODS
            .iter()
            .map(|method| method.name)
            .filter(|name| name.starts_with("rpc."))
            .collect();

        // Assert
        assert!(reserved.is_empty(), "{reserved:?}");
    }

    #[test]
    fn allows_some_client_for_each_method() {
        // Act
        let unreachable: Vec<_> = METHODS
            .iter()
            .filter(|method| method.clients.is_empty())
            .map(|method| method.name)
            .collect();

        // Assert
        assert!(unreachable.is_empty(), "{unreachable:?}");
    }
}
