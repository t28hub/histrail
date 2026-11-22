# AGENTS.md

Histrail is a local search engine for everything you've browsed. A browser
extension captures pages; a Rust desktop app (Tauri v2) stores and indexes
them on the user's machine; the GUI, the CLI and an MCP server search them.
Nothing leaves the machine.

> **Status: planned, not yet implemented.** The repository does not contain
> most of the layout and files described below yet. The Cargo workspace has
> only `histrail-protocol` and `histrail-core`, both empty. The pnpm workspace
> has only the root, with no packages; there is no `apps/`, `packages/`,
> `fixtures/` or `docs/`. The `.justfile`
> defines every recipe, but `gen`, `gen-check`, `e2e`, `eval`, `bench` and
> `guard` fail with "not implemented yet" until their tooling exists, so
> `just verify` cannot pass. Treat the layout as the target structure, not
> as something to look up. Remove this note once the code lands.

- Design: `docs/design/` — read the relevant section before changing a
  subsystem. It is exported from the design doc; do not edit it here.
- Decisions not covered by the design: one line each in `docs/decisions.md`.

## Commands

Everything runs through `just`; CI runs the same recipes.

| Command | What it does |
|---|---|
| `just fmt` | `cargo fmt` and `biome format` |
| `just lint` | `cargo clippy -- -D warnings`, `biome check` (lint and assists), `tsc --noEmit` |
| `just test` | `cargo nextest run` and vitest |
| `just gen` / `just gen-check` | Regenerate JSON Schema, OpenRPC and TS types from `histrail-protocol` / fail if stale |
| `just e2e <suite>` | Playwright with the extension loaded into Chrome for Testing |
| `just eval` | Search quality (Recall@10, MRR, nDCG@10) on `fixtures/eval/` |
| `just bench` | criterion benchmarks and perf limits |
| `just guard` | Fails if tests, thresholds or snapshots were weakened |
| `just verify` | fmt-check, lint, test, gen-check, `cargo deny check`, guard |

`just verify` must pass before any change is done. `main` is kept green, so a
failure is yours to fix; do not assume it was already there. Also run the
check that covers what you touched:

| If you changed | Also run |
|---|---|
| `crates/protocol` | `just gen`, and commit the generated files |
| `crates/index`, ranking, tokenization | `just eval` |
| `crates/proxy`, `crates/rpc`, `apps/extension` | `just e2e` for the affected suite |
| ingest, search or store hot paths | `just bench` |

Scope cargo to the crate you changed (`cargo nextest run -p histrail-store`);
run the whole workspace only after touching `histrail-protocol` or `histrail-core`.
One test: `cargo nextest run -p histrail-index -E 'test(<name>)'`.
TypeScript: `pnpm -C apps/extension test`, `pnpm -C apps/desktop test`,
`pnpm -C packages/ui test`. Do not build with `--release` or `tauri build`
unless the task is about performance or packaging; they are slow.

## Repository map

```
crates/                Rust libraries and Rust-only binaries
  protocol/            contract types: the single source of truth for every wire format
  core/                domain: ingest, rules, search, delete. No transport code
  store/               SQLite + sqlite-vec; the only crate that writes to the DB
  index/               Tantivy + Lindera (Japanese) + bigram fields
  embedding/           ONNX Runtime embeddings and model management
  extract/             page captures -> typed records (builtin, declarative, WASM)
  import/              bookmark and history importers
  rpc/ mcp/ http/      adapters over core
  cli/                 published as `histrail`: the CLI and `histrail mcp`
  proxy/               stateless Native Messaging relay
  eval/                search quality harness behind `just eval`
  test-support/        temp DBs, fixtures, fake clock (dev-dependency only)
apps/                  what users install
  desktop/src/         desktop UI (TypeScript)
  desktop/src-tauri/   Tauri shell (`histrail-desktop`); uses crates/cli as a library
  extension/           MV3 extension, built for Chromium and Firefox
packages/              npm packages used by apps; direction is apps → ui → protocol
  ui/                  @histrail/ui: UI components shared by the desktop UI and the extension
  protocol/            @histrail/protocol: generated from crates/protocol, never edit by hand
fixtures/              synthetic pages, captures, imports, eval corpus
```

Package names are `histrail-<dir>` (`crates/store` → `histrail-store`),
except `crates/cli`, which is `histrail`.

Dependencies point one way: `protocol` ← `core` ← adapters (`rpc`, `mcp`, `http`,
`cli`, `desktop`). `core` never depends on an adapter; `proxy` depends only
on `protocol`. External clients reach core only through RPC.

## Rules that break things if ignored

- **Never write to stdout in `proxy` or `histrail mcp`.** stdout is the
  protocol channel. Log to stderr or the log file.
- **Public contracts change additively.** JSON-RPC methods and fields,
  Native Messaging frames and `--json` CLI output: removing or renaming needs
  a protocol version bump. Adding a case to a WIT `variant` bumps the package
  version (`histrail:extractor@0.x.0`).
- **Migrations are append-only.** Schema changes go in a new migration;
  never edit an existing one.
- **One writer.** All DB writes go through the store's writer. Do not open
  extra write connections or block inside async code.
- **Privacy.** Do not log page text, titles or full URLs above `debug` (log
  record IDs). Never commit real browsing history, bookmarks or captures;
  fixtures are synthetic. Do not add network calls.
- **Captured content is untrusted.** Pages, imported files and WASM extractors
  come from outside. Bound size and depth when parsing, never execute page
  content, and give WASM extractors nothing beyond the WIT interface. MCP
  returns page text to other agents; a new MCP tool that changes data needs
  approval.

## Rust

- Workspace lints in `Cargo.toml` are authoritative. To silence one, use
  `#[expect(lint, reason = "...")]`, not `#[allow]`.
- Libraries return `thiserror` errors; `anyhow` only in binaries.
- No `unwrap()` / `expect()` outside tests. No `unsafe` except the sqlite-vec
  loader in `histrail-store`, with a `// SAFETY:` comment.
- Log with `tracing`, never `println!`.
- Match enums defined in this workspace exhaustively; no `_ =>` arms, so a
  new variant fails to compile where it matters. Do not mark them
  `#[non_exhaustive]`, which forces `_ =>` in other crates.
- In tests, time and randomness come from `test-support` (fake clock, fixed seeds).
- Code behind `cfg(windows)` or `cfg(target_os = "macos")` does not compile
  on Linux. Check Windows code with
  `cargo xwin clippy --target x86_64-pc-windows-msvc`; macOS code is checked
  in CI. Say in the PR which targets you could not build.

## TypeScript

- pnpm, strict mode, vitest. Every package extends the root `tsconfig.base.json`.
- Browser differences live only in `apps/extension/src/platform/`. Shared
  code does not call `chrome.*` or `browser.*` directly.
- MV3: no remote code, no `eval`. New manifest or host permissions need
  approval.
- The desktop UI talks to core only through the generated commands and types.
- `packages/ui` is shared by both apps, so it never calls `chrome.*`, `browser.*`
  or Tauri APIs; components get what they need through props.

## Tests

- `cargo nextest`, `insta` for golden output, `proptest` for invariants.
- Add or update tests with every behavior change. A bug fix includes a test
  that fails without the fix; run it once without the fix to see it fail.
- Review snapshots with `cargo insta review` and explain each diff. Never
  accept snapshots in bulk.
- Never delete tests, add `#[ignore]` or lower thresholds to get green. Eval
  baselines (`fixtures/eval/`) and the perf limits checked by `just bench` are
  set by humans; do not edit them.
- Tests never use the network or a real browser profile.

## Dependencies

- Histrail is MIT. `cargo deny check` must pass; no GPL or AGPL.
- Prefer crates the design already names. Explain any other new dependency
  in the PR.
- Do not copy code from other projects without checking its license and
  noting the source.
- Change the lockfile only for the dependency you need
  (`cargo update -p <crate> --precise <version>`); never update everything.

## Comments and text

- Comments explain why: an invariant, a constraint, a non-obvious choice. Do
  not restate what the code does.
- Write comments, docs and PR text for a reader who has not seen your
  session. Do not mention prompts, earlier attempts or reverted changes. The
  PR's Task section is the one exception: it is the request, pasted as given.

## Changes and PRs

- Keep the diff to what was asked. No drive-by refactors or renames.
- If the change makes this file wrong (a command, path or rule), fix this
  file in the same PR. Do not add names of types or functions here; this
  file holds rules, and the code holds names.
- Do not add new rules to this file in a feature PR. Propose them under a
  "Suggested AGENTS.md additions" heading in the PR body; a rule earns its
  place when agents got the same thing wrong more than once.
- PRs are squash-merged, so the PR title becomes the commit on `main`.
  Titles follow Conventional Commits: `<type>(<scope>): <summary>`.
  CI rejects titles that do not match.
    - Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`.
    - Scope is the directory name under `crates/`, `apps/` or `packages/`
      (`core`, `store`, `extension`, `ui`, ...). Omit it for repo-wide changes.
    - Summary is imperative and lowercase, with no trailing period.
    - A breaking change gets `!` and a `BREAKING CHANGE:` footer in the PR
      body. Breaking `crates/protocol` is never done without asking first.
- Fill in `.github/PULL_REQUEST_TEMPLATE.md` for the PR body and pass it with
  `gh pr create --body-file`. Keep every heading; write "None" instead of
  deleting a section.
- Stop and ask instead of guessing when the request conflicts with
  `docs/design/`, needs a decision the design does not cover, or needs a new
  dependency, permission or network access.
