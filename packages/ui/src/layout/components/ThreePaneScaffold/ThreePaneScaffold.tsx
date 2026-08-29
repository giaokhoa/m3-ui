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
import {
  getPaneExpansionHandleAriaState,
  type PaneExpansionHandleAriaStrings,
} from './paneExpansionSemantics';
import { applyPaneMargins, type PaneMargins } from './paneMargins';
import type { PanePreferredSize } from './preferredPaneSize';
import {
  calculateThreePaneScaffoldLayout,
  type PanePlacement,
  type ThreePaneScaffoldLayout,
} from './ThreePaneScaffold.layout';
import {
  getPredictiveBackScale,
  getPredictiveBackScaffoldStyle,
} from './ThreePaneScaffold.predictiveBack';
import {
  calculateThreePaneScaffoldTransitionDuration,
  calculateThreePaneScaffoldTransitionFrame,
  captureThreePaneScaffoldTransitionOrigin,
  interpolateThreePaneScaffoldTransitionFrames,
  type PaneTransitionFrame,
  type ThreePaneScaffoldTransitionFrame,
} from './ThreePaneScaffold.transition';
import { useDefaultPaneExpansionState } from './useDefaultPaneExpansionState';
import './three-pane-scaffold.css';

export type LevitatedPaneDragHandle =
  | ReactNode
  | ((state: DragToResizeState) => ReactNode);

export interface ThreePaneScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  directive: PaneScaffoldDirective;
  /** Static adapted value. Provide exactly one of value or scaffoldState. */
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
}

interface ResizePointerDrag {
  pointerId: number;
  state: DragToResizeState;
  lastX: number;
  lastY: number;
  accumulated: number;
  dragging: boolean;
}

const emptyGeometry: ScaffoldGeometry = {
  width: 0,
  height: 0,
  viewportLeft: 0,
  viewportTop: 0,
  direction: 'ltr',
};

const noStoreSubscribe = () => () => {};
const noStoreSnapshot = () => 0;
const ResizePointerSlop = 4;
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
  paneExpansionHandleAriaLabel = 'Resize panes',
  paneExpansionHandleAriaStrings,
  paneAriaLabels,
  levitatedPaneDragHandles,
  levitatedPaneDragHandleAriaLabel = 'Resize pane',
  levitatedPaneDragHandleAriaStrings,
  className,
  style,
  ...props
}: ThreePaneScaffoldProps) {
  if ((value === undefined) === (scaffoldState === undefined)) {
    throw new Error('ThreePaneScaffold requires exactly one of value or scaffoldState');
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<Partial<Record<ThreePaneScaffoldRole, HTMLDivElement>>>({});
  const pointerDragRef = useRef<PointerDrag | null>(null);
  const resizePointerDragRef = useRef<ResizePointerDrag | null>(null);
  const previousTargetValueRef = useRef<ThreePaneScaffoldValue | null>(null);
  const renderedTransitionFrameRef = useRef<ThreePaneScaffoldTransitionFrame | undefined>(
    undefined,
  );
  const retargetOriginFrameRef = useRef<ThreePaneScaffoldTransitionFrame | undefined>(undefined);
  const retargetTargetValueRef = useRef<ThreePaneScaffoldValue | null>(null);
  const [geometry, setGeometry] = useState<ScaffoldGeometry>(emptyGeometry);

  useSyncExternalStore(
    scaffoldState?.subscribe ?? noStoreSubscribe,
    scaffoldState?.getSnapshot ?? noStoreSnapshot,
    scaffoldState?.getSnapshot ?? noStoreSnapshot,
  );

  const targetValue = scaffoldState?.targetState ?? value!;
  const defaultExpansionState = useDefaultPaneExpansionState(
    targetValue,
    paneExpansionDragHandle != null,
  );
  const expansionState = paneExpansionState ?? defaultExpansionState;
  const currentValue = scaffoldState?.currentState ?? targetValue;
  const transitionActive =
    scaffoldState !== undefined &&
    !threePaneScaffoldValuesEqual(currentValue, targetValue);

  const paneEntries: Array<[ThreePaneScaffoldRole, ReactNode]> = [
    ['primary', primaryPane],
    ['secondary', secondaryPane],
    ['tertiary', tertiaryPane],
  ];
  const activeResizeState = paneEntries
    .map(([role]) => getPaneAdaptedValue(targetValue, role))
    .find((paneValue) => paneValue.type === 'levitated' && paneValue.dragToResizeState != null);
  const resizeState =
    activeResizeState?.type === 'levitated' ? activeResizeState.dragToResizeState : undefined;

  useSyncExternalStore(
    expansionState.subscribe,
    expansionState.getSnapshot,
    expansionState.getSnapshot,
  );
  useSyncExternalStore(
    resizeState?.subscribe ?? noStoreSubscribe,
    resizeState?.getSnapshot ?? noStoreSnapshot,
    resizeState?.getSnapshot ?? noStoreSnapshot,
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root === null || typeof window === 'undefined') return;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const predictiveScale = Number(root.dataset.predictiveBackScale ?? 1);
      const width = rect.width / predictiveScale;
      const height = rect.height / predictiveScale;
      const next: ScaffoldGeometry = {
        width,
        height,
        viewportLeft: rect.left - (width - rect.width) / 2,
        viewportTop: rect.top - (height - rect.height) / 2,
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
    if (
      !directive.shouldAutoFocusCurrentDestination ||
      targetValue.currentDestination === undefined
    ) {
      return;
    }
    paneRefs.current[targetValue.currentDestination]?.focus({ preventScroll: true });
  }, [directive.shouldAutoFocusCurrentDestination, targetValue.currentDestination]);

  useLayoutEffect(() => {
    if (!(scaffoldState instanceof MutableThreePaneScaffoldState) || geometry.width <= 0) {
      return;
    }
    return scaffoldState.setTransitionDurationResolver((from, to) => {
      const localExcludedBounds: LayoutBounds[] = directive.excludedBounds.map((bound) => ({
        left: bound.left - geometry.viewportLeft,
        top: bound.top - geometry.viewportTop,
        right: bound.right - geometry.viewportLeft,
        bottom: bound.bottom - geometry.viewportTop,
      }));
      return calculateThreePaneScaffoldTransitionDuration({
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
      });
    });
  }, [
    scaffoldState,
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

  const calculateTransitionFrameAt = (progressFraction: number) =>
    calculateThreePaneScaffoldTransitionFrame({
      width: geometry.width,
      height: geometry.height,
      directive,
      currentValue,
      targetValue,
      progressFraction,
      paneOrder,
      direction: geometry.direction,
      excludedBounds,
      preferredWidths,
      preferredHeights,
      paneMargins,
      paneExpansionState: expansionState,
    });

  const rawTransitionFrame =
    transitionActive && scaffoldState !== undefined
      ? calculateTransitionFrameAt(scaffoldState.progressFraction)
      : undefined;
  let transitionFrame = rawTransitionFrame;

  if (transitionActive && scaffoldState !== undefined && rawTransitionFrame !== undefined) {
    const previousTargetValue = previousTargetValueRef.current;
    if (
      previousTargetValue !== null &&
      !threePaneScaffoldValuesEqual(previousTargetValue, targetValue) &&
      renderedTransitionFrameRef.current !== undefined
    ) {
      retargetOriginFrameRef.current = captureThreePaneScaffoldTransitionOrigin(
        renderedTransitionFrameRef.current,
        calculateTransitionFrameAt(0),
      );
      retargetTargetValueRef.current = targetValue;
    }

    if (
      retargetOriginFrameRef.current !== undefined &&
      retargetTargetValueRef.current !== null &&
      threePaneScaffoldValuesEqual(retargetTargetValueRef.current, targetValue)
    ) {
      transitionFrame = interpolateThreePaneScaffoldTransitionFrames(
        retargetOriginFrameRef.current,
        calculateTransitionFrameAt(1),
        scaffoldState.progressFraction,
      );
    }
  } else {
    retargetOriginFrameRef.current = undefined;
    retargetTargetValueRef.current = null;
  }

  previousTargetValueRef.current = targetValue;
  renderedTransitionFrameRef.current = transitionFrame;

  const physicalOrder = geometry.direction === 'rtl' ? [...paneOrder].reverse() : [...paneOrder];
  const expandedRoles = physicalOrder.filter(
    (role) => getPaneAdaptedValue(targetValue, role).type === 'expanded',
  );
  const showDragHandle =
    !transitionActive && paneExpansionDragHandle != null && expandedRoles.length === 2;
  const expansionLayout = expansionState.getLayoutState(geometry.width, geometry.direction);
  const transitionScrimBlocks =
    transitionFrame?.scrim != null && transitionFrame.scrimOpacity > 0;
  const hasBlockingScrim = transitionScrimBlocks || hasLevitatedPaneWithScrim(targetValue);

  let dragHandleOffset = PaneExpansionUnspecified;
  if (showDragHandle) {
    if (expansionLayout.currentDraggingOffset !== PaneExpansionUnspecified) {
      dragHandleOffset = expansionLayout.currentDraggingOffset;
    } else {
      const firstPlacement = getPlacement(layout, expandedRoles[0]!);
      const secondPlacement = getPlacement(layout, expandedRoles[1]!);
      if (firstPlacement !== undefined && secondPlacement !== undefined) {
        dragHandleOffset =
          (firstPlacement.left + firstPlacement.width + secondPlacement.left) / 2;
      } else if (firstPlacement !== undefined) {
        dragHandleOffset = geometry.width;
      } else if (secondPlacement !== undefined) {
        dragHandleOffset = 0;
      }
    }
  }

  useLayoutEffect(() => {
    if (
      showDragHandle &&
      dragHandleOffset !== PaneExpansionUnspecified &&
      !expansionState.isDraggingOrSettling
    ) {
      expansionState.onExpansionOffsetMeasured(dragHandleOffset);
    }
  }, [dragHandleOffset, expansionState, showDragHandle]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      hasBlockingScrim ||
      !event.isPrimary ||
      event.button !== 0 ||
      dragHandleOffset === PaneExpansionUnspecified
    ) {
      return;
    }
    event.preventDefault();
    expansionState.onExpansionOffsetMeasured(dragHandleOffset);
    expansionState.beginDrag();
    pointerDragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = pointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.lastX;
    const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
    drag.velocity = (delta / elapsed) * 1000;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    expansionState.dispatchRawDelta(delta);
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>, velocity: number) => {
    const drag = pointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;
    pointerDragRef.current = null;
    expansionState.endDrag(velocity);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (hasBlockingScrim || dragHandleOffset === PaneExpansionUnspecified) return;

    if (event.key === 'Enter' || event.key === ' ') {
      if (expansionState.nextAnchor === null) return;
      event.preventDefault();
      expansionState.moveToNextAnchor();
      return;
    }

    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    expansionState.onExpansionOffsetMeasured(dragHandleOffset);
    expansionState.beginDrag();
    expansionState.dispatchRawDelta(event.key === 'ArrowLeft' ? -16 : 16);
    expansionState.endDrag(0);
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
      dragging: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = resizePointerDragRef.current;
    if (drag === null || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    const axisDelta = drag.state.orientation === 'horizontal' ? deltaX : deltaY;

    if (!drag.dragging) {
      drag.accumulated += axisDelta;
      if (Math.abs(drag.accumulated) < ResizePointerSlop) return;
      drag.dragging = true;
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
    if (!cancelled && !drag.dragging) drag.state.moveToNextState();
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
  const dragHandlePercent =
    dragHandleOffset === PaneExpansionUnspecified || geometry.width <= 0
      ? 0
      : Math.round((dragHandleOffset / geometry.width) * 100);
  const dragHandleAriaState = getPaneExpansionHandleAriaState(
    expansionState,
    paneExpansionHandleAriaStrings,
  );
  const predictiveBackScale = getPredictiveBackScale(scaffoldState);

  return (
    <div
      {...props}
      ref={rootRef}
      className={['three-pane-scaffold', className].filter(Boolean).join(' ')}
      data-predictive-back-scale={predictiveBackScale}
      style={getPredictiveBackScaffoldStyle(style, scaffoldState)}
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
              : calculateLevitatedPanePlacement({
                  width: geometry.width,
                  height: geometry.height,
                  directive,
                  alignment: adaptedValue.alignment,
                  direction: geometry.direction,
                  preferredWidth: resized.width,
                  preferredHeight: resized.height,
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
        const interactable =
          !staticallyHidden &&
          isPaneInteractable(targetValue, role) &&
          !(transitionScrimBlocks && adaptedValue.type !== 'levitated');
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
        const resizeHandleSpec = levitatedPaneDragHandles?.[role];
        const resizeHandle =
          paneResizeState === undefined
            ? undefined
            : typeof resizeHandleSpec === 'function'
              ? resizeHandleSpec(paneResizeState)
              : resizeHandleSpec;
        const hasResizeHandle =
          !transitionActive && paneResizeState !== undefined && resizeHandle != null;
        const paneResizeHandlers =
          !transitionActive && paneResizeState !== undefined && !hasResizeHandle
            ? {
                onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) =>
                  resizeKeyDown(event, paneResizeState),
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
              className={[
                'three-pane-scaffold__pane',
                frameLevitated && 'three-pane-scaffold__pane--levitated',
                hasResizeHandle && 'three-pane-scaffold__pane--has-resize-handle',
                !transitionActive && paneResizeState !== undefined && !hasResizeHandle &&
                  'three-pane-scaffold__pane--resize-target',
              ]
                .filter(Boolean)
                .join(' ')}
              role={interactable ? 'region' : undefined}
              aria-label={interactable ? paneAriaLabel : undefined}
              data-pane-role={role}
              data-pane-adapted-value={adaptedValue.type}
              data-pane-interactable={interactable}
              data-pane-motion={frame?.motion}
              data-resize-state={paneResizeState?.value}
              inert={!interactable || undefined}
              tabIndex={-1}
              style={frame === undefined ? paneStyle(placement) : transitionPaneStyle(frame)}
            >
              {hasResizeHandle ? (
                <div
                  className="three-pane-scaffold__levitated-resize-handle"
                  data-orientation={paneResizeState.orientation}
                  data-resize-state={paneResizeState.value}
                  role="button"
                  aria-label={levitatedPaneDragHandleAriaLabel}
                  aria-description={paneResizeAriaState?.description}
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
          role="separator"
          aria-label={paneExpansionHandleAriaLabel}
          aria-description={dragHandleAriaState.description}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={dragHandlePercent}
          aria-valuetext={dragHandleAriaState.valueText}
          inert={hasBlockingScrim || undefined}
          tabIndex={hasBlockingScrim ? -1 : 0}
          style={{ left: dragHandleOffset }}
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
        <div
          className="three-pane-scaffold__scrim"
          style={{ opacity: scrimOpacity }}
        >
          {renderedScrim}
        </div>
      ) : null}
    </div>
  );
}
