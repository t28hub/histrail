# `@histrail/tsconfig`

Shared TypeScript configs for Histrail, built on [tsconfig/bases](https://github.com/tsconfig/bases).

## Configs

| File | Description | Extends |
|---|---|---|
| [`react.json`](react.json) | React apps built with Vite | `@tsconfig/vite-react`, `@tsconfig/strictest` |
| [`library.json`](library.json) | Libraries consumed by a bundler | `@tsconfig/strictest` |
| [`node.json`](node.json) | Files run by Node.js | `@tsconfig/node26`, `@tsconfig/strictest` |

## Installation

Add the package to `devDependencies`:

```sh
pnpm -C <package-dir> add -D --workspace @histrail/tsconfig
```

## Usage

Extend a config in `tsconfig.json`:

```json
{
  "extends": "@histrail/tsconfig/react"
}
```
