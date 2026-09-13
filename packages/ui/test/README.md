# Test architecture

This directory is for cross-cutting parity fixtures and tests that do not naturally belong beside one implementation file.

Most small unit tests may remain colocated with source. This directory exists for upstream parity work that spans multiple files/components or needs independently maintained fixtures.

```text
test/
├── compose-parity/
└── fixtures/
```

## Test levels

Material component ports should be validated at four levels:

1. generated token parity;
2. defaults/state-resolution parity;
3. behavior/accessibility parity;
4. visual/layout parity.

Expected values must not be generated from the code under test. Use pinned upstream data, explicit fixtures, or independently verified baseline values.

## React Aria interaction testing

RAC-backed interaction behavior is currently exercised primarily in the Storybook Playwright browser suites using accessible roles/names and user-level keyboard, pointer, touch, selection, dismissal, and focus assertions.

The `@react-aria/test-utils` RC pilot is recorded in [react-aria-test-utils-pilot.md](./react-aria-test-utils-pilot.md). The package is intentionally not a direct dev dependency yet because the evaluated migrated patterns already have broader browser coverage and the current RC would require a second DOM-test harness without removing existing coverage.

## CI

Parity tests are part of the normal package test command and therefore must pass before typecheck/build completes in CI.
