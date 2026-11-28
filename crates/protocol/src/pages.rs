//! Methods about the pages the user visited.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::method::{ClientKind, Method};

/// `pages/ingest` stores the text the user saw on a page.
#[derive(Debug, Clone, Copy)]
pub struct Ingest;

impl Method for Ingest {
    const NAME: &'static str = "pages/ingest";
    const CLIENTS: &'static [ClientKind] = &[ClientKind::Extension];
    type Params = IngestParams;
    type Result = IngestResult;
}

/// The params of [`Ingest`], one page as the user saw it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct IngestParams {
    /// The page's URL after redirects and history changes.
    pub url: String,
    /// The page's title, or an empty string when it has none.
    pub title: String,
    /// The absolute URL in the page's `<link rel="canonical">`, or `null` when there is none.
    pub canonical_url: Option<String>,
    /// The page's `lang` attribute, or `null` when it is empty.
    pub lang: Option<String>,
    /// The text the user saw.
    pub text: String,
}

/// The result of [`Ingest`], empty so fields can be added later.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
pub struct IngestResult {}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;
    use crate::PROTOCOL_VERSION;
    use crate::jsonrpc::{Params, Request, RequestId, RequestMeta, Version};

    #[test]
    fn writes_a_request_with_its_protocol_version() {
        // Arrange
        let request = Request {
            jsonrpc: Version::V2,
            id: RequestId::Number(1),
            method: Ingest::NAME.to_owned(),
            params: Params {
                meta: RequestMeta {
                    protocol_version: PROTOCOL_VERSION.to_owned(),
                },
                inner: IngestParams {
                    url: "https://example.com/article".to_owned(),
                    title: "Example".to_owned(),
                    canonical_url: None,
                    lang: Some("en".to_owned()),
                    text: "Hello".to_owned(),
                },
            },
        };

        // Act
        let actual = serde_json::to_value(request).unwrap();

        // Assert
        assert_eq!(
            actual,
            json!({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "pages/ingest",
                "params": {
                    "_meta": { "protocolVersion": PROTOCOL_VERSION },
                    "url": "https://example.com/article",
                    "title": "Example",
                    "canonicalUrl": null,
                    "lang": "en",
                    "text": "Hello",
                },
            }),
        );
    }

    #[test]
    fn reads_params_with_every_field() {
        // Arrange
        let params = json!({
            "_meta": { "protocolVersion": PROTOCOL_VERSION },
            "url": "https://example.com/article",
            "title": "Example",
            "canonicalUrl": "https://example.com/",
            "lang": "en",
            "text": "Hello",
        });

        // Act
        let actual: Params<IngestParams> = serde_json::from_value(params).unwrap();

        // Assert
        assert_eq!(
            actual,
            Params {
                meta: RequestMeta {
                    protocol_version: PROTOCOL_VERSION.to_owned()
                },
                inner: IngestParams {
                    url: "https://example.com/article".to_owned(),
                    title: "Example".to_owned(),
                    canonical_url: Some("https://example.com/".to_owned()),
                    lang: Some("en".to_owned()),
                    text: "Hello".to_owned(),
                },
            },
        );
    }

    #[test]
    fn rejects_params_without_a_protocol_version() {
        // Arrange
        let params = json!({
            "url": "https://example.com/article",
            "title": "Example",
            "canonicalUrl": null,
            "lang": null,
            "text": "Hello",
        });

        // Act
        let actual = serde_json::from_value::<Params<IngestParams>>(params);

        // Assert
        assert!(actual.is_err());
    }

    #[test]
    fn writes_an_empty_result() {
        // Act
        let actual = serde_json::to_value(IngestResult {}).unwrap();

        // Assert
        assert_eq!(actual, json!({}));
    }
}
