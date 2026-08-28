import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import type { LevitatedPaneAlignment } from '../../adaptive/threePaneScaffold';
import type { PanePlacement } from './ThreePaneScaffold.layout';

export interface LevitatedPaneLayoutOptions {
  width: number;
  height: number;
  directive: PaneScaffoldDirective;
  alignment: LevitatedPaneAlignment;
  direction?: 'ltr' | 'rtl';
  preferredWidth?: number;
  preferredHeight?: number;
}

function px(value: string, name: string): number {
  if (!value.endsWith('px')) {
    throw new Error(`${name} must resolve to CSS pixels, received ${value}`);
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${name}: ${value}`);
  return parsed;
}

function assertDimension(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function alignmentParts(alignment: LevitatedPaneAlignment): {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'start' | 'center' | 'end';
} {
  if (alignment === 'center') return { vertical: 'center', horizontal: 'center' };
  const [vertical, horizontal] = alignment.split('-') as [
    'top' | 'center' | 'bottom',
    'start' | 'center' | 'end',
  ];
  return { vertical, horizontal };
}

/**
 * Port of AndroidX levitated-pane measurement and Alignment placement.
 *
 * A levitated pane is measured from its preferred size, clamped to the full
 * scaffold bounds, and aligned independently of expanded-pane partitions and
 * excluded hinge bounds.
 */
export function calculateLevitatedPanePlacement({
  width,
  height,
  directive,
  alignment,
  direction = 'ltr',
  preferredWidth = px(directive.defaultPanePreferredWidth, 'defaultPanePreferredWidth'),
  preferredHeight = px(directive.defaultPanePreferredHeight, 'defaultPanePreferredHeight'),
}: LevitatedPaneLayoutOptions): PanePlacement {
  assertDimension(width, 'width');
  assertDimension(height, 'height');
  assertDimension(preferredWidth, 'preferredWidth');
  assertDimension(preferredHeight, 'preferredHeight');

  const paneWidth = Math.min(preferredWidth, width);
  const paneHeight = Math.min(preferredHeight, height);
  const { vertical, horizontal } = alignmentParts(alignment);

  let left: number;
  if (horizontal === 'center') {
    left = (width - paneWidth) / 2;
  } else {
    const logicalStart = horizontal === 'start';
    const physicalLeft = direction === 'ltr' ? logicalStart : !logicalStart;
    left = physicalLeft ? 0 : width - paneWidth;
  }

  const top =
    vertical === 'top'
      ? 0
      : vertical === 'bottom'
        ? height - paneHeight
        : (height - paneHeight) / 2;

  return { left, top, width: paneWidth, height: paneHeight };
}
