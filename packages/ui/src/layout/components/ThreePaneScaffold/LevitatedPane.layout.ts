import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import type { PanePlacement } from './ThreePaneScaffold.layout';
import {
  resolveLevitatedPaneAlignment,
  type ResolvableLevitatedPaneAlignment,
} from './LevitatedPane.alignment';
import {
  resolvePanePreferredSize,
  type PanePreferredSize,
} from './preferredPaneSize';

export interface LevitatedPaneLayoutOptions {
  width: number;
  height: number;
  directive: PaneScaffoldDirective;
  alignment: ResolvableLevitatedPaneAlignment;
  direction?: 'ltr' | 'rtl';
  preferredWidth?: PanePreferredSize;
  preferredHeight?: PanePreferredSize;
}

const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

function px(value: string, name: string): number {
  if (!value.endsWith('px')) {
    throw new Error(`${name} must resolve to CSS pixels, received ${value}`);
  }
  const parsed = Math.fround(Number.parseFloat(value));
  if (Number.isNaN(parsed)) throw new Error(`Invalid ${name}: ${value}`);
  if (parsed >= ComposeIntMax) return ComposeIntMax;
  if (parsed <= ComposeIntMin) return ComposeIntMin;
  return Math.round(parsed);
}

function assertDimension(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
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
  preferredWidth,
  preferredHeight,
}: LevitatedPaneLayoutOptions): PanePlacement {
  assertDimension(width, 'width');
  assertDimension(height, 'height');

  const resolvedPreferredWidth = resolvePanePreferredSize(
    preferredWidth,
    width,
    px(directive.defaultPanePreferredWidth, 'defaultPanePreferredWidth'),
    'preferredWidth',
  );
  const resolvedPreferredHeight = resolvePanePreferredSize(
    preferredHeight,
    height,
    px(directive.defaultPanePreferredHeight, 'defaultPanePreferredHeight'),
    'preferredHeight',
  );
  const paneWidth = Math.min(resolvedPreferredWidth, width);
  const paneHeight = Math.min(resolvedPreferredHeight, height);
  const { left, top } = resolveLevitatedPaneAlignment(
    alignment,
    paneWidth,
    paneHeight,
    width,
    height,
    direction,
  );

  return { left, top, width: paneWidth, height: paneHeight };
}
