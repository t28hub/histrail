# `histrail-protocol`

Contract types, the single source of truth for every wire format.

## Messages

Every message is [JSON-RPC 2.0](https://www.jsonrpc.org/specification), with the protocol version in each request's `params._meta.protocolVersion` as in [MCP](https://modelcontextprotocol.io/specification/versioning).

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "pages/ingest",
  "params": {
    "_meta": { "protocolVersion": "2026-11-28" },
    "url": "https://example.com/",
    "title": "Example",
    "canonicalUrl": null,
    "lang": "en",
    "text": "Hello, world!"
  }
}
```

## Errors

Errors use the [JSON-RPC 2.0 codes](https://www.jsonrpc.org/specification#error_object), plus these.

| Code | Meaning | `data` |
|---|---|---|
| `-32022` | The receiver does not accept the request's protocol version. | `{ "supported": [...], "requested": "..." }` |

## Installation

Add the crate to `[dependencies]`:

```sh
cargo add -p <crate> --path crates/protocol
```

## Usage

Read a request, then its params once the method is known:

```rust
use histrail_protocol::jsonrpc::{Params, Request};
use histrail_protocol::method::Method;
use histrail_protocol::pages::{Ingest, IngestParams};

let request: Request = serde_json::from_str(message)?;
if request.method == Ingest::NAME {
    let params: Params<IngestParams> = serde_json::from_value(request.params)?;
}
```

## Versioning

`PROTOCOL_VERSION` changes only with a backward-incompatible change, such as removing or renaming a method or a field.

## Adding a method

Implement `Method` for a new type and add it to `METHODS`, so generated schemas include it.
