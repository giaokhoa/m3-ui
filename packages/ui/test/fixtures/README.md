# Parity fixtures

This directory stores explicit reference data used by parity tests.

Fixtures must be independent from the implementation under test. They may be derived from pinned AndroidX generated tokens, upstream expected values, Material baseline data, or other explicitly documented source-of-truth files.

## Rules

- include source metadata with each fixture;
- prefer structured data over screenshots when exact values can be compared directly;
- do not generate an expected fixture by importing the production resolver being tested;
- update fixtures only when intentionally adopting an upstream source revision or correcting a documented mistake;
- keep fixture diffs reviewable and deterministic.

Large/generated fixture sets should be produced by the future `scripts/compose-sync` tooling rather than manually maintained.
