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

## Scope discipline

Do not mix unrelated `packages/ui/src/layout/**` work into component/theme/token migrations. Layout parity work has its own scope unless the task explicitly requires both.

Upstream AndroidX/Figma/Material Web research is for Material facts, behavior, semantic identity, API capability, and drift. It is not permission to reopen the repository's token/theme/runtime ownership model without a concrete requirement that the documented architecture cannot satisfy.
