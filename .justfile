# Recipes whose tooling does not exist yet fail instead of passing, so
# `just verify` never reports green for a check that was never run.

default:
    @just --list

# Format all files and sort imports
fmt:
    cargo fmt --all
    pnpm exec biome check --write --linter-enabled=false .
    pnpm exec tombi format

# Fail if `just fmt` would change anything
fmt-check:
    cargo fmt --all --check
    pnpm exec biome check --linter-enabled=false .
    pnpm exec tombi format --check

# Lint Rust (warnings as errors), TypeScript and TOML; type-check TypeScript
lint:
    cargo clippy --workspace --all-targets -- -D warnings
    pnpm exec biome lint .
    pnpm exec tombi lint
    pnpm -r --include-workspace-root exec tsc --noEmit

# Run all Rust and TypeScript tests in the workspace
test:
    cargo nextest run --workspace
    pnpm -r test

# Regenerate JSON Schema, OpenRPC and TypeScript types from histrail-protocol
gen: (_todo "gen")

# Fail if the generated files are stale
gen-check: (_todo "gen-check")

# Run one end-to-end suite with the extension loaded in Chrome for Testing
e2e suite: (_todo "e2e " + suite)

# Measure search quality against the baselines
eval: (_todo "eval")

# Run the benchmarks; fail if a perf limit is exceeded
bench: (_todo "bench")

# Check dependency licenses, security advisories, banned crates and sources
deny:
    cargo deny check

# Fail if tests, thresholds or snapshots were weakened
guard: (_todo "guard")

# Everything that must pass before a change is done
verify: fmt-check lint test gen-check deny guard

_todo recipe:
    @echo "just {{ recipe }}: not implemented yet" >&2
    @exit 1
