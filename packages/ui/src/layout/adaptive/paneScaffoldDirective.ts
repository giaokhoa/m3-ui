import * as token from '@m3-ui/tokens';
import {
  calculateWindowSizeClass,
  type WindowSize,
  type WindowSizeClass,
} from './windowSizeClass';

export interface LayoutBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface FoldingFeature extends LayoutBounds {
  orientation: 'vertical' | 'horizontal';
  isSeparating: boolean;
  isOccluding: boolean;
}

/**
 * Web representation of the Material adaptive Posture information that affects
 * layout. Browser/platform detection is intentionally not fabricated here;
 * consumers can provide folding features from an adapter when available.
 */
export interface WindowPosture {
  isTabletop: boolean;
  foldingFeatures: readonly FoldingFeature[];
}

export const defaultWindowPosture: WindowPosture = Object.freeze({
  isTabletop: false,
  foldingFeatures: Object.freeze([]),
});

export interface WindowAdaptiveInfo {
  windowSize: WindowSize;
  windowSizeClass: WindowSizeClass;
  windowPosture: WindowPosture;
}

export function calculateWindowAdaptiveInfo(
  windowSize: WindowSize,
  windowPosture: WindowPosture = defaultWindowPosture,
): WindowAdaptiveInfo {
  return {
    windowSize,
    windowSizeClass: calculateWindowSizeClass(windowSize),
    windowPosture,
  };
}

export type HingePolicy =
  | 'always-avoid'
  | 'avoid-separating'
  | 'avoid-occluding'
  | 'never-avoid';

export interface PaneScaffoldDirective {
  maxHorizontalPartitions: number;
  horizontalPartitionSpacerSize: string;
  maxVerticalPartitions: number;
  verticalPartitionSpacerSize: string;
  defaultPanePreferredWidth: string;
  defaultPanePreferredHeight: string;
  excludedBounds: readonly LayoutBounds[];
  shouldAutoFocusCurrentDestination: boolean;
}

export const paneScaffoldTokens = {
  partitionSpacer: token.LayoutPanePartitionSpacer,
  preferredWidth: token.LayoutPanePreferredWidth,
  preferredWidthExtraLarge: token.LayoutPanePreferredWidthExtraLarge,
  preferredHeight: token.LayoutPanePreferredHeight,
} as const;

const zero = '0px';

export const defaultPaneScaffoldDirective: PaneScaffoldDirective = Object.freeze({
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: zero,
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: zero,
  defaultPanePreferredWidth: paneScaffoldTokens.preferredWidth,
  defaultPanePreferredHeight: paneScaffoldTokens.preferredHeight,
  excludedBounds: Object.freeze([]),
  shouldAutoFocusCurrentDestination: true,
});

function getExcludedVerticalBounds(
  posture: WindowPosture,
  hingePolicy: HingePolicy,
): readonly LayoutBounds[] {
  if (hingePolicy === 'never-avoid') return [];

  return posture.foldingFeatures.filter((feature) => {
    if (feature.orientation !== 'vertical') return false;
    if (hingePolicy === 'always-avoid') return true;
    if (hingePolicy === 'avoid-occluding') return feature.isOccluding;
    return feature.isSeparating;
  });
}

/**
 * Material-recommended adaptive pane directive from the pinned AndroidX
 * `calculatePaneScaffoldDirective` contract.
 */
export function calculatePaneScaffoldDirective(
  windowAdaptiveInfo: WindowAdaptiveInfo,
  hingePolicy: HingePolicy = 'avoid-separating',
): PaneScaffoldDirective {
  const widthClass = windowAdaptiveInfo.windowSizeClass.width;

  let maxHorizontalPartitions: 1 | 2 | 3;
  let horizontalPartitionSpacerSize: string;
  let defaultPanePreferredWidth: string;

  if (widthClass === 'compact' || widthClass === 'medium') {
    maxHorizontalPartitions = 1;
    horizontalPartitionSpacerSize = zero;
    defaultPanePreferredWidth = paneScaffoldTokens.preferredWidth;
  } else if (widthClass === 'expanded') {
    maxHorizontalPartitions = 2;
    horizontalPartitionSpacerSize = paneScaffoldTokens.partitionSpacer;
    defaultPanePreferredWidth = paneScaffoldTokens.preferredWidth;
  } else {
    maxHorizontalPartitions = 3;
    horizontalPartitionSpacerSize = paneScaffoldTokens.partitionSpacer;
    defaultPanePreferredWidth = paneScaffoldTokens.preferredWidthExtraLarge;
  }

  const useVerticalPartitions =
    windowAdaptiveInfo.windowPosture.isTabletop ||
    (maxHorizontalPartitions === 1 &&
      windowAdaptiveInfo.windowSizeClass.height === 'expanded');

  return {
    maxHorizontalPartitions,
    horizontalPartitionSpacerSize,
    maxVerticalPartitions: useVerticalPartitions ? 2 : 1,
    verticalPartitionSpacerSize: useVerticalPartitions
      ? paneScaffoldTokens.partitionSpacer
      : zero,
    defaultPanePreferredWidth,
    defaultPanePreferredHeight: paneScaffoldTokens.preferredHeight,
    excludedBounds: getExcludedVerticalBounds(
      windowAdaptiveInfo.windowPosture,
      hingePolicy,
    ),
    shouldAutoFocusCurrentDestination: true,
  };
}

/**
 * Dense alternative matching AndroidX's two-panes-on-medium-width directive.
 * Prefer `calculatePaneScaffoldDirective` unless product requirements need the
 * denser medium-width arrangement.
 */
export function calculatePaneScaffoldDirectiveWithTwoPanesOnMediumWidth(
  windowAdaptiveInfo: WindowAdaptiveInfo,
  hingePolicy: HingePolicy = 'avoid-separating',
): PaneScaffoldDirective {
  const base = calculatePaneScaffoldDirective(windowAdaptiveInfo, hingePolicy);
  if (windowAdaptiveInfo.windowSizeClass.width !== 'medium') return base;

  const isTabletop = windowAdaptiveInfo.windowPosture.isTabletop;
  return {
    ...base,
    maxHorizontalPartitions: 2,
    horizontalPartitionSpacerSize: paneScaffoldTokens.partitionSpacer,
    maxVerticalPartitions: isTabletop ? base.maxVerticalPartitions : 1,
    verticalPartitionSpacerSize: isTabletop
      ? base.verticalPartitionSpacerSize
      : zero,
  };
}
