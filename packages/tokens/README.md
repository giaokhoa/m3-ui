# @m3-ui/tokens

`@m3-ui/tokens` contains the canonical Material 3 design-token graph, the Style Dictionary build, generated package artifacts, validation and read-only upstream audits.

This README documents how the token package is structured and executed. Agent token/compiler rules live in `.agents/skills/material3-parity/SKILL.md` and `.agents/skills/style-dictionary/SKILL.md`.

## Source layout

Canonical tokens live under `tokens/` and use DTCG `$type` / `$value` syntax.

```text
tokens/
├── core/
│   ├── color.json
│   ├── state.json
│   ├── elevation.json
│   ├── shape.json
│   ├── typography.json
│   ├── motion.json
│   ├── ripple.json
│   └── ...
├── theme/
│   └── baseline.json
└── component/
    ├── button/
    ├── card.json
    ├── checkbox.json
    ├── chip/
    ├── text-field/
    ├── radio-button.json
    ├── switch.json
    └── ...
```

Style Dictionary deep-merges the canonical files into one graph. Duplicate paths, broken references and invalid source structure are checked by the package validation/tests.

AndroidX Compose, the Material 3 Figma kit, Material Web and other Material implementations are audit references. Audit scripts normalize those sources and compare them with canonical DTCG; they are not part of the Style Dictionary source graph.

## Build flow

```text
canonical DTCG
      │
      ▼
Style Dictionary 5.5.2
      │
      ├── dist/generated/tokens.js
      ├── dist/generated/tokens.d.ts
      └── reviewed CSS adapters
```

The package root exports the generated JS/TypeScript vocabulary:

```ts
import * as token from '@m3-ui/tokens';
```

Current reviewed CSS adapter exports include:

```text
@m3-ui/tokens/theme.css
@m3-ui/tokens/button.css
@m3-ui/tokens/card.css
@m3-ui/tokens/checkbox.css
@m3-ui/tokens/chip.css
@m3-ui/tokens/text-field.css
@m3-ui/tokens/elevation.css
@m3-ui/tokens/ripple.css
```

Generated files are centralized under `dist/generated/`. `packages/ui` consumes them directly or inlines them into self-contained public style entries during its style build.

## Theme foundation output

Immutable Material baseline light/dark role values live in `tokens/theme/baseline.json`. The normal generated JS vocabulary exposes those values for JavaScript consumers such as the public `ColorScheme` view, while `dist/generated/theme.css` serializes the static browser foundation.

The generated theme adapter owns:

- baseline light and dark system-role CSS variables;
- the matching `color-scheme` declaration;
- default Material plain/brand font-family variables and the default plain font family.

`ThemeProvider` marks its normal and portal scopes with `data-m3-theme` / `data-theme`. When no `sourceColor` exists, those scopes receive baseline values from generated CSS. When `sourceColor` exists, the provider emits runtime role variables inline, which override the generated baseline through normal CSS precedence.

The UI modular-style build prepends this generated theme foundation to every self-contained `@m3-ui/ui/styles/*.css` component entry.

## Runtime color flow

Material component color tokens reference semantic color-role tokens. Core color roles terminate in scoped runtime CSS variables supplied by the active theme scope.

Example canonical role endpoint:

```json
{
  "color": {
    "role": {
      "primary": {
        "$type": "string",
        "$value": "var(--primary)"
      }
    }
  }
}
```

Example component alias:

```json
{
  "containerColor": {
    "$type": "string",
    "$value": "{color.role.primary}"
  }
}
```

The resulting runtime chain is:

```text
component token
    -> color.role.primary
    -> var(--primary)
    -> active theme scope concrete value
```

This lets `sourceColor`, mode and contrast change concrete system colors at runtime without rebuilding component token mappings.

## Component CSS adapters

Generated CSS adapters serialize static token-to-browser bindings for concrete consumers. Handwritten UI CSS remains responsible for component structure/layout and consumes the generated private variables/selectors.

Reference slices currently in the repository:

- Theme: generated baseline system roles and typeface foundation, with dynamic color overrides in `ThemeProvider`.
- Button: generated size/variant/typography/color geometry plus runtime interaction/elevation logic in UI code.
- Card: generated static shape/minimum-size/variant paint/disabled composite/outlined-border bindings plus runtime interaction/elevation and instance shape overrides.
- Checkbox: generated dimensions/colors/disabled blends/motion with JS limited to ripple and SVG mark geometry.
- Chip: generated static color/state mappings with runtime interaction and slot-dependent behavior in UI code.
- TextField: generated shared + filled/outlined static default matrix.
- Elevation: generated immutable shadow recipes selected by semantic runtime elevation level.
- Ripple: generated immutable state-layer/motion/focus styling with runtime wave geometry/lifecycle.

Issue #150 tracks expansion of this generated-adapter pattern across the remaining component surfaces.

## Upstream audit structure

Audit and reference tooling lives under `scripts/`. The package maintains pinned/material-specific inventories, semantic mappings, drift evidence and coverage checks independently from the canonical build input.

The high-level flow is:

```text
AndroidX / Figma / Material Web / other evidence
                    │
                    ▼
            normalize in memory
                    │
                    ▼
             semantic comparison
                    │
                    ▼
              canonical DTCG
```

Cross-source disagreements are retained as explicit audit/drift evidence rather than hidden by the build.

## Commands

Build and validate:

```bash
pnpm --filter @m3-ui/tokens validate
pnpm --filter @m3-ui/tokens build
pnpm --filter @m3-ui/tokens test
```

Common audits:

```bash
pnpm --filter @m3-ui/tokens audit:androidx
pnpm --filter @m3-ui/tokens coverage:compose:complete
pnpm --filter @m3-ui/tokens coverage:material-web:complete
pnpm --filter @m3-ui/tokens coverage:union:complete
```

Additional focused audit commands are defined in `packages/tokens/package.json` and under `scripts/`.

## Material upstream freshness lifecycle

Freshness is a separate read-only signal from pinned conformance. Normal PR/main CI continues to validate the exact reviewed revisions in `scripts/sources.mjs`; it never turns floating AndroidX or Material Web HEAD into the conformance oracle.

Run the focused probe locally with:

```bash
pnpm --filter @m3-ui/tokens freshness:upstream
```

The command emits the machine-readable report from the freshness foundation and never rewrites source pins, canonical DTCG, generated CSS, audit snapshots, public APIs or GitHub issues. In GitHub Actions it also writes the same result as a concise Markdown table to `GITHUB_STEP_SUMMARY`, including each monitored scope, reviewed pin/timestamp, latest relevant revision/timestamp and status.

The workflow-facing outcomes are intentionally distinct:

- `current` — exit `0`; every monitored Git-backed scope is at or behind the reviewed pin for that relevant path.
- `newer-upstream` — exit `1`; at least one monitored relevant path has a newer upstream commit and requires semantic triage.
- `unavailable` — exit `2`; network, GitHub API, rate-limit, malformed-response or ancestry tooling prevented a reliable freshness decision. This is not semantic drift.
- `invalid-configuration` — exit `3`; checked-in freshness metadata is invalid and must be repaired before the signal can be trusted.

`.github/workflows/material-freshness.yml` runs this probe weekly and supports manual `workflow_dispatch`. It has read-only repository permissions and deliberately does not install the workspace, run Storybook, docs Chromium, the full build, conformance suites or issue mutation merely to detect upstream movement.

### Reviewed re-pin procedure

When the probe reports `newer-upstream`, treat the report as an audit target, not permission to upgrade automatically:

1. Capture the report's reviewed and latest relevant revisions/timestamps for every affected scope.
2. Inspect only the changed Material source surfaces inside those monitored paths; do not treat unrelated repository-wide AndroidX activity as Material drift.
3. Map affected source families through the completed #296 conformance ownership/report model, starting from `apps/docs/scripts/material-conformance-registry.mjs` and its derived public-symbol report rather than reopening every component lane.
4. Classify each relevant delta as **no observable m3-ui impact**, **already equivalent on web**, **documented adaptation remains valid**, **audit/provenance metadata only**, **test expectation change**, or **production/public-contract change**.
5. Change reviewed revision metadata only after that semantic triage is complete. A newer commit by itself is not sufficient evidence for a pin bump.
6. Update snapshots, drift records, provenance, canonical tokens and generated output only where their semantics genuinely depend on the accepted delta. **Never auto-copy upstream values into canonical DTCG.** AndroidX, Material Web, Figma and other implementations remain read-only evidence, never build inputs.
7. Run focused source/coverage/audit tests first. If implementation, canonical tokens, generated styling or a public contract changes, then require the complete normal CI matrix, including typecheck, build, docs browser and all visual shards.
8. Record exact before/after revisions, changed source surfaces, every disposition and the relevant CI run in a new immutable review file, then register that file in `audit/material-upstream-repin-reviews.json`. Never rewrite an older review to look like the newest pin; the index identifies the latest generation while preserving the full revision chain. Child implementation PRs close only their child issue; parent lifecycle rules from `AGENTS.md` still apply.

A detected upstream delta is therefore actionable and visible, but it does not mutate or weaken the repository's reproducible Material contract.

### Non-Git and corroborating evidence freshness

Not every source can honestly use commit-based freshness semantics. `scripts/sources.mjs` therefore remains explicit about the evidence metadata the repository actually knows:

- **Material Design normative pages:** `retrievedAt` records the last intentional retrieval/review, not a machine-verifiable publication timestamp. Re-review the captured normative pages at least every 90 days and earlier when public Material guidance changes materially or an affected semantic area is under audit. Update `retrievedAt` only after that review.
- **Figma Material 3 Design Kit:** track the explicit kit `version` and `releasedAt` already recorded in the source registry. Re-review when maintainers intentionally confirm a newer kit version is available, and during the same periodic Material evidence review. Do not claim an unavailable Figma API gives authoritative latest-version freshness.
- **Material Components Android and Flutter:** these are corroborating implementation references, not active scheduled monitors in the current freshness contract because they have no `freshness` scopes. Refresh them on demand when the semantic area they corroborate is being audited or when other reviewed evidence exposes a discrepancy worth cross-checking.

If policy later promotes another Git-backed source to active monitoring, add an explicit path/module-aware `freshness` scope and deterministic tests first; do not infer active monitoring from the mere presence of a repository URL.

## Related implementation docs

- Theme runtime: `packages/ui/src/theme/README.md`
- Elevation renderer: `packages/ui/src/internal/elevation/README.md`
- Ripple/state layer: `packages/ui/src/internal/ripple/README.md`
- Layout tokens and adaptive implementation: `packages/ui/src/layout/README.md`

For agents, start from root `AGENTS.md` rather than treating this README as the implementation-policy contract.
