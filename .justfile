# Recipes whose tooling does not exist yet fail instead of passing, so
# `just verify` never reports green for a check that was never run.

default:
    @just --list

# cargo fmt, biome format and tombi format
fmt:
    cargo fmt --all
    pnpm exec biome format --write .
    pnpm exec tombi format

# Fail if cargo fmt, biome format or tombi format would change anything
fmt-check:
    cargo fmt --all --check
    pnpm exec biome format .
    pnpm exec tombi format --check

# cargo clippy -D warnings, biome lint and assists, tombi lint, tsc --noEmit
lint:
    cargo clippy --workspace --all-targets -- -D warnings
    pnpm exec biome check --formatter-enabled=false .
    pnpm exec tombi lint
    pnpm -r --include-workspace-root exec tsc --noEmit

# cargo nextest and vitest
test:
    cargo nextest run --workspace
    pnpm -r test

# Regenerate JSON Schema, OpenRPC and TS types from histrail-protocol
gen: (_todo "gen")

# Fail if the generated files are stale
gen-check: (_todo "gen-check")

# Playwright with the extension loaded into Chrome for Testing
e2e suite: (_todo "e2e " + suite)

# Search quality (Recall@10, MRR, nDCG@10) on fixtures/eval/
eval: (_todo "eval")

# criterion benchmarks and perf limits
bench: (_todo "bench")

# Licenses, advisories, banned crates and dependency sources
deny:
    cargo deny check

# Fail if tests, thresholds or snapshots were weakened
guard: (_todo "guard")

# Everything that must pass before a change is done
verify: fmt-check lint test gen-check deny guard

_todo recipe:
    @echo "just {{ recipe }}: not implemented yet" >&2
    @exit 1
