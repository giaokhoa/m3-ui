import { PaneMotion } from '../../adaptive/paneMotion';
import {
  getPaneAdaptedValue,
  type ThreePaneScaffoldRole,
} from '../../adaptive/threePaneScaffold';
import type { PanePlacement } from './ThreePaneScaffold.layout';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  type PaneTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';

export type PaneTransitionEasing = (progress: number) => number;

/**
 * Browser-safe scalar channels that can replace an AnimatedPane enter/exit transition.
 * Positive translateInline values move toward logical inline-end, so RTL mirrors them.
 */
export interface PaneTransitionVisualState {
  opacity?: number;
  translateInline?: number;
  inlineClipFraction?: number;
}

export interface PaneTransitionVisualContext {
  readonly role: ThreePaneScaffoldRole;
  readonly motion: PaneMotion;
  readonly direction: 'ltr' | 'rtl';
  readonly scaffoldWidth: number;
  readonly scaffoldHeight: number;
  readonly currentPlacement?: PanePlacement;
  readonly targetPlacement?: PanePlacement;
  /** Material start values for callers that want to retain the default effect with custom timing. */
  readonly materialFrom: Readonly<Required<PaneTransitionVisualState>>;
  /** Material end values for callers that want to retain the default effect with custom timing. */
  readonly materialTo: Readonly<Required<PaneTransitionVisualState>>;
}

export type PaneTransitionVisualStateResolver =
  | PaneTransitionVisualState
  | ((context: PaneTransitionVisualContext) => PaneTransitionVisualState);

/**
 * Web-native equivalent of an AnimatedPane EnterTransition / ExitTransition.
 *
 * `from` and `to` replace the Material visibility channels for this pane. Missing
 * channels are neutral (opacity 1, zero inline translation, unclipped content).
 * Use a resolver and `materialFrom` / `materialTo` when only the timing curve
 * should change while retaining Material's selected effect.
 */
export interface PaneVisibilityTransitionSpec {
  /** Duration contributed to the shared visibility transition timeline. */
  durationMs: number;
  from?: PaneTransitionVisualStateResolver;
  to?: PaneTransitionVisualStateResolver;
  /** Maps normalized local play time. Values outside [0, 1] are allowed for overshoot. */
  easing?: PaneTransitionEasing;
}

/**
 * Web-native equivalent of AnimatedPane.boundsAnimationSpec.
 * Providing this object replaces the Material bounds spring with direct bounds
 * interpolation; `durationMs` gives web callers an explicit animation clock for
 * bounds-only changes that would otherwise have no AnimatedVisibility child.
 */
export interface PaneBoundsTransitionSpec {
  durationMs: number;
  easing?: PaneTransitionEasing;
}

export interface PaneTransitionSpec {
  enter?: PaneVisibilityTransitionSpec;
  exit?: PaneVisibilityTransitionSpec;
  bounds?: PaneBoundsTransitionSpec;
}

/** Per-scaffold-role AnimatedPane motion overrides. */
export type PaneTransitionSpecs = Partial<Record<ThreePaneScaffoldRole, PaneTransitionSpec>>;

const roles: readonly ThreePaneScaffoldRole[] = ['primary', 'secondary', 'tertiary'];
const neutralVisualState: Readonly<Required<PaneTransitionVisualState>> = Object.freeze({
  opacity: 1,
  translateInline: 0,
  inlineClipFraction: 1,
});

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function hasSpecs(specs: PaneTransitionSpecs | undefined) {
  return (
    specs !== undefined &&
    roles.some((role) => {
      const spec = specs[role];
      return spec?.enter !== undefined || spec?.exit !== undefined || spec?.bounds !== undefined;
    })
  );
}

function visibilityKind(
  layout: ThreePaneScaffoldTransitionLayoutOptions,
  role: ThreePaneScaffoldRole,
): 'enter' | 'exit' | undefined {
  if (layout.paneAvailability?.[role] === false) return undefined;
  const currentHidden = getPaneAdaptedValue(layout.currentValue, role).type === 'hidden';
  const targetHidden = getPaneAdaptedValue(layout.targetValue, role).type === 'hidden';
  if (currentHidden && !targetHidden) return 'enter';
  if (!currentHidden && targetHidden) return 'exit';
  return undefined;
}

function validateDuration(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError(`pane transition durationMs must be a finite value >= 0; received ${durationMs}`);
  }
  return durationMs;
}

function sampleEasing(easing: PaneTransitionEasing | undefined, progress: number) {
  const eased = easing?.(progress) ?? progress;
  if (!Number.isFinite(eased)) {
    throw new RangeError(`pane transition easing must return a finite number; received ${eased}`);
  }
  return eased;
}

function physicalToLogicalInline(value: number, direction: 'ltr' | 'rtl') {
  return direction === 'rtl' ? -value : value;
}

function logicalToPhysicalInline(value: number, direction: 'ltr' | 'rtl') {
  return direction === 'rtl' ? -value : value;
}

function visualStateFromFrame(
  frame: PaneTransitionFrame | undefined,
  direction: 'ltr' | 'rtl',
): Readonly<Required<PaneTransitionVisualState>> {
  if (frame === undefined) return neutralVisualState;
  return {
    opacity: frame.opacity,
    translateInline: physicalToLogicalInline(frame.translateX, direction),
    inlineClipFraction: frame.inlineClipFraction,
  };
}

function resolveVisualState(
  resolver: PaneTransitionVisualStateResolver | undefined,
  context: PaneTransitionVisualContext,
): Readonly<Required<PaneTransitionVisualState>> {
  const resolved =
    resolver === undefined
      ? undefined
      : typeof resolver === 'function'
        ? resolver(context)
        : resolver;
  return {
    opacity: resolved?.opacity ?? neutralVisualState.opacity,
    translateInline: resolved?.translateInline ?? neutralVisualState.translateInline,
    inlineClipFraction:
      resolved?.inlineClipFraction ?? neutralVisualState.inlineClipFraction,
  };
}

function interpolate(from: number, to: number, fraction: number) {
  return from + (to - from) * fraction;
}

function interpolatePlacement(
  from: PanePlacement,
  to: PanePlacement,
  fraction: number,
): PanePlacement {
  return {
    left: interpolate(from.left, to.left, fraction),
    top: interpolate(from.top, to.top, fraction),
    width: interpolate(from.width, to.width, fraction),
    height: interpolate(from.height, to.height, fraction),
  };
}

function isModalMotion(motion: PaneMotion | undefined) {
  return motion === PaneMotion.EnterAsModal || motion === PaneMotion.ExitAsModal;
}

/**
 * Resolves the shared scaffold timeline while preserving the exact Material
 * duration when no overrides are supplied.
 */
export function calculateThreePaneScaffoldTransitionDurationWithSpecs(
  layout: ThreePaneScaffoldTransitionLayoutOptions,
  specs?: PaneTransitionSpecs,
): number {
  const materialDurationMs = calculateThreePaneScaffoldTransitionDuration(layout);
  if (!hasSpecs(specs)) return materialDurationMs;

  const start = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction: 0,
  });
  const end = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction: 1,
  });
  let customDurationMs = 0;
  let visibilityChanges = 0;
  let customizedVisibilityChanges = 0;
  let retainMaterialTimeline = false;

  for (const role of roles) {
    const kind = visibilityKind(layout, role);
    if (kind !== undefined) {
      visibilityChanges += 1;
      const spec = specs?.[role]?.[kind];
      if (spec !== undefined) {
        customizedVisibilityChanges += 1;
        customDurationMs = Math.max(customDurationMs, validateDuration(spec.durationMs));

        const motion = end[role]?.motion ?? start[role]?.motion;
        if (isModalMotion(motion) && (start.scrim !== undefined || end.scrim !== undefined)) {
          // AnimatedPane customization does not own the scaffold scrim. Keep the
          // Material scrim child on the shared timeline when a modal has a scrim.
          retainMaterialTimeline = true;
        }
      }
    }

    const bounds = specs?.[role]?.bounds;
    const paneMotion = end[role]?.motion ?? start[role]?.motion;
    if (bounds !== undefined && paneMotion === PaneMotion.AnimateBounds) {
      customDurationMs = Math.max(customDurationMs, validateDuration(bounds.durationMs));
    }
  }

  if (
    visibilityChanges > 0 &&
    customizedVisibilityChanges === visibilityChanges &&
    !retainMaterialTimeline
  ) {
    return customDurationMs;
  }
  return Math.max(materialDurationMs, customDurationMs);
}

/**
 * Samples per-role custom visibility/bounds specs on top of the existing
 * Material motion-decision and geometry engine.
 */
export function calculateThreePaneScaffoldTransitionFrameWithSpecs(
  layout: ThreePaneScaffoldTransitionLayoutOptions,
  progressFraction: number,
  specs?: PaneTransitionSpecs,
): ThreePaneScaffoldTransitionFrame {
  const materialFrame = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction,
  });
  if (!hasSpecs(specs)) return materialFrame;

  const direction = layout.direction ?? 'ltr';
  const start = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction: 0,
  });
  const end = calculateThreePaneScaffoldTransitionFrame({
    ...layout,
    progressFraction: 1,
  });
  const fullDurationMs = calculateThreePaneScaffoldTransitionDurationWithSpecs(layout, specs);
  const playTimeMs = fullDurationMs * clampUnit(progressFraction);
  const result: ThreePaneScaffoldTransitionFrame = { ...materialFrame };

  for (const role of roles) {
    const materialPane = materialFrame[role];
    if (materialPane === undefined || layout.paneAvailability?.[role] === false) continue;

    const kind = visibilityKind(layout, role);
    const customVisibility =
      kind === undefined ? undefined : specs?.[role]?.[kind];
    if (customVisibility !== undefined) {
      const durationMs = validateDuration(customVisibility.durationMs);
      const localProgress = durationMs <= 0 ? 1 : clampUnit(playTimeMs / durationMs);
      const easedProgress = sampleEasing(customVisibility.easing, localProgress);
      const currentVisible =
        getPaneAdaptedValue(layout.currentValue, role).type !== 'hidden';
      const targetVisible = getPaneAdaptedValue(layout.targetValue, role).type !== 'hidden';
      const materialFrom = visualStateFromFrame(start[role], direction);
      const materialTo = visualStateFromFrame(end[role], direction);
      const context: PaneTransitionVisualContext = {
        role,
        motion: materialPane.motion,
        direction,
        scaffoldWidth: layout.width,
        scaffoldHeight: layout.height,
        currentPlacement: currentVisible ? start[role]?.placement : undefined,
        targetPlacement: targetVisible ? end[role]?.placement : undefined,
        materialFrom,
        materialTo,
      };
      const from = resolveVisualState(customVisibility.from, context);
      const to = resolveVisualState(customVisibility.to, context);
      result[role] = {
        ...materialPane,
        translateX: logicalToPhysicalInline(
          interpolate(from.translateInline, to.translateInline, easedProgress),
          direction,
        ),
        opacity: clampUnit(interpolate(from.opacity, to.opacity, easedProgress)),
        inlineClipFraction: clampUnit(
          interpolate(from.inlineClipFraction, to.inlineClipFraction, easedProgress),
        ),
      };
      continue;
    }

    const boundsSpec = specs?.[role]?.bounds;
    if (boundsSpec === undefined || materialPane.motion !== PaneMotion.AnimateBounds) continue;
    const startPane = start[role];
    const endPane = end[role];
    if (startPane === undefined || endPane === undefined) continue;
    const boundsDurationMs = validateDuration(boundsSpec.durationMs);
    const localProgress =
      boundsDurationMs <= 0 ? 1 : clampUnit(playTimeMs / boundsDurationMs);
    const easedProgress = sampleEasing(boundsSpec.easing, localProgress);
    result[role] = {
      ...materialPane,
      placement: interpolatePlacement(
        startPane.placement,
        endPane.placement,
        easedProgress,
      ),
    };
  }

  return result;
}
