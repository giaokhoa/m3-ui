# Compose sync tooling

This directory is the deterministic bridge from a pinned AndroidX Material3 token directory to reviewable TypeScript data in `@m3/tokens`.

It deliberately does **not** translate Kotlin component implementations. React/DOM behavior remains handwritten and is audited against pinned AndroidX component/default/test sources.

## Source lock and discovery

`manifest.mjs` pins only the immutable AndroidX repository revision and Material3 token directory. It does **not** maintain a handwritten component-token allowlist.

On every sync the runner asks GitHub for the directory at that exact commit, discovers every direct `*Tokens.kt` file, sorts them deterministically, derives output/export identities from filenames, then verifies each downloaded raw file against the Git blob SHA returned by GitHub for the pinned commit.

At the current pinned revision this discovers **120 token modules**, including foundations, already-ported components and not-yet-ported families such as AppBar, FAB, IconButton, Navigation, Dialog and Slider. Future component work therefore does not add token source mappings by hand.

## Commands

```sh
pnpm compose:sync
pnpm compose:sync:check
pnpm test:compose-sync
```

`compose:sync` is a whole-directory transaction:

1. discover every `*Tokens.kt` at the exact pinned revision;
2. fetch every discovered source and verify its Git blob SHA;
3. parse/render the complete directory in memory;
4. validate cross-token reference closure;
5. only after every source succeeds, replace the generated snapshot.

A parser failure cannot leave a half-regenerated token tree. Snapshot replacement is staged in a temporary sibling directory with recovery of the previous directory on write failure.

`compose:sync:check` runs the same discovery/fetch/verify/parse/render pipeline but compares the committed directory byte-for-byte, including extra or missing modules. CI runs it before the normal unit/type/build/browser gates.

`test:compose-sync` is the offline layer for parser grammar, discovery/identity rules and committed snapshot invariants.

## Generated boundary

Generated files live under:

```text
packages/tokens/src/generated/androidx/
```

There is one generated module for every discovered upstream `*Tokens.kt`, plus a generated barrel. Every module records repository, revision, upstream path, exact blob SHA, VERSION when present, declaration kind (`object`/`class`), token container name and normalized immutable token data.

Production-facing files such as `button.ts`, `state.ts`, `elevation.ts`, `switch.ts`, `card.ts` and `chip.ts` remain stable facades. A facade must project generated data for values that Compose runtime obtains from generated tokens. Values that actually come from component/default runtime code or web adaptation remain handwritten with their upstream source and parity tests. Generated tokens that Compose does not consume must not be promoted into web behavior merely because they exist.

## Supported generated grammar

The parser intentionally covers the generated-token grammar rather than general Kotlin. The pinned 120-file directory currently validates these forms:

- `const val`, inline getter vals, plain vals and generated class properties;
- numeric/opacity constants, `dp` and `sp`;
- color, elevation, shape, typography and cross-token references;
- font-family/font-weight terminals and plain symbols;
- positional/named constructor or call expressions, including multiline shapes and cubic-bezier tokens;
- Kotlin Elvis fallback used by generated typography;
- sources with or without a VERSION marker.

Unsupported syntax is fatal. The generator must never silently drop a declaration, guess a value or fall back to `any`.

## Test and drift guarantees

The contract has three independent gates:

1. **Offline parser tests** cover every supported expression/declaration family plus failure behavior.
2. **Offline discovery/snapshot tests** cover directory filtering, deterministic identities, provenance, barrel/module parity and required foundation/unported families.
3. **CI full sync integration** discovers all 120 sources from the pinned directory, verifies every raw blob SHA, parses the entire directory in one batch, validates dependency closure and byte-compares the complete generated snapshot.

TypeScript build/typecheck then compiles the generated snapshot as part of `@m3/tokens`; component/default/Chromium tests cover runtime parity in facade/UI layers.

## Web/runtime adaptations stay handwritten

These are intentionally not disguised as generated Compose data:

- Compose spring sampling to CSS `linear()` timing functions;
- CSS shadow geometry for Material elevation;
- browser forced-colors behavior;
- DOM/RAC semantics;
- ripple implementation;
- runtime state/default resolution implemented in AndroidX component code rather than generated token files.

## Updating AndroidX

An upstream bump is explicit and reviewed:

1. change the pinned revision;
2. run `pnpm compose:sync` once — newly added/removed token files are discovered automatically;
3. if AndroidX introduces a new generated syntax, add a focused parser test and support it without fallback parsing;
4. review the complete generated diff;
5. run sync check, unit tests, typecheck, build and browser parity gates;
6. separately audit runtime/default behavior for affected public facades.

Never point normal builds or CI at a moving AndroidX branch.
