import type { LayoutBounds, PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import { paneScaffoldRolesEqual } from '../../adaptive/paneScaffoldRole';
import {
  PaneExpansionUnspecified,
  type PaneExpansionState,
} from '../../adaptive/paneExpansionState';
import {
  getPaneAdaptedValue,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { assertThreePaneScaffoldHorizontalOrder } from '../../adaptive/threePaneScaffoldHorizontalOrder';
import { applyPaneMargins, type PaneMargins } from './paneMargins';
import {
  resolvePanePreferredSize,
  type PanePreferredSize,
} from './preferredPaneSize';

export interface PanePlacement {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ThreePaneScaffoldLayout {
  primary?: PanePlacement;
  secondary?: PanePlacement;
  tertiary?: PanePlacement;
}

export interface ThreePaneScaffoldLayoutOptions {
  width: number;
  height: number;
  directive: PaneScaffoldDirective;
  value: ThreePaneScaffoldValue;
  paneOrder: ThreePaneScaffoldHorizontalOrder;
  direction?: 'ltr' | 'rtl';
  /** Excluded bounds converted to scaffold-local physical CSS pixels. */
  excludedBounds?: readonly LayoutBounds[];
  preferredWidths?: Partial<Record<ThreePaneScaffoldRole, PanePreferredSize>>;
  preferredHeights?: Partial<Record<ThreePaneScaffoldRole, PanePreferredSize>>;
  /** Outer pane margins applied after partition measurement, keyed by pane role. */
  paneMargins?: Partial<Record<ThreePaneScaffoldRole, PaneMargins>>;
  paneExpansionState?: PaneExpansionState | null;
}

export interface ThreePaneScaffoldLayoutPass {
  /** Raw AndroidX measuredBounds recorded into PaneMotionData before margins/measurement clamp. */
  raw: ThreePaneScaffoldLayout;
  /** Browser-renderable bounds after PaneMargins and measured size clamp. */
  placed: ThreePaneScaffoldLayout;
}

const panePriority: Record<ThreePaneScaffoldRole, number> = {
  primary: 10,
  secondary: 5,
  tertiary: 1,
};
const ComposeIntMax = 2147483647;
const ComposeIntMin = -2147483648;

function composeRoundToPx(value: number) {
  const floatValue = Math.fround(value);
  if (Number.isNaN(floatValue)) throw new Error('Cannot round NaN value');
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.round(floatValue);
}

function composeFloatToInt(value: number) {
  const floatValue = Math.fround(value);
  if (Number.isNaN(floatValue)) return 0;
  if (floatValue >= ComposeIntMax) return ComposeIntMax;
  if (floatValue <= ComposeIntMin) return ComposeIntMin;
  return Math.trunc(floatValue);
}

function composeIntAdd(a: number, b: number) {
  return Number.isInteger(a) && Number.isInteger(b) ? (a + b) | 0 : a + b;
}

function composeIntSubtract(a: number, b: number) {
  return Number.isInteger(a) && Number.isInteger(b) ? (a - b) | 0 : a - b;
}

function composeIntMultiply(a: number, b: number) {
  return Number.isInteger(a) && Number.isInteger(b) ? Math.imul(a, b) : a * b;
}

function px(value: string, name: string): number {
  if (!value.endsWith('px')) {
    throw new Error(`${name} must resolve to CSS pixels, received ${value}`);
  }
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) throw new Error(`Invalid ${name}: ${value}`);
  return composeRoundToPx(parsed);
}

function assertDimension(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite, non-negative CSS pixel value`);
  }
}

function rectWidth(rect: LayoutBounds) {
  return rect.right - rect.left;
}

function rectHeight(rect: LayoutBounds) {
  return rect.bottom - rect.top;
}

function roundBounds(bounds: LayoutBounds): LayoutBounds {
  return {
    left: composeRoundToPx(bounds.left),
    top: composeRoundToPx(bounds.top),
    right: composeRoundToPx(bounds.right),
    bottom: composeRoundToPx(bounds.bottom),
  };
}

function clampMeasuredSize(placement: PanePlacement): PanePlacement {
  return {
    ...placement,
    width: Math.max(placement.width, 0),
    height: Math.max(placement.height, 0),
  };
}

/**
 * Internal two-phase measurement pass matching AndroidX ThreePaneScaffold.
 * `raw` is captured when measureAndPlacePane assigns measuredBounds and records
 * PaneMotionData. `placed` mirrors doMeasureAndPlace: margins are applied later,
 * then the actual child Constraints clamp negative measured sizes to zero.
 */
export function calculateThreePaneScaffoldLayoutPass({
  width,
  height,
  directive,
  value,
  paneOrder,
  direction = 'ltr',
  excludedBounds = directive.excludedBounds,
  preferredWidths = {},
  preferredHeights = {},
  paneMargins = {},
  paneExpansionState = null,
}: ThreePaneScaffoldLayoutOptions): ThreePaneScaffoldLayoutPass {
  assertDimension(width, 'width');
  assertDimension(height, 'height');
  assertThreePaneScaffoldHorizontalOrder(paneOrder);

  const horizontalGap = px(
    directive.horizontalPartitionSpacerSize,
    'horizontalPartitionSpacerSize',
  );
  const verticalGap = px(
    directive.verticalPartitionSpacerSize,
    'verticalPartitionSpacerSize',
  );
  const defaultPreferredWidth = px(
    directive.defaultPanePreferredWidth,
    'defaultPanePreferredWidth',
  );
  const defaultPreferredHeight = px(
    directive.defaultPanePreferredHeight,
    'defaultPanePreferredHeight',
  );

  const physicalOrder = direction === 'rtl' ? [...paneOrder].reverse() : [...paneOrder];
  const expanded = physicalOrder.filter(
    (role) => getPaneAdaptedValue(value, role).type === 'expanded',
  );
  const reflowed = physicalOrder.find(
    (role) => getPaneAdaptedValue(value, role).type === 'reflowed',
  );
  const raw: ThreePaneScaffoldLayout = {};
  const placed: ThreePaneScaffoldLayout = {};
  const finish = (): ThreePaneScaffoldLayoutPass => ({ raw, placed });

  const preferredWidth = (role: ThreePaneScaffoldRole) =>
    resolvePanePreferredSize(
      preferredWidths[role],
      width,
      defaultPreferredWidth,
      `${role} preferredWidth`,
    );
  const preferredHeight = (role: ThreePaneScaffoldRole) =>
    resolvePanePreferredSize(
      preferredHeights[role],
      height,
      defaultPreferredHeight,
      `${role} preferredHeight`,
    );
  const placePane = (role: ThreePaneScaffoldRole, placement: PanePlacement) => {
    raw[role] = placement;
    placed[role] = clampMeasuredSize(
      applyPaneMargins(
        placement,
        paneMargins[role],
        width,
        height,
        direction,
      ),
    );
  };

  const placePartition = (bounds: LayoutBounds, expandedRole: ThreePaneScaffoldRole) => {
    const reflowValue = reflowed === undefined ? undefined : getPaneAdaptedValue(value, reflowed);
    if (
      reflowed !== undefined &&
      reflowValue?.type === 'reflowed' &&
      paneScaffoldRolesEqual(reflowValue.reflowUnder, expandedRole)
    ) {
      const availableHeight = rectHeight(bounds) - verticalGap;
      const expandedRawHeight = Math.max(
        availableHeight - preferredHeight(reflowed),
        Math.trunc(availableHeight / 2),
      );
      const reflowedRawHeight = availableHeight - expandedRawHeight;
      placePane(expandedRole, {
        left: bounds.left,
        top: bounds.top,
        width: rectWidth(bounds),
        height: expandedRawHeight,
      });
      placePane(reflowed, {
        left: bounds.left,
        top: bounds.top + expandedRawHeight + verticalGap,
        width: rectWidth(bounds),
        height: reflowedRawHeight,
      });
      return;
    }

    placePane(expandedRole, {
      left: bounds.left,
      top: bounds.top,
      width: rectWidth(bounds),
      height: rectHeight(bounds),
    });
  };

  const placePartitionsInBounds = (
    bounds: LayoutBounds,
    roles: readonly ThreePaneScaffoldRole[],
  ) => {
    if (roles.length === 0) return;
    const spacerWidth = composeIntMultiply(roles.length - 1, horizontalGap);
    const allocatableWidth = composeIntSubtract(rectWidth(bounds), spacerWidth);
    const widths = new Map<ThreePaneScaffoldRole, number>(
      roles.map((role) => [role, preferredWidth(role)]),
    );
    const totalPreferredWidth = roles.reduce(
      (sum, role) => composeIntAdd(sum, widths.get(role) ?? 0),
      0,
    );

    if (allocatableWidth > totalPreferredWidth) {
      const highestPriorityRole = roles.reduce((best, role) =>
        panePriority[role] > panePriority[best] ? role : best,
      );
      widths.set(
        highestPriorityRole,
        composeIntAdd(
          widths.get(highestPriorityRole) ?? 0,
          composeIntSubtract(allocatableWidth, totalPreferredWidth),
        ),
      );
    } else if (allocatableWidth < totalPreferredWidth) {
      const scale = Math.fround(
        Math.fround(allocatableWidth) / Math.fround(totalPreferredWidth),
      );
      roles.forEach((role) =>
        widths.set(
          role,
          composeFloatToInt(Math.fround(Math.fround(widths.get(role) ?? 0) * scale)),
        ),
      );
    }

    let left = bounds.left;
    roles.forEach((role) => {
      const paneWidth = widths.get(role) ?? 0;
      const right = composeIntAdd(left, paneWidth);
      placePartition(
        { left, top: bounds.top, right, bottom: bounds.bottom },
        role,
      );
      left = composeIntAdd(right, horizontalGap);
    });
  };

  const outerBounds: LayoutBounds = { left: 0, top: 0, right: width, bottom: height };

  if (paneExpansionState !== null && expanded.length === 2) {
    const expansion = paneExpansionState.getLayoutState(width, direction);
    const expansionUnspecified =
      expansion.firstPaneWidth === PaneExpansionUnspecified &&
      Number.isNaN(expansion.firstPaneProportion) &&
      expansion.currentDraggingOffset === PaneExpansionUnspecified;

    if (!expansionUnspecified) {
      const firstPane = expanded[0]!;
      const secondPane = expanded[1]!;
      if (expansion.currentDraggingOffset !== PaneExpansionUnspecified) {
        const halfGap = Math.trunc(horizontalGap / 2);
        if (expansion.currentDraggingOffset <= halfGap) {
          const bounds = expansion.isDraggingOrSettling
            ? { ...outerBounds, left: expansion.currentDraggingOffset * 2 }
            : outerBounds;
          placePartition(bounds, secondPane);
        } else if (expansion.currentDraggingOffset >= width - halfGap) {
          const bounds = expansion.isDraggingOrSettling
            ? { ...outerBounds, right: expansion.currentDraggingOffset * 2 - width }
            : outerBounds;
          placePartition(bounds, firstPane);
        } else {
          placePartition(
            { ...outerBounds, right: expansion.currentDraggingOffset - halfGap },
            firstPane,
          );
          placePartition(
            { ...outerBounds, left: expansion.currentDraggingOffset + halfGap },
            secondPane,
          );
        }
      } else if (
        expansion.firstPaneWidth === 0 ||
        expansion.firstPaneProportion === 0
      ) {
        placePartition(outerBounds, secondPane);
      } else if (
        expansion.firstPaneWidth >= width - horizontalGap ||
        expansion.firstPaneProportion >= 1
      ) {
        placePartition(outerBounds, firstPane);
      } else {
        const firstPaneWidth =
          expansion.firstPaneWidth !== PaneExpansionUnspecified
            ? expansion.firstPaneWidth
            : composeFloatToInt(
                Math.fround(
                  Math.fround(expansion.firstPaneProportion) *
                    Math.fround(width - horizontalGap),
                ),
              );
        const firstPaneRight = outerBounds.left + firstPaneWidth;
        placePartition({ ...outerBounds, right: firstPaneRight }, firstPane);
        placePartition(
          { ...outerBounds, left: firstPaneRight + horizontalGap },
          secondPane,
        );
      }
      return finish();
    }
  }

  // AndroidX assumes excludedBounds are already sorted from left to right and
  // non-overlapping. Preserve caller order and full rounded bounds here rather
  // than silently sorting or clipping custom directives into a different one.
  const localExcluded = excludedBounds.map(roundBounds);

  if (localExcluded.length === 0) {
    placePartitionsInBounds(outerBounds, expanded);
    return finish();
  }

  const physicalPartitions: LayoutBounds[] = [];
  let actualLeft = outerBounds.left;
  let actualRight = outerBounds.right;

  for (const excluded of localExcluded) {
    if (excluded.left <= actualLeft) {
      actualLeft = Math.max(actualLeft, excluded.right);
    } else if (excluded.right >= actualRight) {
      actualRight = Math.min(excluded.left, actualRight);
      continue;
    } else {
      physicalPartitions.push({
        left: actualLeft,
        top: outerBounds.top,
        right: excluded.left,
        bottom: outerBounds.bottom,
      });
      actualLeft = Math.max(
        excluded.right,
        composeIntAdd(excluded.left, horizontalGap),
      );
    }
  }
  if (actualLeft < actualRight) {
    physicalPartitions.push({
      left: actualLeft,
      top: outerBounds.top,
      right: actualRight,
      bottom: outerBounds.bottom,
    });
  }

  if (physicalPartitions.length === 0) return finish();
  if (physicalPartitions.length === 1) {
    placePartitionsInBounds(physicalPartitions[0], expanded);
    return finish();
  }

  if (physicalPartitions.length < expanded.length) {
    const [first, second] = physicalPartitions;
    if (rectWidth(first) > rectWidth(second)) {
      placePartitionsInBounds(first, expanded.slice(0, 2));
      if (expanded[2] !== undefined) placePartition(second, expanded[2]);
    } else {
      if (expanded[0] !== undefined) placePartition(first, expanded[0]);
      placePartitionsInBounds(second, expanded.slice(1, 3));
    }
    return finish();
  }

  expanded.forEach((role, index) => {
    const partition = physicalPartitions[index];
    if (partition !== undefined) placePartition(partition, role);
  });
  return finish();
}

/**
 * Static browser-renderable layout. Raw AndroidX measured bounds stay internal
 * to the measurement pass so callers do not need a second layout contract.
 */
export function calculateThreePaneScaffoldLayout(
  options: ThreePaneScaffoldLayoutOptions,
): ThreePaneScaffoldLayout {
  return calculateThreePaneScaffoldLayoutPass(options).placed;
}
