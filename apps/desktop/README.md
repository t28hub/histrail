# Histrail Desktop

The desktop app for Histrail, a local search engine for your browsing history.

## Requirements

The macOS app requires macOS 13.3 (Ventura) or later.

## Development

Install just, pnpm and Rust. On macOS, install the Xcode Command Line Tools.
Run these commands from the repository root.

```sh
pnpm install
just dev
```

To preview just the React UI in a browser, run `pnpm -C apps/desktop dev`.

The React UI is in [`src/`](src/), and the Rust/Tauri app is in [`src-tauri/`](src-tauri/).
