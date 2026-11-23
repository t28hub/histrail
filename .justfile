# Recipes whose tooling does not exist yet fail instead of passing, so
# `just verify` never reports green for a check that was never run.

# List available recipes
_default:
    @{{ just_executable() }} --justfile {{ justfile() }} --list --unsorted

alias f := format
alias l := lint
alias t := test
alias r := ready

# Install development tools and dependencies
[group('dev')]
setup:
    cargo install --locked cargo-nextest@0.9.152 cargo-deny@0.22.0
    pnpm install

# Start the desktop app
[group('dev')]
dev:
    pnpm -C apps/desktop tauri dev

# Format all files
[group('format')]
format: format-rust format-ts format-toml

# Format Rust files
[group('format')]
format-rust:
    cargo fmt --all

# Format TypeScript, JSON, YAML and HTML files
[group('format')]
format-ts:
    pnpm exec biome check --write --linter-enabled=false .

# Format TOML files
[group('format')]
format-toml:
    pnpm exec tombi format

# Check formatting of all files
[group('check')]
check: check-rust check-ts check-toml

# Check formatting of Rust files
[group('check')]
check-rust:
    cargo fmt --all --check

# Check formatting of TypeScript, JSON, YAML and HTML files
[group('check')]
check-ts:
    pnpm exec biome check --linter-enabled=false .

# Check formatting of TOML files
[group('check')]
check-toml:
    pnpm exec tombi format --check

# Lint all files
[group('lint')]
lint: lint-rust lint-ts lint-toml

# Lint Rust files
[group('lint')]
lint-rust:
    cargo clippy --workspace --all-targets -- -D warnings

# Lint and type-check TypeScript files
[group('lint')]
lint-ts:
    pnpm exec biome lint .
    pnpm -r --include-workspace-root exec tsc --noEmit

# Lint TOML files
[group('lint')]
lint-toml:
    pnpm exec tombi lint

# Run all tests
[group('test')]
test: test-rust test-ts

# Run Rust tests
[group('test')]
test-rust:
    cargo nextest run --workspace

# Run TypeScript tests
[group('test')]
test-ts:
    pnpm -r test

# Generate schemas and types from histrail-protocol
[group('gen')]
gen: (_todo "gen")

# Check that generated files are up to date
[group('gen')]
gen-check: (_todo "gen-check")

# Run an end-to-end test suite
[group('test')]
e2e suite: (_todo "e2e " + suite)

# Evaluate search quality
[group('test')]
eval: (_todo "eval")

# Run the benchmarks
[group('test')]
bench: (_todo "bench")

# Check dependency licenses and advisories
[group('ci')]
deny:
    cargo deny check

# Check that tests were not weakened
[group('ci')]
guard: (_todo "guard")

# Run all checks
[group('ci')]
verify: check lint test gen-check deny guard

# Format all files and run all checks
[group('ci')]
ready: format verify

_todo recipe:
    @echo "just {{ recipe }}: not implemented yet" >&2
    @exit 1
