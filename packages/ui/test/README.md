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

## CI

Parity tests are part of the normal package test command and therefore must pass before typecheck/build completes in CI.
