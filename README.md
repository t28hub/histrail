# Histrail

[![CI](https://github.com/t28hub/histrail/actions/workflows/ci.yml/badge.svg)](https://github.com/t28hub/histrail/actions/workflows/ci.yml)

> A local search engine for everything you’ve browsed.

## Development

Install the [prerequisites](apps/desktop/README.md#prerequisites), then run:

```sh
# Clone the repository
git clone https://github.com/t28hub/histrail.git
cd histrail

# Install tools and dependencies
just setup

# Start the desktop app in dev mode
just dev-desktop

# Start the browser extension for Chrome in dev mode
just dev-extension-chrome
```

The pre-commit hook and `just verify` also run [Gitleaks](https://github.com/gitleaks/gitleaks) to catch leaked secrets.
`just setup` does not install it, so install it with `brew install gitleaks` or from its [releases](https://github.com/gitleaks/gitleaks/releases).

Run `just` to list all recipes.

## License

This project is distributed under the MIT License. See the [LICENSE](LICENSE) file for details.
