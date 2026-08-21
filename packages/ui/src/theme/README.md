# Theme color contract

`@m3/ui` exposes Material 3 color roles as short, scoped CSS custom properties.

Examples:

- `primary` -> `--primary`
- `onPrimary` -> `--on-primary`
- `surfaceContainerHigh` -> `--surface-container-high`

There is intentionally no `--md-sys-` prefix.

`ThemeProvider` uses the official static Material 3 baseline when no `sourceColor` is provided. When `sourceColor` is provided, it uses Material Color Utilities `SchemeTonalSpot` to generate a dynamic scheme.

The static baseline is kept separate from dynamic generation because MCU output for a baseline-looking seed is not guaranteed to be byte-for-byte identical to the generated Material Web / Jetpack Compose baseline token sets.
