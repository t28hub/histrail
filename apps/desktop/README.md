# Histrail Desktop

The desktop app for Histrail, a local search engine for your browsing history.

## Requirements

- macOS 13.3 (Ventura) or later

## Development

### Prerequisites

- [just](https://just.systems/)
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/)
- macOS: Xcode Command Line Tools
- Debian or Ubuntu: `libwebkit2gtk-4.1-dev` and `libdbus-1-dev`
- Other platforms: [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Running the app

Run these commands from the repository root:

```sh
# Install tools and dependencies
just setup

# Start the desktop app in dev mode
just dev-desktop
```

To preview only the UI in a browser, run `pnpm -C apps/desktop dev`.

## Layout

- [`src/`](src/): the React UI.
- [`src-tauri/`](src-tauri/): the Tauri app (`histrail-desktop`).
