import type { ElevationLevel } from './elevation.js';

export type CardVariant = 'filled' | 'elevated' | 'outlined';

export type CardColorRole =
  | 'onSurface'
  | 'outline'
  | 'outlineVariant'
  | 'surface'
  | 'surfaceContainerHighest'
  | 'surfaceContainerLow'
  | 'surfaceVariant';

export interface CardElevationTokens {
  readonly default: ElevationLevel;
  readonly pressed: ElevationLevel;
  readonly focused: ElevationLevel;
  readonly hovered: ElevationLevel;
  readonly dragged: ElevationLevel;
  readonly disabled: ElevationLevel;
}

/**
 * Material 3 Card values resolved from AndroidX revision
 * 160825094a81825468a95b115bfb1b541e549856 using Card.kt,
 * FilledCardTokens.kt, ElevatedCardTokens.kt and OutlinedCardTokens.kt.
 *
 * Generated interaction outline colors are intentionally not promoted into
 * runtime behavior: CardDefaults.outlinedCardBorder() resolves only enabled vs
 * disabled at the pinned revision.
 */
export const cardTokens = {
  shapeRadius: 12,
  minimumInteractiveSize: 48,
  disabledContentOpacity: 0.38,

  filled: {
    containerColor: 'surfaceContainerHighest',
    contentColor: 'onSurface',
    disabledContainerColor: 'surfaceVariant',
    disabledContainerOpacity: 0.38,
    disabledCompositeOver: 'surfaceContainerHighest',
    elevation: {
      default: 'level0',
      pressed: 'level0',
      focused: 'level0',
      hovered: 'level1',
      dragged: 'level3',
      disabled: 'level0',
    } satisfies CardElevationTokens,
  },

  elevated: {
    containerColor: 'surfaceContainerLow',
    contentColor: 'onSurface',
    disabledContainerColor: 'surface',
    disabledContainerOpacity: 0.38,
    disabledCompositeOver: 'surface',
    elevation: {
      default: 'level1',
      pressed: 'level1',
      focused: 'level1',
      hovered: 'level2',
      dragged: 'level4',
      disabled: 'level1',
    } satisfies CardElevationTokens,
  },

  outlined: {
    containerColor: 'surface',
    contentColor: 'onSurface',
    disabledContainerColor: 'surface',
    disabledContainerOpacity: 1,
    disabledCompositeOver: 'surface',
    outline: {
      width: 1,
      color: 'outlineVariant',
      disabledColor: 'outline',
      disabledOpacity: 0.12,
      // CardDefaults.outlinedCardBorder() composites the disabled outline over
      // ElevatedCardTokens.ContainerColor at the pinned AndroidX revision.
      disabledCompositeOver: 'surfaceContainerLow',
    },
    elevation: {
      default: 'level0',
      pressed: 'level0',
      focused: 'level0',
      hovered: 'level0',
      dragged: 'level3',
      disabled: 'level0',
    } satisfies CardElevationTokens,
  },
} as const satisfies Record<string, unknown>;

export type CardTokens = typeof cardTokens;
