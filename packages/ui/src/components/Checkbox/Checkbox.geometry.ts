import * as token from '@m3-ui/tokens';
import { pxNumber } from '../../internal/tokenValues';

const containerSize = pxNumber(token.ComponentCheckboxContainerSize);
const stateLayerSize = pxNumber(token.ComponentCheckboxStateLayerSize);
const minimumInteractiveSize = pxNumber(token.ComponentCheckboxMinimumInteractiveSize);

function point(x: number, y: number): string {
  return `${x * containerSize} ${y * containerSize}`;
}

export const checkboxGeometry = {
  containerSize,
  stateLayerRadius: stateLayerSize / 2,
  focusRingInset: (minimumInteractiveSize - containerSize) / 2,
  focusRingRadius: containerSize * 0.25,
  checkPath: `M ${point(token.ComponentCheckboxMarkCheckPathLeftX, token.ComponentCheckboxMarkCheckPathLeftY)} L ${point(token.ComponentCheckboxMarkCheckPathCrossX, token.ComponentCheckboxMarkCheckPathCrossY)} L ${point(token.ComponentCheckboxMarkCheckPathRightX, token.ComponentCheckboxMarkCheckPathRightY)}`,
  indeterminatePath: `M ${point(token.ComponentCheckboxMarkCheckPathLeftX, token.ComponentCheckboxMarkCheckPathLeftY)} L ${point(token.ComponentCheckboxMarkCheckPathRightX, token.ComponentCheckboxMarkCheckPathLeftY)}`,
} as const;
