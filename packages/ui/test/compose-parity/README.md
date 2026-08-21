# Compose parity tests

This directory is reserved for tests that explicitly compare `m3-ui` behavior/data to pinned Jetpack Compose Material3 sources.

Each parity suite should record:

- AndroidX commit SHA;
- upstream source path(s);
- upstream test path(s) when applicable;
- Material component variant/state matrix;
- intentional web-only differences.

## What belongs here

Examples:

- generated component token parity across many token files;
- shared default-resolution tables for component families;
- cross-platform state matrices;
- tests that assert a web component follows a specific upstream Material contract.

A normal isolated utility unit test should stay beside the utility instead.

## Web translation rule

Do not assert Compose implementation details that have no web meaning. Assert the user-facing contract.

For example, do not test that the web uses an equivalent of `MutableInteractionSource`; test that hover, press, focus-visible, disabled, selected, or error states resolve to the expected Material output and correct accessibility semantics.
