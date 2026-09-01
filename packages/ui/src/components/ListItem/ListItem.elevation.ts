import * as token from '@m3-ui/tokens';
import type { ElevationLevel } from '../../internal/elevation';

export function getListItemElevationLevel(isDragged = false): ElevationLevel {
  return (isDragged
    ? token.ComponentListBaseItemDraggedContainerElevation
    : token.ComponentListBaseItemContainerElevation) as ElevationLevel;
}
