import type { PaneScaffoldDirective } from './paneScaffoldDirective';

export type ThreePaneScaffoldRole = 'primary' | 'secondary' | 'tertiary';

export const ThreePaneScaffoldRole = {
  Primary: 'primary',
  Secondary: 'secondary',
  Tertiary: 'tertiary',
} as const satisfies Record<string, ThreePaneScaffoldRole>;

export type ThreePaneScaffoldHorizontalOrder = readonly [
  ThreePaneScaffoldRole,
  ThreePaneScaffoldRole,
  ThreePaneScaffoldRole,
];

export interface HidePaneAdaptStrategy {
  type: 'hide';
}

export interface ReflowPaneAdaptStrategy {
  type: 'reflow';
  reflowUnder: ThreePaneScaffoldRole;
}

/**
 * Static adaptation strategies currently used by Material canonical layouts.
 *
 * AndroidX also supports Levitate. That strategy changes a pane into a popup/sheet
 * surface and therefore needs a separate web overlay/focus contract; it is
 * intentionally not modeled as static pane placement here.
 */
export type PaneAdaptStrategy = HidePaneAdaptStrategy | ReflowPaneAdaptStrategy;

const hidePaneAdaptStrategy: HidePaneAdaptStrategy = Object.freeze({ type: 'hide' });

export const PaneAdaptStrategy = {
  Hide: hidePaneAdaptStrategy,
  Reflow(reflowUnder: ThreePaneScaffoldRole): ReflowPaneAdaptStrategy {
    return { type: 'reflow', reflowUnder };
  },
} as const;

export interface ThreePaneScaffoldAdaptStrategies {
  primary: PaneAdaptStrategy;
  secondary: PaneAdaptStrategy;
  tertiary: PaneAdaptStrategy;
}

export type PaneAdaptedValue =
  | { type: 'expanded' }
  | { type: 'hidden' }
  | { type: 'reflowed'; reflowUnder: ThreePaneScaffoldRole };

const expandedPaneAdaptedValue = Object.freeze({ type: 'expanded' } as const);
const hiddenPaneAdaptedValue = Object.freeze({ type: 'hidden' } as const);

export const PaneAdaptedValue = {
  Expanded: expandedPaneAdaptedValue,
  Hidden: hiddenPaneAdaptedValue,
  Reflowed(reflowUnder: ThreePaneScaffoldRole): PaneAdaptedValue {
    return { type: 'reflowed', reflowUnder };
  },
} as const;

export interface ThreePaneScaffoldDestinationItem<T = unknown> {
  pane: ThreePaneScaffoldRole;
  contentKey?: T;
}

export interface ThreePaneScaffoldValue {
  primary: PaneAdaptedValue;
  secondary: PaneAdaptedValue;
  tertiary: PaneAdaptedValue;
  /** Current destination retained for AndroidX-compatible auto-focus behavior. */
  currentDestination?: ThreePaneScaffoldRole;
}

const rolesByPriority: readonly ThreePaneScaffoldRole[] = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

export const threePaneScaffoldDefaultAdaptStrategies: ThreePaneScaffoldAdaptStrategies =
  Object.freeze({
    primary: PaneAdaptStrategy.Hide,
    secondary: PaneAdaptStrategy.Hide,
    tertiary: PaneAdaptStrategy.Hide,
  });

export const listDetailPaneScaffoldOrder: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Tertiary,
];

export const listDetailPaneScaffoldAdaptStrategies: ThreePaneScaffoldAdaptStrategies =
  threePaneScaffoldDefaultAdaptStrategies;

export const supportingPaneScaffoldOrder: ThreePaneScaffoldHorizontalOrder = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
];

export const supportingPaneScaffoldAdaptStrategies: ThreePaneScaffoldAdaptStrategies =
  Object.freeze({
    primary: PaneAdaptStrategy.Hide,
    secondary: PaneAdaptStrategy.Reflow(ThreePaneScaffoldRole.Primary),
    tertiary: PaneAdaptStrategy.Hide,
  });

export const ListDetailPaneScaffoldRole = {
  List: ThreePaneScaffoldRole.Secondary,
  Detail: ThreePaneScaffoldRole.Primary,
  Extra: ThreePaneScaffoldRole.Tertiary,
} as const;

export const SupportingPaneScaffoldRole = {
  Main: ThreePaneScaffoldRole.Primary,
  Supporting: ThreePaneScaffoldRole.Secondary,
  Extra: ThreePaneScaffoldRole.Tertiary,
} as const;

function assertPartitionCount(value: number, name: string) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

function strategyForRole(
  strategies: ThreePaneScaffoldAdaptStrategies,
  role: ThreePaneScaffoldRole,
): PaneAdaptStrategy {
  return strategies[role];
}

function valueForRole(
  values: Partial<Record<ThreePaneScaffoldRole, PaneAdaptedValue>>,
  role: ThreePaneScaffoldRole,
): PaneAdaptedValue | undefined {
  return values[role];
}

/**
 * Port of AndroidX calculateThreePaneScaffoldValue for the static Hide/Reflow
 * strategy subset used by Material list-detail and supporting-pane defaults.
 * Destination history is ordered oldest -> newest; the newest destination has
 * highest layout priority, followed by Primary, Secondary and Tertiary.
 */
export function calculateThreePaneScaffoldValue({
  maxHorizontalPartitions,
  maxVerticalPartitions = 1,
  adaptStrategies = threePaneScaffoldDefaultAdaptStrategies,
  destinationHistory = [],
}: {
  maxHorizontalPartitions: number;
  maxVerticalPartitions?: number;
  adaptStrategies?: ThreePaneScaffoldAdaptStrategies;
  destinationHistory?: readonly ThreePaneScaffoldDestinationItem[];
}): ThreePaneScaffoldValue {
  assertPartitionCount(maxHorizontalPartitions, 'maxHorizontalPartitions');
  assertPartitionCount(maxVerticalPartitions, 'maxVerticalPartitions');

  let expandedCount = 0;
  const adapted: Partial<Record<ThreePaneScaffoldRole, PaneAdaptedValue>> = {};

  let canReflow =
    maxHorizontalPartitions === 1 &&
    maxVerticalPartitions > 1 &&
    rolesByPriority.some((role) => strategyForRole(adaptStrategies, role).type === 'reflow');

  const priorityOrder: ThreePaneScaffoldRole[] = [
    ...destinationHistory.map(({ pane }) => pane).reverse(),
    ...rolesByPriority,
  ];

  for (const pane of priorityOrder) {
    const hasAvailablePartition = expandedCount < maxHorizontalPartitions;
    if (!hasAvailablePartition && !canReflow) break;
    if (valueForRole(adapted, pane) !== undefined) continue;

    let reflowedPane: ThreePaneScaffoldRole | undefined;
    let anchorPane = pane;
    let anchorPaneValue = valueForRole(adapted, anchorPane);

    if (canReflow) {
      const strategy = strategyForRole(adaptStrategies, pane);
      if (strategy.type === 'reflow') {
        reflowedPane = pane;
        anchorPane = strategy.reflowUnder;
        anchorPaneValue = valueForRole(adapted, anchorPane);
      }
    }

    if (anchorPaneValue === undefined) {
      if (hasAvailablePartition) {
        adapted[anchorPane] = PaneAdaptedValue.Expanded;
        expandedCount += 1;
      } else {
        continue;
      }
    } else if (anchorPaneValue.type !== 'expanded') {
      continue;
    }

    if (reflowedPane !== undefined) {
      adapted[reflowedPane] = PaneAdaptedValue.Reflowed(anchorPane);
      canReflow = false;
    }
  }

  const currentDestination = destinationHistory.at(-1)?.pane;
  return {
    primary: adapted.primary ?? PaneAdaptedValue.Hidden,
    secondary: adapted.secondary ?? PaneAdaptedValue.Hidden,
    tertiary: adapted.tertiary ?? PaneAdaptedValue.Hidden,
    ...(currentDestination === undefined ? {} : { currentDestination }),
  };
}

export function calculateThreePaneScaffoldValueFromDirective(
  directive: PaneScaffoldDirective,
  options: {
    adaptStrategies?: ThreePaneScaffoldAdaptStrategies;
    destinationHistory?: readonly ThreePaneScaffoldDestinationItem[];
  } = {},
): ThreePaneScaffoldValue {
  return calculateThreePaneScaffoldValue({
    maxHorizontalPartitions: directive.maxHorizontalPartitions,
    maxVerticalPartitions: directive.maxVerticalPartitions,
    ...options,
  });
}

export function getPaneAdaptedValue(
  value: ThreePaneScaffoldValue,
  role: ThreePaneScaffoldRole,
): PaneAdaptedValue {
  return value[role];
}
