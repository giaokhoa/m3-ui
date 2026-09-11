# Component page authoring

Public component documentation is authored as `.mdx` under `apps/docs/content/docs/**`. Do not create a TSX-only public guide/reference route. Runtime helpers live in `apps/docs/src/**`, are registered through the shared MDX component map, and are invoked from MDX without direct app-module imports.

Start new or rewritten component guides from `component-page.template.mdx`.

## Required order

1. Material definition / hero.
2. Canonical live example.
3. Minimal public import and usage.
4. Material guidance: when to use and alternatives.
5. Variants.
6. Anatomy when it adds useful design information.
7. Behavior.
8. States.
9. Size, layout, orientation, or expressive behavior when applicable.
10. Accessibility and browser semantics.
11. Focused examples.
12. Generated API reference slot.
13. Material fidelity, provenance, adaptations, and known gaps.
14. Related components.

The order is stable even when an optional section is omitted. Do not move API details ahead of Material guidance.

## Required vs optional sections

Always include the hero/definition, canonical example, minimal usage, Material guidance, behavior, accessibility, API slot, fidelity section, and related components. Include Variants, Anatomy, States, Size/layout/expressive, and Focused examples only when they communicate a real part of the public component contract. A section with no useful content should be omitted rather than filled with boilerplate.

Interactive components should normally have a dedicated Accessibility section. Static visual primitives may explain their semantic boundary instead.

## Source hierarchy

Use claims in this order of authority:

1. Material Design 3 for normative design intent, guidance, anatomy, variants, and visual behavior.
2. AndroidX Compose Material3 for current API vocabulary and implementation/reference evidence.
3. Web platform and React Aria for browser semantics, keyboard/pointer/touch behavior, focus, forms, and accessibility.
4. The public `m3-ui` implementation for what users can actually import and what the package actually ships.
5. Material Web or Figma only as implementation evidence or an explicit adaptation.

Use `<SourceLinks />` near the top when authoritative source links are known. Label sources by provenance (`spec`, `compose`, `web`, `adaptation`) instead of flattening them into one parity claim.

## Runtime primitives

The component-page primitives are registered into the shared MDX runtime and must not be imported from content MDX:

- `<ComponentHero definition="..." />`
- `<SourceLinks links={[...]} />`
- `<GuidanceCallout title="..." kind="guidance|web|adaptation|caution">...</GuidanceCallout>`
- `<AnatomyBlock items={[...]} />`
- `<MaterialSpecTable family="button" groups={['size', 'shape']} />`
- `<GeneratedApiReferenceSlot component="..." />`
- `<FidelitySummary component="..." adaptations={[...]} knownGaps={[...]} />`
- `<RelatedComponents items={[...]} />`
- `<PageSectionNote>...</PageSectionNote>` for author-facing/temporary explanatory notes when needed

`<FidelitySummary />` consumes `allComponentProvenance`, which is resolved from the existing component inventory. The optional `adaptations` and `knownGaps` props add page-specific evidence without creating a second component registry; existing `MaterialParity`/`ParitySummary` MDX usage resolves to the same structured renderer.

`<GeneratedApiReferenceSlot />` is a stable document position for generated public TypeScript API data. Do not duplicate prop tables in MDX.

## Generated Material specification tables

`<MaterialSpecTable />` reads deterministic build output generated directly from the canonical DTCG graph under `packages/tokens/tokens/**`. Docs do not own a second table of Material dimensions, colors, typography, shapes, elevation, spacing, icon sizes, state values, or motion values.

Use a spec table only when concrete canonical values help the reader understand a component/foundation contract. Prefer a focused subset instead of dumping a whole family:

```mdx
<MaterialSpecTable
  family="button"
  groups={['size', 'shape', 'typography', 'icon', 'spacing']}
/>
```

Supported group labels are `size`, `shape`, `typography`, `icon`, `spacing`, `elevation`, `color`, `state`, `motion`, and `other`. The family name is resolved from the canonical token graph itself: top-level foundation families such as `shape`, `typography`, `elevation`, and `color`, plus component families under `component.*`. There is no docs-owned family-to-token-path mapping database.

The generated table keeps a token's canonical alias visible (for example `{color.role.primary}`) and also shows the resolved terminal value when the alias is exact. This preserves semantic role names instead of silently flattening them into copied literals.

Unknown families, ambiguous family names, broken/circular aliases, conflicting canonical definitions, and requested groups that do not exist in a family fail generation/runtime loudly. Fix the canonical token graph or the MDX request; do not add a local docs override.

Do not hand-copy values from the table into prose. Token changes must propagate through `pnpm --filter @m3-ui/docs spec:generate` and the normal docs `dev`, `build`, `test`, and `typecheck` commands.

## Examples and generated widgets

Use only public `@m3-ui/ui` exports in user-facing examples. Keep examples curated; Storybook owns exhaustive state/variant matrices.

Generated API/spec/fidelity widgets belong inside MDX. They never replace the surrounding page document. `meta.json` is navigation/order metadata only and must not contain guide prose.

## Node/static-search safety

Content MDX must remain evaluable by the Fumadocs Node/static-search path. Do not import `apps/docs/src/**/*.tsx` from MDX. Add reusable runtime UI to the shared MDX component registry instead, then invoke it by component name in the MDX document.

Do not put the authoring template under `content/docs`; it is intentionally stored in `apps/docs/authoring` so it cannot become a public route accidentally.
