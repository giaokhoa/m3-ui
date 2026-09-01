# Agent instructions

Repository agent skills live under `.agents/skills/`.

## Mandatory Material 3 entrypoint

Before changing any of the following areas, read `.agents/skills/material3-parity/SKILL.md` first:

- `packages/ui/src/components/**`
- `packages/ui/src/theme/**`
- `packages/ui/src/internal/elevation/**`
- `packages/ui/src/internal/ripple/**`
- `packages/tokens/**`
- repository/component documentation that changes Material 3 parity, token, theme, defaults, or runtime ownership
- work requested by issue #150

This is mandatory even when the task is described only as an audit, parity check, cleanup, optimization, refactor, or implementation of a Compose feature. The skill defines closed architecture decisions that must not be rediscovered from upstream implementation structure.

If token files, Style Dictionary, generated token output, token audits, or generated component CSS are involved, also read `.agents/skills/style-dictionary/SKILL.md`.

Read subsystem/component READMEs referenced by those skills before editing the corresponding subsystem.

## Research-to-implementation workflow

For research- or audit-driven work that leads to repository changes, use this issue/PR workflow before parallel implementation begins:

1. Finish the research/audit first. Record the relevant upstream evidence, repository findings, closed architecture decisions, scope boundaries, dependencies, and acceptance criteria.
2. Create one parent issue from that research. The parent issue is the authoritative tracker for the whole initiative and must contain the research summary, overall scope, dependency/order constraints, acceptance criteria, and the child-work inventory.
3. Split the implementation into non-overlapping subissues sized so multiple agents can work in parallel without sharing an implementation branch. Every subissue must link back to the parent and state its exact scope, dependencies, acceptance criteria/evidence requirements, and out-of-scope boundaries.
4. Give each subissue its own implementation branch/agent. If newly discovered work changes the decomposition, update the parent tracker and create or revise the relevant subissue before implementing that extra scope.
5. Every completed subissue must land through its own pull request. The PR must name the subissue and use a GitHub closing keyword such as `Closes #<subissue>` so merging the PR closes that subissue. Do not manually close a subissue before its implementation PR is merged. If a PR is superseded, move the closing reference to the replacement PR and leave the subissue open until the replacement merges.
6. Never use `Closes`, `Fixes`, `Resolves`, or an equivalent automatic-closing reference for the parent issue from an implementation PR. Child PRs close child issues only.
7. The parent issue must remain open after subissues are completed or merged. When all known subissues are done, update the parent with final evidence/status, but **do not close the parent issue unless the user or maintainer gives explicit permission to close that specific parent issue**.

Do not bypass the parent/subissue structure by implementing a multi-agent research initiative as one broad PR after the research phase.

## Scope discipline

Do not mix unrelated `packages/ui/src/layout/**` work into component/theme/token migrations. Layout parity work has its own scope unless the task explicitly requires both.

Upstream AndroidX/Figma/Material Web research is for Material facts, behavior, semantic identity, API capability, and drift. It is not permission to reopen the repository's token/theme/runtime ownership model without a concrete requirement that the documented architecture cannot satisfy.
