//! The JSON-RPC 2.0 envelope shared by every method.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// The `jsonrpc` member, which JSON-RPC 2.0 requires to be exactly `"2.0"`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
pub enum Version {
    /// JSON-RPC 2.0.
    #[default]
    #[serde(rename = "2.0")]
    V2,
}

/// Matches a response to its request.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, JsonSchema)]
#[serde(untagged)]
pub enum RequestId {
    /// An integer ID.
    Number(i64),
    /// A string ID.
    String(String),
}

/// A request that expects a response, with `P` left as [`Value`] to read the method first.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct Request<P = Value> {
    /// Always `"2.0"`.
    pub jsonrpc: Version,
    /// Echoed in the response.
    pub id: RequestId,
    /// The method to call, such as `pages/ingest`.
    pub method: String,
    /// The method's params.
    pub params: P,
}

/// A method's params with the metadata every request carries.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct Params<P> {
    /// Metadata about the request itself.
    #[serde(rename = "_meta")]
    pub meta: RequestMeta,
    /// The method's own params.
    #[serde(flatten)]
    pub inner: P,
}

/// Metadata in `params._meta`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct RequestMeta {
    /// The protocol version the request was written for.
    pub protocol_version: String,
}

/// The reply to a [`Request`], with `R` left as [`Value`] to relay it without reading it.
#[derive(Debug, Clone, PartialEq, Serialize, JsonSchema)]
pub struct Response<R = Value> {
    /// Always `"2.0"`.
    pub jsonrpc: Version,
    /// The request's ID, or `null` when the request was too malformed to read one.
    pub id: Option<RequestId>,
    /// Either `result` or `error`, never both.
    #[serde(flatten)]
    pub outcome: Outcome<R>,
}

/// Whether a request succeeded.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum Outcome<R> {
    /// The method's result.
    Result(R),
    /// Why the request failed.
    Error(ErrorObject),
}

/// A response as read, since `#[serde(flatten)]` alone would accept both `result` and `error`.
#[derive(Deserialize)]
#[serde(bound(deserialize = "R: Deserialize<'de>"))]
struct RawResponse<R> {
    jsonrpc: Version,
    id: Option<RequestId>,
    // `Option` alone would read `"result": null` as a missing result.
    #[serde(default, deserialize_with = "present")]
    result: Option<R>,
    error: Option<ErrorObject>,
}

impl<'de, R: Deserialize<'de>> Deserialize<'de> for Response<R> {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let raw = RawResponse::deserialize(deserializer)?;
        let outcome = match (raw.result, raw.error) {
            (Some(result), None) => Outcome::Result(result),
            (None, Some(error)) => Outcome::Error(error),
            (Some(_), Some(_)) => {
                return Err(serde::de::Error::custom(
                    "a response has both `result` and `error`",
                ));
            }
            (None, None) => {
                return Err(serde::de::Error::custom(
                    "a response has neither `result` nor `error`",
                ));
            }
        };
        Ok(Self {
            jsonrpc: raw.jsonrpc,
            id: raw.id,
            outcome,
        })
    }
}

/// Reads a member that is present, even when its value is `null`.
fn present<'de, D, T>(deserializer: D) -> Result<Option<T>, D::Error>
where
    D: serde::Deserializer<'de>,
    T: Deserialize<'de>,
{
    T::deserialize(deserializer).map(Some)
}

/// The `error` member of a failed response.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct ErrorObject {
    /// One of the codes in [`error_code`].
    pub code: i32,
    /// A short description of the error.
    pub message: String,
    /// Details whose shape depends on `code`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

/// The `data` of an [`error_code::UNSUPPORTED_PROTOCOL_VERSION`] error.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
pub struct UnsupportedProtocolVersionData {
    /// The versions the receiver accepts, newest first.
    pub supported: Vec<String>,
    /// The version the request named.
    pub requested: String,
}

/// Error codes, the standard JSON-RPC ones plus those Histrail defines.
pub mod error_code {
    /// The message is not valid JSON.
    pub const PARSE_ERROR: i32 = -32700;
    /// The message is not a valid JSON-RPC request.
    pub const INVALID_REQUEST: i32 = -32600;
    /// No method has that name.
    pub const METHOD_NOT_FOUND: i32 = -32601;
    /// The params do not match the method, or `_meta.protocolVersion` is missing.
    pub const INVALID_PARAMS: i32 = -32602;
    /// The receiver failed while handling a valid request.
    pub const INTERNAL_ERROR: i32 = -32603;
    /// The receiver does not accept the request's protocol version. The same code as MCP's.
    pub const UNSUPPORTED_PROTOCOL_VERSION: i32 = -32022;
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

    #[test]
    fn rejects_a_jsonrpc_version_other_than_2_0() {
        // Arrange
        let message = json!({ "jsonrpc": "1.0", "id": 1, "method": "pages/ingest", "params": {} });

        // Act
        let actual = serde_json::from_value::<Request>(message);

        // Assert
        assert!(actual.is_err());
    }

    #[test]
    fn reads_string_and_number_ids() {
        // Arrange
        let ids = json!([7, "seven"]);

        // Act
        let actual: Vec<RequestId> = serde_json::from_value(ids).unwrap();

        // Assert
        assert_eq!(
            actual,
            [RequestId::Number(7), RequestId::String("seven".to_owned())]
        );
    }

    #[test]
    fn writes_a_result_without_an_error() {
        // Arrange
        let response = Response {
            jsonrpc: Version::V2,
            id: Some(RequestId::Number(1)),
            outcome: Outcome::Result(json!({})),
        };

        // Act
        let actual = serde_json::to_value(response).unwrap();

        // Assert
        assert_eq!(actual, json!({ "jsonrpc": "2.0", "id": 1, "result": {} }));
    }

    #[test]
    fn writes_an_error_without_a_result() {
        // Arrange
        let response = Response::<Value> {
            jsonrpc: Version::V2,
            id: None,
            outcome: Outcome::Error(ErrorObject {
                code: error_code::PARSE_ERROR,
                message: "Parse error".to_owned(),
                data: None,
            }),
        };

        // Act
        let actual = serde_json::to_value(response).unwrap();

        // Assert
        assert_eq!(
            actual,
            json!({ "jsonrpc": "2.0", "id": null, "error": { "code": -32700, "message": "Parse error" } }),
        );
    }

    #[test]
    fn rejects_a_response_with_both_a_result_and_an_error() {
        // Arrange
        let message = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "result": {},
            "error": { "code": -32603, "message": "Internal error" },
        });

        // Act
        let actual = serde_json::from_value::<Response>(message);

        // Assert
        assert!(actual.is_err());
    }

    #[test]
    fn rejects_a_response_with_neither_a_result_nor_an_error() {
        // Arrange
        let message = json!({ "jsonrpc": "2.0", "id": 1 });

        // Act
        let actual = serde_json::from_value::<Response>(message);

        // Assert
        assert!(actual.is_err());
    }

    #[test]
    fn reads_a_null_result_as_a_result() {
        // Arrange
        let message = json!({ "jsonrpc": "2.0", "id": 1, "result": null });

        // Act
        let actual: Response = serde_json::from_value(message).unwrap();

        // Assert
        assert_eq!(actual.outcome, Outcome::Result(Value::Null));
    }

    #[test]
    fn writes_the_versions_of_an_unsupported_protocol_version_error() {
        // Arrange
        let data = UnsupportedProtocolVersionData {
            supported: vec!["2026-11-28".to_owned()],
            requested: "1900-01-01".to_owned(),
        };

        // Act
        let actual = serde_json::to_value(data).unwrap();

        // Assert
        assert_eq!(
            actual,
            json!({ "supported": ["2026-11-28"], "requested": "1900-01-01" })
        );
    }
}
