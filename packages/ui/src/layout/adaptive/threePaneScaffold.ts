import { createElement, type ReactNode } from 'react';
import { hasReactNodeContent } from '../reactNode';
import type { DragToResizeState } from './dragToResizeState';
import type { LevitatedPaneCustomAlignment } from './levitatedPaneAlignment';
import type { PaneScaffoldDirective } from './paneScaffoldDirective';
import type { PaneScaffoldRole } from './paneScaffoldRole';

export type {
  LevitatedPaneCustomAlignment,
  LevitatedPaneOffset,
  LevitatedPaneSize,
} from './levitatedPaneAlignment';
export type { PaneScaffoldRole } from './paneScaffoldRole';

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

export type LevitatedPaneAlignmentPreset =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'center-start'
  | 'center'
  | 'center-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/**
 * AndroidX accepts any Alignment implementation for levitated panes. The web
 * keeps the built-in presets and also accepts custom alignment objects.
 */
export type LevitatedPaneAlignment =
  | LevitatedPaneAlignmentPreset
  | LevitatedPaneCustomAlignment;

/** Web equivalents of Compose Alignment presets used by levitated panes. */
export const PaneAlignment = {
  TopStart: 'top-start',
  TopCenter: 'top-center',
  TopEnd: 'top-end',
  CenterStart: 'center-start',
  Center: 'center',
  CenterEnd: 'center-end',
  BottomStart: 'bottom-start',
  BottomCenter: 'bottom-center',
  BottomEnd: 'bottom-end',
} as const satisfies Record<string, LevitatedPaneAlignmentPreset>;

/**
 * React input equivalent of the @Composable scrim carried by AndroidX
 * Levitate. Functions are normalized to React elements so hooks execute in a
 * real component render boundary. The normalization is memoized by function
 * identity because AndroidX Levitated.equals compares its composable scrim by
 * identity as well.
 */
export type LevitatedPaneScrimContent = ReactNode | (() => ReactNode);

const normalizedLevitatedPaneScrims = new WeakMap<() => ReactNode, ReactNode>();

function normalizeLevitatedPaneScrim(
  scrim: LevitatedPaneScrimContent | undefined,
): ReactNode | undefined {
  if (typeof scrim !== 'function') {
    return hasReactNodeContent(scrim) ? scrim : undefined;
  }
  const cached = normalizedLevitatedPaneScrims.get(scrim);
  if (cached !== undefined) return cached;
  const normalized = createElement(scrim);
  normalizedLevitatedPaneScrims.set(scrim, normalized);
  return normalized;
}

export interface HidePaneAdaptStrategy {
  type: 'hide';
}

export interface ReflowPaneAdaptStrategy {
  type: 'reflow';
  reflowUnder: PaneScaffoldRole;
}

export interface LevitatePaneAdaptStrategy {
  type: 'levitate';
  alignment: LevitatedPaneAlignment;
  scrim?: ReactNode;
  dragToResizeState?: DragToResizeState;
  /** Equivalent of AndroidX AdaptStrategy.Levitate.onlyIf. */
  onlyIf(condition: boolean): PaneAdaptStrategy;
  /** AndroidX single-pane means maxHorizontalPartitions == 1. */
  onlyIfSinglePane(directive: PaneScaffoldDirective): PaneAdaptStrategy;
}

export interface LevitatePaneAdaptStrategyOptions {
  alignment?: LevitatedPaneAlignment;
  scrim?: LevitatedPaneScrimContent;
  dragToResizeState?: DragToResizeState;
}

export type PaneAdaptStrategy =
  | HidePaneAdaptStrategy
  | ReflowPaneAdaptStrategy
  | LevitatePaneAdaptStrategy;

const hidePaneAdaptStrategy: HidePaneAdaptStrategy = Object.freeze({ type: 'hide' });

function createLevitatePaneAdaptStrategy({
  alignment = PaneAlignment.Center,
  scrim,
  dragToResizeState,
}: LevitatePaneAdaptStrategyOptions = {}): LevitatePaneAdaptStrategy {
  const normalizedScrim = normalizeLevitatedPaneScrim(scrim);
  const strategy: LevitatePaneAdaptStrategy = {
    type: 'levitate',
    alignment,
    ...(normalizedScrim === undefined ? {} : { scrim: normalizedScrim }),
    ...(dragToResizeState === undefined ? {} : { dragToResizeState }),
    onlyIf(condition) {
      return condition ? strategy : hidePaneAdaptStrategy;
    },
    onlyIfSinglePane(directive) {
      return directive.maxHorizontalPartitions === 1 ? strategy : hidePaneAdaptStrategy;
    },
  };
  return strategy;
}

export const PaneAdaptStrategy = {
  Hide: hidePaneAdaptStrategy,
  Reflow(reflowUnder: PaneScaffoldRole): ReflowPaneAdaptStrategy {
    return { type: 'reflow', reflowUnder };
  },
  Levitate(options: LevitatePaneAdaptStrategyOptions = {}): LevitatePaneAdaptStrategy {
    return createLevitatePaneAdaptStrategy(options);
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
  | { type: 'reflowed'; reflowUnder: PaneScaffoldRole }
  | {
      type: 'levitated';
      alignment: LevitatedPaneAlignment;
      scrim?: ReactNode;
      dragToResizeState?: DragToResizeState;
    };

const expandedPaneAdaptedValue = Object.freeze({ type: 'expanded' } as const);
const hiddenPaneAdaptedValue = Object.freeze({ type: 'hidden' } as const);

export const PaneAdaptedValue = {
  Expanded: expandedPaneAdaptedValue,
  Hidden: hiddenPaneAdaptedValue,
  Reflowed(reflowUnder: PaneScaffoldRole): PaneAdaptedValue {
    return { type: 'reflowed', reflowUnder };
  },
  Levitated(
    alignment: LevitatedPaneAlignment,
    scrim?: LevitatedPaneScrimContent,
    dragToResizeState?: DragToResizeState,
  ): PaneAdaptedValue {
    const normalizedScrim = normalizeLevitatedPaneScrim(scrim);
    return {
      type: 'levitated',
      alignment,
      ...(normalizedScrim === undefined ? {} : { scrim: normalizedScrim }),
      ...(dragToResizeState === undefined ? {} : { dragToResizeState }),
    };
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

function isThreePaneScaffoldRole(role: PaneScaffoldRole): role is ThreePaneScaffoldRole {
  return (
    role === ThreePaneScaffoldRole.Primary ||
    role === ThreePaneScaffoldRole.Secondary ||
    role === ThreePaneScaffoldRole.Tertiary
  );
}

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
 * Port of AndroidX calculateThreePaneScaffoldValue including Hide, Reflow and
 * Levitate. Destination history is ordered oldest -> newest; only the newest
 * destination may levitate, and a levitated pane does not consume a partition.
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
  let expandedCount = 0;
  const adapted: Partial<Record<ThreePaneScaffoldRole, PaneAdaptedValue>> = {};

  let canReflow =
    maxHorizontalPartitions === 1 &&
    maxVerticalPartitions > 1 &&
    rolesByPriority.some((role) => strategyForRole(adaptStrategies, role).type === 'reflow');

  const currentDestination = destinationHistory.at(-1)?.pane;
  if (currentDestination !== undefined) {
    const strategy = strategyForRole(adaptStrategies, currentDestination);
    if (strategy.type === 'levitate') {
      adapted[currentDestination] = PaneAdaptedValue.Levitated(
        strategy.alignment,
        strategy.scrim,
        strategy.dragToResizeState,
      );
    }
  }

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
      if (strategy.type === 'reflow' && isThreePaneScaffoldRole(strategy.reflowUnder)) {
        reflowedPane = pane;
        anchorPane = strategy.reflowUnder;
        anchorPaneValue = valueForRole(adapted, anchorPane);
      }
    }

    if (anchorPaneValue === undefined) {
      if (strategyForRole(adaptStrategies, anchorPane).type === 'levitate') {
        continue;
      }
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

export function hasLevitatedPaneWithScrim(value: ThreePaneScaffoldValue): boolean {
  return rolesByPriority.some((role) => {
    const paneValue = getPaneAdaptedValue(value, role);
    return paneValue.type === 'levitated' && hasReactNodeContent(paneValue.scrim);
  });
}

/** Mirrors AndroidX ThreePaneScaffoldValue.isInteractable. */
export function isPaneInteractable(
  value: ThreePaneScaffoldValue,
  role: ThreePaneScaffoldRole,
): boolean {
  const paneValue = getPaneAdaptedValue(value, role);
  if (paneValue.type === 'hidden') return false;
  if (paneValue.type === 'levitated') return true;
  return !hasLevitatedPaneWithScrim(value);
}
