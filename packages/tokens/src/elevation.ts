import { elevationTokensGenerated } from './generated/androidx/elevation.js';

export const elevationLevels = {
  level0: elevationTokensGenerated.level0,
  level1: elevationTokensGenerated.level1,
  level2: elevationTokensGenerated.level2,
  level3: elevationTokensGenerated.level3,
  level4: elevationTokensGenerated.level4,
  level5: elevationTokensGenerated.level5,
} as const;

export type ElevationLevel = keyof typeof elevationLevels;

export interface ElevationShadowLayer {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly blurRadius: number;
  readonly spreadRadius: number;
  readonly opacity: number;
}

/**
 * Current AndroidX Material3 internal elevation transition specs.
 * Shared by buttons, cards, chips and other elevation-aware components.
 */
export const elevationMotionTokens = {
  incoming: {
    durationMs: 120,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  outgoing: {
    durationMs: 150,
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  hoveredOutgoing: {
    durationMs: 120,
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

/**
 * Web shadow geometry is a platform adaptation, not AndroidX generated token data.
 * Keep it handwritten next to the generated dp elevation levels.
 */
export const elevationShadowLayers = {
  level0: [
    { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 0, opacity: 0.2 },
    { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 0, opacity: 0.14 },
    { offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 0, opacity: 0.12 },
  ],
  level1: [
    { offsetX: 0, offsetY: 2, blurRadius: 1, spreadRadius: -1, opacity: 0.2 },
    { offsetX: 0, offsetY: 1, blurRadius: 1, spreadRadius: 0, opacity: 0.14 },
    { offsetX: 0, offsetY: 1, blurRadius: 3, spreadRadius: 0, opacity: 0.12 },
  ],
  level2: [
    { offsetX: 0, offsetY: 3, blurRadius: 3, spreadRadius: -2, opacity: 0.2 },
    { offsetX: 0, offsetY: 3, blurRadius: 4, spreadRadius: 0, opacity: 0.14 },
    { offsetX: 0, offsetY: 1, blurRadius: 8, spreadRadius: 0, opacity: 0.12 },
  ],
  level3: [
    { offsetX: 0, offsetY: 3, blurRadius: 5, spreadRadius: -1, opacity: 0.2 },
    { offsetX: 0, offsetY: 6, blurRadius: 10, spreadRadius: 0, opacity: 0.14 },
    { offsetX: 0, offsetY: 1, blurRadius: 18, spreadRadius: 0, opacity: 0.12 },
  ],
  level4: [
    { offsetX: 0, offsetY: 5, blurRadius: 5, spreadRadius: -3, opacity: 0.2 },
    { offsetX: 0, offsetY: 8, blurRadius: 10, spreadRadius: 1, opacity: 0.14 },
    { offsetX: 0, offsetY: 3, blurRadius: 14, spreadRadius: 2, opacity: 0.12 },
  ],
  level5: [
    { offsetX: 0, offsetY: 7, blurRadius: 8, spreadRadius: -4, opacity: 0.2 },
    { offsetX: 0, offsetY: 12, blurRadius: 17, spreadRadius: 2, opacity: 0.14 },
    { offsetX: 0, offsetY: 5, blurRadius: 22, spreadRadius: 4, opacity: 0.12 },
  ],
} as const satisfies Record<ElevationLevel, readonly ElevationShadowLayer[]>;
