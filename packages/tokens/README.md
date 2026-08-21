# @m3/tokens

Typed Material 3 token data shared by `@m3/ui` and future packages.

This package owns immutable specification/reference values. Runtime theme state does **not** belong here, and immutable token constants do **not** belong in `ThemeProvider`.

## Dependency boundary

```text
AndroidX / Material Web sources
            ↓
       @m3/tokens
            ↓
          @m3/ui
            ↓
 ThemeProvider + components
```

`@m3/tokens` must not depend on React, React Aria, DOM APIs, or `@m3/ui`.

`ThemeProvider` owns runtime theme decisions such as light/dark color schemes and emits theme-dependent CSS variables such as `--primary`, `--on-surface`, and `--shadow`.

Components import immutable values such as elevation geometry, state-layer opacity, motion duration, and ripple timing from `@m3/tokens`. Theme-dependent colors are read from CSS variables.

## Current exports

- `@m3/tokens/elevation`: Material elevation levels and web shadow geometry.
- `@m3/tokens/state`: Material state-layer opacity values.
- `@m3/tokens/motion`: Material motion durations/easing.
- `@m3/tokens/ripple`: web ripple timing constants.

## Sources

The elevation level values follow AndroidX Material3 `ElevationTokens` (`0`, `1`, `3`, `6`, `8`, `12` dp).

State-layer opacity follows AndroidX Material3 `StateTokens` v0_210 (`hover 0.08`, `focus 0.10`, `pressed 0.10`, `dragged 0.16`).

Elevation shadow geometry follows Material's web elevation representation using three shadow layers (umbra, penumbra, ambient). Shadow color itself is intentionally not stored here; `@m3/ui` resolves it from the theme's `--shadow` CSS variable.

Ripple timing is a web adaptation and is kept separate from AndroidX token generation so platform-specific behavior is explicit rather than disguised as generated Compose data.

## Style rules

Prefer plain immutable data and literal unions:

```ts
export const stateLayerOpacity = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
} as const;
```

Do not reproduce Kotlin objects, `Dp`, `Color`, companion objects, or `.copy()` APIs.
