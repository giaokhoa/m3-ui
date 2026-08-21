# Generated Material tokens

Files in this directory will be generated from pinned AndroidX Material3 token sources.

## Rules

1. **Do not edit generated token files by hand.** Change the generator or upstream revision instead.
2. Generated output must be deterministic for the same source revision.
3. Generated output must contain data only.
4. Every generated file must be traceable to an upstream source file and commit SHA.
5. Generated code must still be idiomatic TypeScript; generation is not permission to emit Kotlin-shaped APIs.

## Expected output style

Use plain objects, literal keys, numbers, and strings:

```ts
export const filledButtonTokens = {
  containerColor: 'primary',
  containerElevation: 0,
  disabledContainerColor: 'onSurface',
  disabledContainerOpacity: 0.1,
  hoveredContainerElevation: 1,
  labelTextColor: 'onPrimary',
} as const satisfies ButtonTokenSet;
```

Avoid output such as:

```ts
class FilledButtonTokens {
  static readonly ContainerColor = ColorSchemeKeyTokens.Primary;
}
```

The latter preserves Kotlin syntax rather than Material semantics and makes the TypeScript API unnecessarily foreign.

## Conversion examples

| AndroidX token representation | Generated TypeScript |
| --- | --- |
| `ColorSchemeKeyTokens.Primary` | `'primary'` |
| `ElevationTokens.Level1` | `1` or a typed elevation key |
| `ShapeKeyTokens.CornerFull` | `'full'` or a typed shape key |
| `TypographyKeyTokens.LabelLarge` | `'labelLarge'` |
| `18.0.dp` | `18` |
| opacity float | number in the same numeric range |

The exact representation should be centralized in the generator so all components use the same conversion rules.

## Validation

Generated output will be covered by parity tests that compare it to fixtures/source metadata from the pinned AndroidX revision. A generator change that causes broad token drift must be reviewed as an upstream compatibility change, not accepted as incidental formatting noise.
