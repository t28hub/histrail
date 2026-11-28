# Histrail Extension

The browser extension for Histrail, a local search engine for your browsing history.

## Development

### Prerequisites

- [just](https://just.systems/)
- [pnpm](https://pnpm.io/)
- Chrome or Firefox

### Running the extension

Run these commands from the repository root:

```sh
# Install tools and dependencies
just setup
```

#### Chrome

1. Run `just dev-extension-chrome`.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select `apps/extension/.output/chrome-mv3-dev`.

#### Firefox

1. Run `just dev-extension-firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select
   `apps/extension/.output/firefox-mv3-dev/manifest.json`.

## Layout

- [`src/entrypoints/`](src/entrypoints/): the background script, the capture content script and the popup.
- [`src/capture/`](src/capture/): reading and validating the text of visited pages.
- [`src/messages.ts`](src/messages.ts): every runtime message the extension sends, typed with `@histrail/messaging`.
- [`src/platform/`](src/platform/): the only code that calls browser extension APIs.
