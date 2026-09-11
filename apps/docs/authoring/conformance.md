# Documentation conformance checks

Run the deterministic documentation contract locally with:

```sh
pnpm --filter @m3-ui/docs docs:lint
```

The same check is part of `@m3-ui/docs` tests, so the existing repository `verify` job and required aggregate CI gate fail on conformance violations.

## Enforced contract

The lint keeps public docs aligned with the Material-first documentation contract:

- `apps/docs/content/docs/**` contains only public `.mdx` pages and navigation-only `meta.json` files.
- Documented component IDs in `allComponentDocs` bind to exactly one component MDX guide through the shared fidelity/provenance primitives.
- Component guides include an Accessibility section unless they carry a tracked exemption.
- Material-backed metadata uses syntactically valid authoritative `https://m3.material.io` links; Compose/reference-only families do not invent Material URLs.
- `<ApiReference name="..." />` names must resolve to the public `@m3-ui/ui` TypeScript entrypoint.
- Component metadata that declares a web adaptation remains surfaced through `MaterialParity`, `FidelitySummary`, or `ParitySummary` in the MDX guide.
- Once a page uses `<MaterialSpecTable />`, canonical-looking spec values must not be duplicated by hand in neighboring spec/token tables.
- Content MDX may not import app TS/TSX runtime modules directly. Reusable runtime UI belongs in the shared `MDXComponents` registry.

Core checks are filesystem/TypeScript based and do not require network availability or visual snapshots.

## Tracked exemptions

Prefer fixing the documentation contract. When an existing exception cannot be removed in the same change, add the narrowest possible entry to `scripts/docs-conformance.allowlist.json` with the exact rule, file, optional subject, a tracked GitHub issue such as `#233`, and a short reason.

Accessibility and Material-source exemptions can also be documented inline when the exception is page-specific:

```md
<!-- docs-conformance: accessibility-exempt issue=#233 reason="Tracked component guide rewrite" -->
<!-- docs-conformance: material-link-exempt issue=#241 reason="Compose-only family; source audit pending" -->
```

Do not use an exemption without a follow-up issue. The lint rejects allowlist entries that omit a tracked issue number.
