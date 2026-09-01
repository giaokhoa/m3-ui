import { ComponentMenuBaseContainerElevation } from '@m3-ui/tokens';
import type { ElevationLevel } from '../../internal/elevation';

/** Runtime-only overlay mechanics that depend on the browser/React Aria boundary. */
export const menuRuntime = {
  viewportMargin: 8,
  exposedMatchAnchorWidth: true,
} as const;

/** Shared Elevation needs the semantic level at runtime; paint remains generated CSS. */
export const menuContainerElevation =
  ComponentMenuBaseContainerElevation as ElevationLevel;
