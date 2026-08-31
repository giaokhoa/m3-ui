import clsx from 'clsx';
import {
  Activity,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import type { DragToResizeState } from '../../adaptive/dragToResizeState';
import {
  PaneExpansionUnspecified,
  type PaneExpansionState,
} from '../../adaptive/paneExpansionState';
import type { LayoutBounds, PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  getPaneAdaptedValue,
  hasLevitatedPaneWithScrim,
  isPaneInteractable,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  MutableThreePaneScaffoldState,
  threePaneScaffoldValuesEqual,
  type ThreePaneScaffoldState,
} from '../../adaptive/threePaneScaffoldState';
import {
  getDragToResizeHandleAriaState,
  type DragToResizeHandleAriaStrings,
} from './dragToResizeSemantics';
import { calculateLevitatedPanePlacement } from './LevitatedPane.layout';
import { calculateLevitatedPaneResizePlacement } from './LevitatedPane.resizeLayout';
import {
  getLevitatedResizeStates,
  getLevitatedResizeStatesSnapshot,
  subscribeLevitatedResizeStates,
} from './levitatedResizeStateStore';
import {
  calculatePaneExpansionDragHandleFadeFrame,
  calculatePaneExpansionDragHandlePlacement,
  calculatePaneExpansionSpacerMiddleOffset,
  updatePaneExpansionDragHandleFadeOffsets,
} from './paneExpansionDragHandle.layout';
import {
  getPaneExpansionHandleAriaState,
  type PaneExpansionHandleAriaStrings,
} from './paneExpansionSemantics';
import { applyPaneMargins, type PaneMargins } from './paneMargins';
import type { PanePreferredSize } from './preferredPaneSize';
import { requestPaneDestinationFocus } from './ThreePaneScaffold.focus';
import {
  calculateThreePaneScaffoldLayout,
  type PanePlacement,
  type ThreePaneScaffoldLayout,
} from './ThreePaneScaffold.layout';
import {
  getPredictiveBackLayerStyle,
  usePredictiveBackScale,
} from './ThreePaneScaffold.predictiveBack';
import { createThreePaneScaffoldSeekingRemeasureSource } from './ThreePaneScaffold.seekingRemeasure';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  type PaneTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
  type ThreePaneScaffoldTransitionLayoutOptions,
} from './ThreePaneScaffold.transition';
import {
  calculateThreePaneScaffoldVisibilityInterruptionDurationMs,
  createThreePaneScaffoldVisibilityInterruption,
  sampleThreePaneScaffoldVisibilityInterruption,
  updateThreePaneScaffoldVisibilityInterruptionLayout,
  type ThreePaneScaffoldTransitionSnapshot,
  type ThreePaneScaffoldVisibilityInterruption,
} from './ThreePaneScaffold.visibilityInterruption';
import { useDefaultPaneExpansionState } from './useDefaultPaneExpansionState';
import './three-pane-scaffold.css';

export type LevitatedPaneDragHandle =
  | ReactNode
  | ((state: DragToResizeState) => ReactNode);

export interface ThreePaneScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  directive: PaneScaffoldDirective;
  /** Adapted-value overload. Updates animate through internal state like AndroidX. */
  value?: ThreePaneScaffoldValue;
  /** Seekable/animated adapted value. Provide exactly one of value or scaffoldState. */
  scaffoldState?: ThreePaneScaffoldState;
  paneOrder: ThreePaneScaffoldHorizontalOrder;
  primaryPane: ReactNode;
  secondaryPane: ReactNode;
  tertiaryPane?: ReactNode;
  preferredWidths?: Partial<Record<ThreePaneScaffoldRole, PanePreferredSize>>;
  preferredHeights?: Partial<Record<ThreePaneScaffoldRole, PanePreferredSize>>;
  /** AndroidX PaneMargins analogue keyed by pane role. */
  paneMargins?: Partial<Record<ThreePaneScaffoldRole, PaneMargins>>;
  paneExpansionState?: PaneExpansionState;
  paneExpansionDragHandle?: ReactNode | ((state: PaneExpansionState) => ReactNode);
  /** Browser equivalent of paneExpansionDraggable minTouchTargetSize. */
  paneExpansionDragHandleMinTouchTargetSize?: number;
  paneExpansionHandleAriaLabel?: string;
  /** Localized formatters for anchored pane-expansion state and next-anchor action text. */
  paneExpansionHandleAriaStrings?: Partial<PaneExpansionHandleAriaStrings>;
  /**
   * Accessible pane names keyed by scaffold role. Defaults mirror the pinned
   * AndroidX pane-title strings; override these when the application localizes
   * accessibility copy.
   */
  paneAriaLabels?: Partial<Record<ThreePaneScaffoldRole, string>>;
  /**
   * Web equivalent of AnimatedPane.dragToResizeHandle, keyed by pane role.
   * When omitted for a resizable levitated pane, the whole pane is the pointer
   * drag target like AndroidX AnimatedPane.
   */
  levitatedPaneDragHandles?: Partial<Record<ThreePaneScaffoldRole, LevitatedPaneDragHandle>>;
  /** Optional web accessible-name override for the levitated resize action. */
  levitatedPaneDragHandleAriaLabel?: string;
  /** Localized formatters for levitated resize-handle state and next action text. */
  levitatedPaneDragHandleAriaStrings?: Partial<DragToResizeHandleAriaStrings>;
}

interface ScaffoldGeometry {
  width: number;
  height: number;
  viewportLeft: number;
  viewportTop: number;
  direction: 'ltr' | 'rtl';
}

interface PointerDrag {
  pointerId: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  accumulated: number;
  dragging: boolean;
}

interface ResizePointerDrag {
  pointerId: number;
  state: DragToResizeState;
  lastX: number;
  lastY: number;
  accumulated: number;
  clickMovementX: number;
  clickMovementY: number;
  dragging: boolean;
  canClickToResize: boolean;
}

const emptyGeometry: ScaffoldGeometry = {
  width: 0,
  height: 0,
  viewportLeft: 0,
  viewportTop: 0,
  direction: 'ltr',
};

// Browser gesture-arbitration threshold. This is a platform input adaptation,
// not a Material layout metric or token.
const BrowserPointerSlop = 4;
const ResizeInteractiveSelector = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'label',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="textbox"]',
  '[role="combobox"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="treeitem"]',
].join(', ');
const defaultPaneAriaLabels: Record<ThreePaneScaffoldRole, string> = {
  primary: 'Primary pane',
  secondary: 'Secondary pane',
  tertiary: 'Tertiary pane',
};

function sameGeometry(a: ScaffoldGeometry, b: ScaffoldGeometry) {
  return (
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5 &&
    Math.abs(a.viewportLeft - b.viewportLeft) < 0.5 &&
    Math.abs(a.viewportTop - b.viewportTop) < 0.5 &&
    a.direction === b.direction
  );
}

function paneStyle(placement: PanePlacement | undefined): CSSProperties | undefined {
  if (placement === undefined) return undefined;
  return {
    left: placement.left,
    top: placement.top,
    width: placement.width,
    height: placement.height,
  };
}

function transitionPaneStyle(frame: PaneTransitionFrame): CSSProperties {
  const clipInset = ((1 - frame.inlineClipFraction) * 100) / 2;
  return {
    ...paneStyle(frame.placement),
    opacity: frame.opacity,
    transform: frame.translateX === 0 ? undefined : `translateX(${frame.translateX}px)`,
    clipPath:
      frame.inlineClipFraction >= 1
        ? undefined
        : `inset(0 ${clipInset}% 0 ${clipInset}%)`,
    willChange: 'left, top, width, height, transform, opacity, clip-path',
  };
}

function getPlacement(layout: ThreePaneScaffoldLayout, role: ThreePaneScaffoldRole) {
  return layout[role];
}

function isInteractiveResizeDescendant(
  target: EventTarget | null,
  currentTarget: HTMLDivElement,
) {
  if (!(target instanceof Element)) return false;
  let element: Element | null = target;
  while (element !== null && element !== currentTarget) {
    if (element.matches(ResizeInteractiveSelector)) return true;
    if (element instanceof HTMLElement && element.tabIndex >= 0) return true;
    element = element.parentElement;
  }
  return false;
}

export function ThreePaneScaffold({
  directive,
  value,
  scaffoldState,
  paneOrder,
  primaryPane,
  secondaryPane,
  tertiaryPane,
  preferredWidths,
  preferredHeights,
  paneMargins,
  paneExpansionState,
  paneExpansionDragHandle,
  paneExpansionDragHandleMinTouchTargetSize = 48,
  paneExpansionHandleAriaLabel = 'Pane expansion drag handle',
  paneExpansionHandleAriaStrings,
  paneAriaLabels,
  levitatedPaneDragHandles,
  levitatedPaneDragHandleAriaLabel,
  levitatedPaneDragHandleAriaStrings,
  className,
  style,
  ...props
}: ThreePaneScaffoldProps) {
  if ((value === undefined) === (scaffoldState === undefined)) {
    throw new Error('ThreePaneScaffold requires exactly one of value or scaffoldState');
  }

  const internalScaffoldStateRef = useRef<MutableThreePaneScaffoldState | null>(null);
  if (value !== undefined && internalScaffoldStateRef.current === null) {
    internalScaffoldStateRef.current = new MutableThreePaneScaffoldState(value);
  }
  const activeScaffoldState = scaffoldState ?? internalScaffoldStateRef.current!;

  const rootRef = useRef<HTMLDivElement>(null);
  const transitionOwnerRef = useRef<object>({});
  const paneRefs = useRef<Partial<Record<ThreePaneScaffoldRole, HTMLDivElement>>>({});
  const pointerDragRef = useRef<PointerDrag | null>(null);
  const resizePointerDragRef = useRef<ResizePointerDrag | null>(null);
  const dragHandleFadeOffsetsRef = useRef({
    originalOffsetX: PaneExpansionUnspecified,
    targetOffsetX: PaneExpansionUnspecified,
  });
  const previousTargetValueRef = useRef<ThreePaneScaffoldValue | null>(null);
  const previousTransitionSnapshotRef = useRef<ThreePaneScaffoldTransitionSnapshot | undefined>(
    undefined,
  );
  const previousAnimationPlayTimeMsRef = useRef(0);
  const previousInitialValueAnimationsClearRevisionRef = useRef<number | null>(null);
  const renderedTransitionFrameRef = useRef<ThreePaneScaffoldTransitionFrame | undefined>(
    undefined,
  );
  const visibilityInterruptionRef = useRef<ThreePaneScaffoldVisibilityInterruption | undefined>(
    undefined,
  );
  const retargetTargetValueRef = useRef<ThreePaneScaffoldValue | null>(null);
  const [geometry, setGeometry] = useState<ScaffoldGeometry>(emptyGeometry);

  useSyncExternalStore(
    activeScaffoldState.subscribe,
    activeScaffoldState.getSnapshot,
    activeScaffoldState.getSnapshot,
  );

  const targetValue = activeScaffoldState.targetState;
  const defaultExpansionState = useDefaultPaneExpansionState(
    targetValue,
    paneExpansionDragHandle != null,
  );
  const expansionState = paneExpansionState ?? defaultExpansionState;
  const currentValue = activeScaffoldState.currentState;
  const transitionActive = !threePaneScaffoldValuesEqual(currentValue, targetValue);

  const paneEntries: Array<[ThreePaneScaffoldRole, ReactNode]> = [
    ['primary', primaryPane],
    ['secondary', secondaryPane],
    ['tertiary', tertiaryPane],
  ];
  const resizeStates = getLevitatedResizeStates(currentValue, targetValue);

  useSyncExternalStore(
    expansionState.subscribe,
    expansionState.getSnapshot,
    expansionState.getSnapshot,
  );
  useSyncExternalStore(
    (listener) => subscribeLevitatedResizeStates(resizeStates, listener),
    () => getLevitatedResizeStatesSnapshot(resizeStates),
    () => getLevitatedResizeStatesSnapshot(resizeStates),
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root === null || typeof window === 'undefined') return;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const next: ScaffoldGeometry = {
        width: rect.width,
        height: rect.height,
        viewportLeft: rect.left,
        viewportTop: rect.top,
        direction: getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr',
      };
      setGeometry((current) => (sameGeometry(current, next) ? current : next));
    };

    measure();
    window.addEventListener('resize', measure);
    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useLayoutEffect(() => {
    expansionState.onMeasured(geometry.width, geometry.direction);
  }, [expansionState, geometry.direction, geometry.width]);

  useLayoutEffect(() => {
    if (!(activeScaffoldState instanceof MutableThreePaneScaffoldState) || geometry.width <= 0) {
      return;
    }
    return activeScaffoldState.setTransitionDurationResolver(
      transitionOwnerRef.current,
      (from, to) => {
        const localExcludedBounds: LayoutBounds[] = directive.excludedBounds.map((bound) => ({
          left: bound.left - geometry.viewportLeft,
          top: bound.top - geometry.viewportTop,
          right: bound.right - geometry.viewportLeft,
          bottom: bound.bottom - geometry.viewportTop,
        }));
        const destinationLayout: ThreePaneScaffoldTransitionLayoutOptions = {
          width: geometry.width,
          height: geometry.height,
          directive,
          currentValue: from,
          targetValue: to,
          paneOrder,
          direction: geometry.direction,
          excludedBounds: localExcludedBounds,
          preferredWidths,
          preferredHeights,
          paneMargins,
          paneExpansionState: expansionState,
        };
        const renderedClearRevision = previousInitialValueAnimationsClearRevisionRef.current;
        if (
          renderedClearRevision !== null &&
          activeScaffoldState.initialValueAnimationsClearRevision !== renderedClearRevision
        ) {
          return calculateThreePaneScaffoldTransitionDuration(destinationLayout);
        }
        const activeInterruption = visibilityInterruptionRef.current;
        if (
          activeInterruption !== undefined &&
          retargetTargetValueRef.current !== null &&
          threePaneScaffoldValuesEqual(retargetTargetValueRef.current, to) &&
          threePaneScaffoldValuesEqual(activeScaffoldState.currentState, from) &&
          threePaneScaffoldValuesEqual(activeScaffoldState.targetState, to)
        ) {
          return calculateThreePaneScaffoldVisibilityInterruptionDurationMs(
            activeInterruption,
            activeScaffoldState.animationPlayTimeMs,
          );
        }
        const previousSnapshot = previousTransitionSnapshotRef.current;
        const renderedFrame = renderedTransitionFrameRef.current;
        if (
          previousSnapshot !== undefined &&
          renderedFrame !== undefined &&
          threePaneScaffoldValuesEqual(previousSnapshot.layout.targetValue, from) &&
          !threePaneScaffoldValuesEqual(from, to)
        ) {
          return createThreePaneScaffoldVisibilityInterruption({
            renderedFrame,
            previousSnapshot,
            destinationLayout,
            previousInterruption:
              visibilityInterruptionRef.current === undefined
                ? undefined
                : {
                    interruption: visibilityInterruptionRef.current,
                    elapsedMs: previousAnimationPlayTimeMsRef.current,
                  },
          }).durationMs;
        }
        return calculateThreePaneScaffoldTransitionDuration(destinationLayout);
      },
    );
  }, [
    activeScaffoldState,
    geometry.width,
    geometry.height,
    geometry.viewportLeft,
    geometry.viewportTop,
    geometry.direction,
    directive,
    paneOrder,
    preferredWidths,
    preferredHeights,
    paneMargins,
    expansionState,
  ]);

  useLayoutEffect(() => {
    if (value === undefined || internalScaffoldStateRef.current === null) return;
    void internalScaffoldStateRef.current.animateTo(value);
  }, [geometry.width, value]);

  useLayoutEffect(() => {
    if (
      !directive.shouldAutoFocusCurrentDestination ||
      targetValue.currentDestination === undefined
    ) {
      return;
    }
    const pane = paneRefs.current[targetValue.currentDestination];
    if (pane !== undefined) requestPaneDestinationFocus(pane);
  }, [directive.shouldAutoFocusCurrentDestination, targetValue.currentDestination]);

  const excludedBounds: LayoutBounds[] = directive.excludedBounds.map((bound) => ({
    left: bound.left - geometry.viewportLeft,
    top: bound.top - geometry.viewportTop,
    right: bound.right - geometry.viewportLeft,
    bottom: bound.bottom - geometry.viewportTop,
  }));

  const layout = calculateThreePaneScaffoldLayout({
    width: geometry.width,
    height: geometry.height,
    directive,
    value: targetValue,
    paneOrder,
    direction: geometry.direction,
    excludedBounds,
    preferredWidths,
    preferredHeights,
    paneMargins,
    paneExpansionState: expansionState,
  });

  const transitionLayout: ThreePaneScaffoldTransitionLayoutOptions = {
    width: geometry.width,
    height: geometry.height,
    directive,
    currentValue,
    targetValue,
    paneOrder,
    direction: geometry.direction,
    excludedBounds,
    preferredWidths,
    preferredHeights,
    paneMargins,
    paneExpansionState: expansionState,
  };
  const calculateTransitionFrameAt = (progressFraction: number) =>
    calculateThreePaneScaffoldTransitionFrame({
      ...transitionLayout,
      progressFraction,
    });

  const rawTransitionFrame = transitionActive
    ? calculateTransitionFrameAt(activeScaffoldState.progressFraction)
    : undefined;
  const currentTransitionSnapshot: ThreePaneScaffoldTransitionSnapshot | undefined =
    transitionActive
      ? {
          layout: transitionLayout,
          progressFraction: activeScaffoldState.progressFraction,
        }
      : undefined;
  const animationPlayTimeMs =
    activeScaffoldState instanceof MutableThreePaneScaffoldState
      ? activeScaffoldState.animationPlayTimeMs
      : transitionActive
        ? calculateThreePaneScaffoldTransitionDuration(transitionLayout) *
          activeScaffoldState.progressFraction
        : 0;
  const initialValueAnimationsClearRevision =
    activeScaffoldState instanceof MutableThreePaneScaffoldState
      ? activeScaffoldState.initialValueAnimationsClearRevision
      : null;

  if (initialValueAnimationsClearRevision === null) {
    previousInitialValueAnimationsClearRevisionRef.current = null;
  } else {
    const previousClearRevision = previousInitialValueAnimationsClearRevisionRef.current;
    if (
      previousClearRevision !== null &&
      previousClearRevision !== initialValueAnimationsClearRevision
    ) {
      previousTargetValueRef.current = null;
      previousTransitionSnapshotRef.current = undefined;
      previousAnimationPlayTimeMsRef.current = 0;
      renderedTransitionFrameRef.current = undefined;
      visibilityInterruptionRef.current = undefined;
      retargetTargetValueRef.current = null;
    }
    previousInitialValueAnimationsClearRevisionRef.current =
      initialValueAnimationsClearRevision;
  }

  let transitionFrame = rawTransitionFrame;

  if (transitionActive && rawTransitionFrame !== undefined) {
    const previousTargetValue = previousTargetValueRef.current;
    const previousSnapshot = previousTransitionSnapshotRef.current;
    if (
      previousTargetValue !== null &&
      !threePaneScaffoldValuesEqual(previousTargetValue, targetValue) &&
      previousSnapshot !== undefined &&
      renderedTransitionFrameRef.current !== undefined
    ) {
      visibilityInterruptionRef.current = createThreePaneScaffoldVisibilityInterruption({
        renderedFrame: renderedTransitionFrameRef.current,
        previousSnapshot,
        destinationLayout: transitionLayout,
        previousInterruption:
          visibilityInterruptionRef.current === undefined
            ? undefined
            : {
                interruption: visibilityInterruptionRef.current,
                elapsedMs: previousAnimationPlayTimeMsRef.current,
              },
      });
      retargetTargetValueRef.current = targetValue;
    }

    if (
      visibilityInterruptionRef.current === undefined &&
      previousTargetValue !== null &&
      threePaneScaffoldValuesEqual(previousTargetValue, targetValue) &&
      previousSnapshot !== undefined &&
      renderedTransitionFrameRef.current !== undefined
    ) {
      const remeasureSource = createThreePaneScaffoldSeekingRemeasureSource(previousSnapshot);
      const remeasured = updateThreePaneScaffoldVisibilityInterruptionLayout({
        interruption: remeasureSource,
        renderedFrame: renderedTransitionFrameRef.current,
        destinationLayout: transitionLayout,
        elapsedMs: animationPlayTimeMs,
        progressFraction: activeScaffoldState.progressFraction,
      });
      if (remeasured !== remeasureSource) {
        visibilityInterruptionRef.current = remeasured;
        retargetTargetValueRef.current = targetValue;
      }
    }

    const activeInterruption = visibilityInterruptionRef.current;
    const renderedFrame = renderedTransitionFrameRef.current;
    if (
      activeInterruption !== undefined &&
      renderedFrame !== undefined &&
      retargetTargetValueRef.current !== null &&
      threePaneScaffoldValuesEqual(retargetTargetValueRef.current, targetValue)
    ) {
      const updatedInterruption = updateThreePaneScaffoldVisibilityInterruptionLayout({
        interruption: activeInterruption,
        renderedFrame,
        destinationLayout: transitionLayout,
        elapsedMs: animationPlayTimeMs,
        progressFraction: activeScaffoldState.progressFraction,
      });
      visibilityInterruptionRef.current = updatedInterruption;
      transitionFrame = sampleThreePaneScaffoldVisibilityInterruption(
        updatedInterruption,
        animationPlayTimeMs,
        activeScaffoldState.progressFraction,
      );
    }
  } else {
    visibilityInterruptionRef.current = undefined;
    retargetTargetValueRef.current = null;
  }

  previousTargetValueRef.current = targetValue;
  previousTransitionSnapshotRef.current = currentTransitionSnapshot;
  previousAnimationPlayTimeMsRef.current = animationPlayTimeMs;
  renderedTransitionFrameRef.current = transitionFrame;

  const expansionLayout = expansionState.getLayoutState(geometry.width, geometry.direction);
  const transitionScrimBlocks =
    transitionFrame?.scrim != null && transitionFrame.scrimOpacity > 0;
  const hasBlockingScrim = transitionScrimBlocks || hasLevitatedPaneWithScrim(targetValue);

  let measuredDragHandleOffset = PaneExpansionUnspecified;
  if (paneExpansionDragHandle != null) {
    if (
      expansionState.isDraggingOrSettling &&
      expansionLayout.currentDraggingOffset !== PaneExpansionUnspecified
    ) {
      measuredDragHandleOffset = expansionLayout.currentDraggingOffset;
    } else {
      measuredDragHandleOffset = calculatePaneExpansionSpacerMiddleOffset({
        layout,
        layoutOptions: {
          width: geometry.width,
          height: geometry.height,
          directive,
          value: targetValue,
          paneOrder,
          direction: geometry.direction,
          excludedBounds,
          preferredWidths,
          preferredHeights,
          paneMargins,
          paneExpansionState: expansionState,
        },
      });
    }
  }

  // AnimateWithFading observes the drag handle's lookahead placement offset,
  // after measureAndPlaceDragHandleIfNeeded has coerced the raw spacer midpoint
  // into the content bounds. Keep the raw midpoint separately for expansion
  // state measurement, which happens before that placement clamp upstream.
  const targetDragHandlePlacement =
    paneExpansionDragHandle != null &&
    measuredDragHandleOffset !== PaneExpansionUnspecified &&
    geometry.width > 0
      ? calculatePaneExpansionDragHandlePlacement({
          offsetX: measuredDragHandleOffset,
          contentWidth: geometry.width,
          partitionSpacerSize: directive.horizontalPartitionSpacerSize,
          minTouchTargetSize: paneExpansionDragHandleMinTouchTargetSize,
        })
      : undefined;
  const targetDragHandleOffset =
    targetDragHandlePlacement?.centerX ?? measuredDragHandleOffset;

  dragHandleFadeOffsetsRef.current = updatePaneExpansionDragHandleFadeOffsets(
    dragHandleFadeOffsetsRef.current,
    targetDragHandleOffset,
  );
  const {
    originalOffsetX: dragHandleOriginalOffset,
    targetOffsetX: trackedDragHandleTargetOffset,
  } = dragHandleFadeOffsetsRef.current;
  const showDragHandle =
    paneExpansionDragHandle != null &&
    trackedDragHandleTargetOffset !== PaneExpansionUnspecified;
  const dragHandleFadeFrame =
    transitionActive &&
    dragHandleOriginalOffset !== PaneExpansionUnspecified &&
    trackedDragHandleTargetOffset !== PaneExpansionUnspecified
      ? calculatePaneExpansionDragHandleFadeFrame({
          currentOffsetX: dragHandleOriginalOffset,
          targetOffsetX: trackedDragHandleTargetOffset,
          progressFraction: activeScaffoldState.progressFraction,
        })
      : undefined;
  const dragHandleOffset =
    dragHandleFadeFrame?.offsetX ?? trackedDragHandleTargetOffset;
  const dragHandleOpacity = dragHandleFadeFrame?.opacity ?? 1;
  const dragHandleInteractionBlocked = hasBlockingScrim;

  const dragHandlePlacement =
    showDragHandle &&
    dragHandleOffset !== PaneExpansionUnspecified &&
    geometry.width > 0
      ? calculatePaneExpansionDragHandlePlacement({
          offsetX: dragHandleOffset,
          contentWidth: geometry.width,
          partitionSpacerSize: directive.horizontalPartitionSpacerSize,
          minTouchTargetSize: paneExpansionDragHandleMinTouchTargetSize,
        })
      : undefined;

  useLayoutEffect(() => {
    if (expansionState.isDraggingOrSettling) return;
    expansionState.onExpansionOffsetMeasured(measuredDragHandleOffset);
  }, [expansionState, measuredDragHandleOffset]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      hasBlockingScrim ||
      !event.isPrimary ||
      event.button !== 0 ||
      dragHandleOffset === PaneExpansionUnspecified
    ) {
      return;
    }
    pointerDragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      accumulated: 0,
      dragging: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = pointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.lastX;
    const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
    drag.velocity = (delta / elapsed) * 1000;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;

    if (!drag.dragging) {
      drag.accumulated += delta;
      if (Math.abs(drag.accumulated) < BrowserPointerSlop) return;
      drag.dragging = true;
      expansionState.onExpansionOffsetMeasured(measuredDragHandleOffset);
      expansionState.beginDrag();
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      expansionState.dispatchRawDelta(drag.accumulated);
      drag.accumulated = 0;
      event.preventDefault();
      return;
    }

    expansionState.dispatchRawDelta(delta);
    event.preventDefault();
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>, velocity: number) => {
    const drag = pointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;
    pointerDragRef.current = null;
    if (drag.dragging) expansionState.endDrag(velocity);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (
      hasBlockingScrim ||
      dragHandleOffset === PaneExpansionUnspecified ||
      (event.key !== 'Enter' && event.key !== ' ')
    ) {
      return;
    }
    if (expansionState.nextAnchor === null) return;
    event.preventDefault();
    expansionState.moveToNextAnchor();
  };

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // Pointer clicks keep their drag behavior. Assistive technologies commonly
    // synthesize a detail=0 click for the semantic activation action.
    if (hasBlockingScrim || event.detail !== 0 || expansionState.nextAnchor === null) return;
    event.preventDefault();
    expansionState.moveToNextAnchor();
  };

  const beginResize = (
    event: ReactPointerEvent<HTMLDivElement>,
    state: DragToResizeState,
  ) => {
    if (!event.isPrimary || event.button !== 0 || transitionActive) return;
    resizePointerDragRef.current = {
      pointerId: event.pointerId,
      state,
      lastX: event.clientX,
      lastY: event.clientY,
      accumulated: 0,
      clickMovementX: 0,
      clickMovementY: 0,
      dragging: false,
      canClickToResize: !isInteractiveResizeDescendant(event.target, event.currentTarget),
    };
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = resizePointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.clickMovementX += deltaX;
    drag.clickMovementY += deltaY;
    if (
      Math.hypot(drag.clickMovementX, drag.clickMovementY) >= BrowserPointerSlop
    ) {
      drag.canClickToResize = false;
    }
    const axisDelta = drag.state.orientation === 'horizontal' ? deltaX : deltaY;

    if (!drag.dragging) {
      drag.accumulated += axisDelta;
      if (Math.abs(drag.accumulated) < BrowserPointerSlop) return;
      drag.dragging = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      drag.state.dispatchRawDelta(drag.accumulated, geometry.direction);
      drag.accumulated = 0;
      event.preventDefault();
      return;
    }

    drag.state.dispatchRawDelta(axisDelta, geometry.direction);
    event.preventDefault();
  };

  const finishResize = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const drag = resizePointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;
    resizePointerDragRef.current = null;
    if (!cancelled && !drag.dragging && drag.canClickToResize) {
      drag.state.moveToNextState();
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resizeKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    state: DragToResizeState,
  ) => {
    if (transitionActive || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    state.moveToNextState();
  };

  const resizeClick = (
    event: ReactMouseEvent<HTMLDivElement>,
    state: DragToResizeState,
  ) => {
    if (transitionActive || event.detail !== 0) return;
    event.preventDefault();
    state.moveToNextState();
  };

  let staticScrim: ReactNode | undefined;
  if (!transitionActive) {
    for (const [role] of paneEntries) {
      const adaptedValue = getPaneAdaptedValue(targetValue, role);
      if (adaptedValue.type === 'levitated' && adaptedValue.scrim != null) {
        staticScrim = adaptedValue.scrim;
        break;
      }
    }
  }
  const renderedScrim = transitionFrame?.scrim ?? staticScrim;
  const scrimOpacity = transitionFrame?.scrimOpacity ?? (staticScrim == null ? 0 : 1);

  const dragHandle =
    typeof paneExpansionDragHandle === 'function'
      ? paneExpansionDragHandle(expansionState)
      : paneExpansionDragHandle;
  const dragHandleAriaState = getPaneExpansionHandleAriaState(
    expansionState,
    paneExpansionHandleAriaStrings,
  );
  const dragHandleAriaDescription =
    [dragHandleAriaState.valueText, dragHandleAriaState.description]
      .filter((value): value is string => value !== undefined)
      .join('. ') || undefined;
  const predictiveBackScale = usePredictiveBackScale(activeScaffoldState);

  return (
    <div
      {...props}
      ref={rootRef}
      className={clsx('three-pane-scaffold', className)}
      data-predictive-back-scale={predictiveBackScale}
      style={style}
    >
      <div
        className="three-pane-scaffold__predictive-back-layer"
        style={getPredictiveBackLayerStyle(predictiveBackScale)}
      >
        {paneEntries.map(([role, content]) => {
          const adaptedValue = getPaneAdaptedValue(targetValue, role);
          const frame = transitionFrame?.[role];
          if (content == null) return null;

          // AndroidX disposes Hidden pane composition while SaveableStateProvider
          // retains pane-local state. React 19.2 Activity is the native analogue:
          // hidden children keep state/DOM identity but their Effects are cleaned up.
          const staticallyHidden = frame === undefined && adaptedValue.type === 'hidden';

          let placement: PanePlacement | undefined;
          if (frame !== undefined) {
            placement = frame.placement;
          } else if (adaptedValue.type === 'levitated') {
            const basePlacement = calculateLevitatedPanePlacement({
              width: geometry.width,
              height: geometry.height,
              directive,
              alignment: adaptedValue.alignment,
              direction: geometry.direction,
              preferredWidth: preferredWidths?.[role],
              preferredHeight: preferredHeights?.[role],
            });
            const resized = adaptedValue.dragToResizeState?.measure({
              measuringWidth: basePlacement.width,
              measuringHeight: basePlacement.height,
              scaffoldWidth: geometry.width,
              scaffoldHeight: geometry.height,
              direction: geometry.direction,
            });
            const unmarginedPlacement =
              resized === undefined
                ? basePlacement
                : calculateLevitatedPaneResizePlacement({
                    rawWidth: resized.width,
                    rawHeight: resized.height,
                    scaffoldWidth: geometry.width,
                    scaffoldHeight: geometry.height,
                    alignment: adaptedValue.alignment,
                    direction: geometry.direction,
                  });
            placement = applyPaneMargins(
              unmarginedPlacement,
              paneMargins?.[role],
              geometry.width,
              geometry.height,
              geometry.direction,
            );
          } else if (!staticallyHidden) {
            placement = getPlacement(layout, role);
          }
          if (placement === undefined && !staticallyHidden) return null;

          const frameLevitated = frame?.levitated ?? adaptedValue.type === 'levitated';
          const interactable = !staticallyHidden && isPaneInteractable(targetValue, role);
          const paneAriaLabel = paneAriaLabels?.[role] ?? defaultPaneAriaLabels[role];
          const paneResizeState =
            adaptedValue.type === 'levitated' ? adaptedValue.dragToResizeState : undefined;
          const paneResizeAriaState =
            paneResizeState === undefined
              ? undefined
              : getDragToResizeHandleAriaState(
                  paneResizeState,
                  levitatedPaneDragHandleAriaStrings,
                );
          const paneResizeActionLabel =
            levitatedPaneDragHandleAriaLabel ?? paneResizeAriaState?.actionDescription;
          const resizeHandleSpec = levitatedPaneDragHandles?.[role];
          const resizeHandle =
            paneResizeState === undefined
              ? undefined
              : typeof resizeHandleSpec === 'function'
                ? resizeHandleSpec(paneResizeState)
                : resizeHandleSpec;
          const hasResizeHandle =
            !transitionActive && paneResizeState !== undefined && resizeHandle != null;
          const hasPaneResizeAction =
            !transitionActive && paneResizeState !== undefined && !hasResizeHandle;
          const paneResizeHandlers =
            hasPaneResizeAction && paneResizeState !== undefined
              ? {
                  onLostPointerCapture: (event: ReactPointerEvent<HTMLDivElement>) =>
                    finishResize(event, true),
                  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) =>
                    finishResize(event, true),
                  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) =>
                    beginResize(event, paneResizeState),
                  onPointerMove: moveResize,
                  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => finishResize(event),
                }
              : {};

          return (
            <Activity key={role} mode={staticallyHidden ? 'hidden' : 'visible'}>
              <div
                {...paneResizeHandlers}
                ref={(node) => {
                  if (node === null) delete paneRefs.current[role];
                  else paneRefs.current[role] = node;
                }}
                className={clsx(
                  'three-pane-scaffold__pane',
                  frameLevitated && 'three-pane-scaffold__pane--levitated',
                  hasResizeHandle && 'three-pane-scaffold__pane--has-resize-handle',
                  hasPaneResizeAction && 'three-pane-scaffold__pane--resize-target',
                )}
                role={interactable ? 'region' : undefined}
                aria-label={interactable ? paneAriaLabel : undefined}
                data-pane-role={role}
                data-pane-adapted-value={adaptedValue.type}
                data-pane-interactable={interactable}
                data-pane-motion={frame?.motion}
                data-resize-state={paneResizeState?.value}
                inert={!interactable || undefined}
                style={frame === undefined ? paneStyle(placement) : transitionPaneStyle(frame)}
              >
                {hasResizeHandle ? (
                  <div
                    className="three-pane-scaffold__levitated-resize-handle"
                    data-orientation={paneResizeState.orientation}
                    data-resize-state={paneResizeState.value}
                    role="button"
                    aria-label={paneResizeActionLabel}
                    aria-description={paneResizeAriaState?.stateDescription}
                    tabIndex={0}
                    onClick={(event) => resizeClick(event, paneResizeState)}
                    onKeyDown={(event) => resizeKeyDown(event, paneResizeState)}
                    onLostPointerCapture={(event) => finishResize(event, true)}
                    onPointerCancel={(event) => finishResize(event, true)}
                    onPointerDown={(event) => beginResize(event, paneResizeState)}
                    onPointerMove={moveResize}
                    onPointerUp={(event) => finishResize(event)}
                  >
                    {resizeHandle}
                  </div>
                ) : null}
                {hasPaneResizeAction && paneResizeState !== undefined ? (
                  <button
                    type="button"
                    className="three-pane-scaffold__levitated-resize-action"
                    data-orientation={paneResizeState.orientation}
                    data-resize-state={paneResizeState.value}
                    aria-label={paneResizeActionLabel}
                    aria-description={paneResizeAriaState?.stateDescription}
                    onClick={(event) => {
                      event.stopPropagation();
                      paneResizeState.moveToNextState();
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    {paneResizeActionLabel}
                  </button>
                ) : null}
                {hasResizeHandle ? (
                  <div className="three-pane-scaffold__levitated-content">{content}</div>
                ) : (
                  content
                )}
              </div>
            </Activity>
          );
        })}
        {showDragHandle && dragHandleOffset !== PaneExpansionUnspecified ? (
          <div
            className="three-pane-scaffold__drag-handle"
            role="button"
            aria-label={paneExpansionHandleAriaLabel}
            aria-description={dragHandleAriaDescription}
            inert={dragHandleInteractionBlocked || undefined}
            tabIndex={dragHandleInteractionBlocked ? -1 : 0}
            style={{
              left: dragHandlePlacement?.centerX ?? dragHandleOffset,
              minWidth: dragHandlePlacement?.minWidth,
              opacity: dragHandleOpacity,
            }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onPointerCancel={(event) => finishPointerDrag(event, 0)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => finishPointerDrag(event, pointerDragRef.current?.velocity ?? 0)}
            onLostPointerCapture={(event) => finishPointerDrag(event, 0)}
          >
            {dragHandle}
          </div>
        ) : null}
        {renderedScrim != null ? (
          <div className="three-pane-scaffold__scrim" style={{ opacity: scrimOpacity }}>
            {renderedScrim}
          </div>
        ) : null}
      </div>
    </div>
  );
}
