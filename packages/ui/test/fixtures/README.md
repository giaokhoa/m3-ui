# Parity fixtures

This directory stores explicit reference data used by parity tests. Fixtures must remain independent from the production implementation being tested.

## Rules

- Record the exact source/revision for upstream-derived expected data.
- Prefer structured expected values over screenshots when exact values can be compared directly.
- Never create expected fixtures by importing the production resolver under test.
- Never add a repository-wide upstream sync generator to populate fixtures.
- AndroidX/Figma tooling may fetch and normalize pinned upstream data **in memory for audits**; it must not write canonical token files or runtime token snapshots.
- Update fixtures only when intentionally adopting an upstream revision or correcting a documented mistake.
- Keep fixture diffs explicit, deterministic, and reviewable.

If a future parity test needs a large upstream dataset, prefer a narrow read-only audit adapter or a deliberately reviewed static fixture. Do not recreate `scripts/compose-sync`, `packages/tokens/src/generated/androidx`, or an equivalent generated-runtime path.
