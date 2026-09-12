# Material conformance inventory

Phase 2 of the Material 3 conformance program is tracked by [#296](https://github.com/giaokhoa/m3-ui/issues/296). This inventory is the machine-readable coverage gate for that program; it is not a claim that every current family is already fully conformant.

## Commands

From the workspace root:

```bash
pnpm --filter @m3-ui/docs conformance:lint
pnpm --filter @m3-ui/docs conformance:json
```

`conformance:lint` is part of the normal docs test pipeline, so the existing protected CI aggregate remains the merge gate. `conformance:json` emits the expanded inventory for inspection or tooling.

## Ownership model

`scripts/api-reference.mjs` remains the public-export oracle. The conformance audit builds TypeScript API models for both:

- `packages/ui/src/index.ts` (`@m3-ui/ui`), and
- `packages/ui/src/layout/index.ts` (`@m3-ui/ui/layout`).

`scripts/material-conformance-registry.mjs` does **not** copy the public symbol list. It classifies source-module prefixes into Material component families, adaptive-layout families, or explicit non-component infrastructure. `scripts/material-conformance.mjs` expands those source owners to the actual public symbols reported by the TypeScript checker.

This means:

- adding another export inside an already classified family is inventoried automatically;
- adding a new public source family without registry ownership fails CI;
- a public `./layout` export must also be present in the root entrypoint and owned by a layout family;
- source prefixes may not ambiguously own the same public symbol;
- every registered family must own at least one real public export.

Existing component provenance is referenced through the merged component-doc registries (`componentDocs`, `smallPrimitiveDocs`, `appBarToolbarDocs`, and `actionOverflowDocs`). Navigation families reference their audited component docs directly. Adaptive/layout families reference the layout subsystem README and its pinned Material/Compose ownership model. Do not create a second handwritten public API catalog to satisfy this gate.

## Conformance dimensions

Every component or layout family must classify all of these dimensions:

1. `api`
2. `materialStatesVariants`
3. `tokensVisuals`
4. `behavior`
5. `accessibility`
6. `rtlLocalization`
7. `motion`
8. `theme`
9. `browser`
10. `ssr`

A dimension is one of:

- `required`: needs automated evidence paths, or a positive `gapIssue` while the work is still tracked;
- `adapted`: needs a documented web-adaptation reason **and** evidence paths;
- `not-applicable`: needs a documented reason.

Evidence paths are repository-relative and must exist. Deleting or moving an evidence file without updating the registry fails the gate.

## Program completion invariant

Tracked `gapIssue` values remain a valid **in-progress audit mechanism** while a focused child issue is actively establishing conformance for a family. They let the registry represent known unfinished work without pretending historical coverage already proves the contract.

Once the repository-wide program has completed its family lanes, the merged final registry is expected to remain **gap-free**. `material-conformance-completion.test.mjs` builds the real final report from the TypeScript public entrypoints and fails required CI if any current family dimension reintroduces `gapIssue`, loses required/adapted evidence, loses an N/A/adaptation reason, or stops owning actual public symbols.

This completion test deliberately does not hard-code a second family catalog. New public source families still have to pass the ordinary ownership/provenance validator, and after program completion they must land with explicit conformance evidence/classification rather than relying on a residual tracker gap.

## Closing gaps in family lanes

The Phase 2A registry intentionally starts conservatively: unresolved required dimensions point at parent tracker #296 rather than treating historical tests as proof of conformance.

A focused family lane should replace tracked gaps only after it has audited the relevant Material/Compose/web contract. For example:

```js
api: {
  status: 'required',
  evidence: [
    'packages/ui/src/components/Button/Button.test.tsx',
    'apps/docs/content/docs/components/button.mdx',
  ],
},

browser: {
  status: 'adapted',
  reason: 'React Aria owns browser button semantics while Material owns visual/state presentation.',
  evidence: ['apps/storybook/docs-browser/button-conformance.spec.ts'],
},

rtlLocalization: {
  status: 'not-applicable',
  reason: 'This primitive has no directional geometry or localized value rendering.',
},
```

Do not mark a dimension `not-applicable` merely because a test has not been written. Do not mark it `adapted` merely because the web runtime differs from Compose. Both statuses require a contract-level rationale, and adapted behavior still requires evidence.

Canonical Material facts remain owned by the existing DTCG/Style Dictionary pipeline, `ThemeProvider` remains the runtime owner for system-resolved theme colors, and React Aria/native semantics remain the browser interaction source of truth. The conformance inventory audits those boundaries; it does not move them.

## Reviewed upstream capability coverage

Schema v2 extends the same family registry with optional `capabilities` records for families that have completed a reviewed upstream capability audit. This is intentionally **not** a second component catalog: source-prefix ownership still derives the actual public symbols, while capability records name behavior-level Material surface areas that the audit says must be represented or explicitly adapted/excluded.

Capability statuses are:

- `supported`: requires at least one mapped public `m3-ui` symbol plus concrete evidence;
- `adapted`: requires a concrete browser/web reason and evidence, and may also map to public symbols;
- `excluded`: requires a concrete reason and evidence showing why the reviewed upstream mechanism is not a public web requirement;
- `gap`: requires a concrete reason, evidence, and a positive tracking issue.

Mapped symbol names are resolved against the **actual public symbols owned by that family**. The validator therefore catches the blind spot where `TimeScroll`, `MenuSubmenu`, a contained SearchBar variant, or another reviewed public capability disappears while all remaining exports continue to pass their own tests.

The semantic capability inventory is deliberately behavior-level. It does not freeze AndroidX implementation hashes, Kotlin source layout, source regexes, or exact export counts as parity truth. When upstream implementation structure changes without changing observable Material capability, no registry change is required.

The #386 audit currently records reviewed capability groups for Menu, ListItem, Tooltip, SearchBar, and TimePicker. `material-capability-coverage.test.mjs` locks those audited semantic groups, while `material-conformance-completion.test.mjs` resolves their public mappings through the same TypeScript API model used by the rest of conformance.

## Final 1.5.x release-note sweep dispositions

The same registry records the final dispositions for the release-note surfaces examined by #386. These findings are emitted in `conformance:json` and shown in the parity catalog so they do not disappear into prose-only audit notes.

| Reviewed surface | Disposition | Web contract |
| --- | --- | --- |
| BottomAppBar custom/vibrant container color | adapted | Existing color/style composition already expresses the sample customization. |
| VerticalSlider | supported | Public Slider/RangeSlider orientation already covers the observable capability. |
| PullToRefresh indicator maximum distance | adapted | Existing threshold/indicator-distance behavior covers the reviewed default without duplicating a Kotlin constant. |
| TopAppBar content padding customization | adapted | Web composition/style overrides express this without another Kotlin-shaped parameter. |
| Chip content padding/spacing customization | adapted | Existing slots/style composition preserve customization while canonical defaults remain token-owned. |
| SecureTextField obfuscation plumbing | adapted | Native password-input semantics remain the intentional browser mapping. |
| Compose saveable-state holder plumbing | excluded | Runtime implementation plumbing, not a browser public-contract requirement; layout lifecycle adaptation is documented separately. |
| Compose MutableInteractionSource plumbing | excluded | React Aria normalized interaction state is the browser source of truth. |
| Compose scroll-state/nested-scroll holder plumbing | excluded | Search/app-bar overlap is explicit application-owned state rather than hidden global scroll ownership. |
