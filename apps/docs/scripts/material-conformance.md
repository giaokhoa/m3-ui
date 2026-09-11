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
