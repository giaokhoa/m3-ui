import type { LayoutBounds, PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  getPaneAdaptedValue,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';

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
  preferredWidths?: Partial<Record<ThreePaneScaffoldRole, number>>;
  preferredHeights?: Partial<Record<ThreePaneScaffoldRole, number>>;
}

const panePriority: Record<ThreePaneScaffoldRole, number> = {
  primary: 10,
  secondary: 5,
  tertiary: 1,
};

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

function rectWidth(rect: LayoutBounds) {
  return Math.max(0, rect.right - rect.left);
}

function rectHeight(rect: LayoutBounds) {
  return Math.max(0, rect.bottom - rect.top);
}

function clipBounds(bounds: LayoutBounds, width: number, height: number): LayoutBounds | null {
  const clipped = {
    left: Math.max(0, Math.min(width, bounds.left)),
    top: Math.max(0, Math.min(height, bounds.top)),
    right: Math.max(0, Math.min(width, bounds.right)),
    bottom: Math.max(0, Math.min(height, bounds.bottom)),
  };
  return clipped.left < clipped.right && clipped.top < clipped.bottom ? clipped : null;
}

/**
 * Static measurement/placement port of AndroidX ThreePaneScaffold.
 * Pane expansion drag state, animation lookahead and levitated overlays are separate concerns.
 */
export function calculateThreePaneScaffoldLayout({
  width,
  height,
  directive,
  value,
  paneOrder,
  direction = 'ltr',
  excludedBounds = directive.excludedBounds,
  preferredWidths = {},
  preferredHeights = {},
}: ThreePaneScaffoldLayoutOptions): ThreePaneScaffoldLayout {
  assertDimension(width, 'width');
  assertDimension(height, 'height');

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
  const result: ThreePaneScaffoldLayout = {};

  const preferredWidth = (role: ThreePaneScaffoldRole) =>
    preferredWidths[role] ?? defaultPreferredWidth;
  const preferredHeight = (role: ThreePaneScaffoldRole) =>
    preferredHeights[role] ?? defaultPreferredHeight;

  const placePartition = (bounds: LayoutBounds, expandedRole: ThreePaneScaffoldRole) => {
    const reflowValue = reflowed === undefined ? undefined : getPaneAdaptedValue(value, reflowed);
    if (
      reflowed !== undefined &&
      reflowValue?.type === 'reflowed' &&
      reflowValue.reflowUnder === expandedRole
    ) {
      const availableHeight = Math.max(0, rectHeight(bounds) - verticalGap);
      const expandedHeight = Math.max(
        availableHeight - preferredHeight(reflowed),
        availableHeight / 2,
      );
      result[expandedRole] = {
        left: bounds.left,
        top: bounds.top,
        width: rectWidth(bounds),
        height: expandedHeight,
      };
      result[reflowed] = {
        left: bounds.left,
        top: bounds.top + expandedHeight + verticalGap,
        width: rectWidth(bounds),
        height: availableHeight - expandedHeight,
      };
      return;
    }

    result[expandedRole] = {
      left: bounds.left,
      top: bounds.top,
      width: rectWidth(bounds),
      height: rectHeight(bounds),
    };
  };

  const placePartitionsInBounds = (
    bounds: LayoutBounds,
    roles: readonly ThreePaneScaffoldRole[],
  ) => {
    if (roles.length === 0) return;
    const allocatableWidth = Math.max(0, rectWidth(bounds) - (roles.length - 1) * horizontalGap);
    const widths = new Map<ThreePaneScaffoldRole, number>(
      roles.map((role) => [role, preferredWidth(role)]),
    );
    const totalPreferredWidth = roles.reduce((sum, role) => sum + preferredWidth(role), 0);

    if (allocatableWidth > totalPreferredWidth) {
      const highestPriorityRole = roles.reduce((best, role) =>
        panePriority[role] > panePriority[best] ? role : best,
      );
      widths.set(
        highestPriorityRole,
        (widths.get(highestPriorityRole) ?? 0) + allocatableWidth - totalPreferredWidth,
      );
    } else if (allocatableWidth < totalPreferredWidth && totalPreferredWidth > 0) {
      const scale = allocatableWidth / totalPreferredWidth;
      roles.forEach((role) => widths.set(role, preferredWidth(role) * scale));
    }

    let left = bounds.left;
    roles.forEach((role) => {
      const paneWidth = widths.get(role) ?? 0;
      placePartition(
        { left, top: bounds.top, right: left + paneWidth, bottom: bounds.bottom },
        role,
      );
      left += paneWidth + horizontalGap;
    });
  };

  const outerBounds: LayoutBounds = { left: 0, top: 0, right: width, bottom: height };
  const localExcluded = excludedBounds
    .map((bound) => clipBounds(bound, width, height))
    .filter((bound): bound is LayoutBounds => bound !== null)
    .sort((a, b) => a.left - b.left);

  if (localExcluded.length === 0) {
    placePartitionsInBounds(outerBounds, expanded);
    return result;
  }

  const physicalPartitions: LayoutBounds[] = [];
  let actualLeft = outerBounds.left;
  let actualRight = outerBounds.right;

  for (const excluded of localExcluded) {
    if (excluded.left <= actualLeft) {
      actualLeft = Math.max(actualLeft, excluded.right);
    } else if (excluded.right >= actualRight) {
      actualRight = Math.min(excluded.left, actualRight);
      break;
    } else {
      physicalPartitions.push({
        left: actualLeft,
        top: outerBounds.top,
        right: excluded.left,
        bottom: outerBounds.bottom,
      });
      actualLeft = Math.max(excluded.right, excluded.left + horizontalGap);
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

  if (physicalPartitions.length === 0) return result;
  if (physicalPartitions.length === 1) {
    placePartitionsInBounds(physicalPartitions[0], expanded);
    return result;
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
    return result;
  }

  expanded.forEach((role, index) => {
    const partition = physicalPartitions[index];
    if (partition !== undefined) placePartition(partition, role);
  });
  return result;
}
