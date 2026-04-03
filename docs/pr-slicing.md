# PR Slicing Guide

The easiest way to upstream this work is as a short sequence of independent pull requests.

## Recommended Order

### PR 1: Task Routing

- add `taskRouting` config schema
- add a lean `TaskRouter`
- select the agent per task inside the engine
- document rule matching and fallback behavior

### PR 2: Loop Guard

- detect repeated non-progressing outputs
- escalate or stop without changing tracker semantics
- keep the implementation local to the engine

### PR 3: Artifact Safety

- redact persisted remote and audit surfaces
- avoid rewriting live execution output used for debugging

### PR 4: Health Visibility

- add lightweight readiness and degraded-state reporting
- keep this as reporting, not a new control subsystem

## Review Standard

Each PR should be:

- understandable without reading the whole roadmap
- testable in isolation
- reversible without collateral refactors
- small enough for upstream maintainers to review in one sitting
