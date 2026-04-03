# Upstream Contribution Notes

This fork is intended to stay close to upstream `subsy/ralph-tui`.

## Rules

- Prefer small, reviewable patches over platform-style rewrites.
- Reuse existing Ralph seams before adding new subsystems.
- Keep new config surface minimal. If behavior can start as a sensible default or documentation, do that first.
- Preserve backward compatibility for existing `agent`, `tracker`, and `parallel` flows.
- Treat multi-agent coordination as opt-in. A new coordination feature should justify itself against the single-agent baseline.

## Current Patch Sequence

1. Per-task agent routing
2. Loop and plateau detection
3. Persisted artifact redaction
4. Lightweight health and doctor visibility

## Documentation Expectations

Each contribution should include:

- a short rationale in the PR description
- tests covering the new behavior
- notes on backward compatibility
- any operator-facing config examples needed to use the feature

## Non-Goals

These are intentionally out of scope unless upstream direction changes:

- tmux-first orchestration
- distributed event buses
- semantic or vector memory in core Ralph
- persistent merge queues
- heavyweight dependency-injection/container layers
