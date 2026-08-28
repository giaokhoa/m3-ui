import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  PaneExpansionState,
  PaneExpansionUnspecified,
} from '../../adaptive/paneExpansionState';
import type { LayoutBounds, PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  getPaneAdaptedValue,
  type ThreePaneScaffoldHorizontalOrder,
  type ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import {
  calculateThreePaneScaffoldLayout,
  type PanePlacement,
  type ThreePaneScaffoldLayout,
} from './ThreePaneScaffold.layout';
import './three-pane-scaffold.css';

export interface ThreePaneScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  directive: PaneScaffoldDirective;
  value: ThreePaneScaffoldValue;
  paneOrder: ThreePaneScaffoldHorizontalOrder;
  primaryPane: ReactNode;
  secondaryPane: ReactNode;
  tertiaryPane?: ReactNode;
  preferredWidths?: Partial<Record<ThreePaneScaffoldRole, number>>;
  preferredHeights?: Partial<Record<ThreePaneScaffoldRole, number>>;
  paneExpansionState?: PaneExpansionState;
  paneExpansionDragHandle?: ReactNode | ((state: PaneExpansionState) => ReactNode);
  paneExpansionHandleAriaLabel?: string;
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

const emptyGeometry: ScaffoldGeometry = {
  width: 0,
  height: 0,
  viewportLeft: 0,
  viewportTop: 0,
  direction: 'ltr',
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

function getPlacement(layout: ThreePaneScaffoldLayout, role: ThreePaneScaffoldRole) {
  return layout[role];
}

export function ThreePaneScaffold({
  directive,
  value,
  paneOrder,
  primaryPane,
  secondaryPane,
  tertiaryPane,
  preferredWidths,
  preferredHeights,
  paneExpansionState,
  paneExpansionDragHandle,
  paneExpansionHandleAriaLabel = 'Resize panes',
  className,
  style,
  ...props
}: ThreePaneScaffoldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<Partial<Record<ThreePaneScaffoldRole, HTMLDivElement>>>({});
  const pointerDragRef = useRef<PointerDrag | null>(null);
  const [geometry, setGeometry] = useState<ScaffoldGeometry>(emptyGeometry);
  const [defaultExpansionState] = useState(() => new PaneExpansionState());
  const expansionState = paneExpansionState ?? defaultExpansionState;

  useSyncExternalStore(
    expansionState.subscribe,
    expansionState.getSnapshot,
    expansionState.getSnapshot,
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
    if (!directive.shouldAutoFocusCurrentDestination || value.currentDestination === undefined) {
      return;
    }
    paneRefs.current[value.currentDestination]?.focus({ preventScroll: true });
  }, [directive.shouldAutoFocusCurrentDestination, value.currentDestination]);

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
    value,
    paneOrder,
    direction: geometry.direction,
    excludedBounds,
    preferredWidths,
    preferredHeights,
    paneExpansionState: expansionState,
  });

  const physicalOrder = geometry.direction === 'rtl' ? [...paneOrder].reverse() : [...paneOrder];
  const expandedRoles = physicalOrder.filter(
    (role) => getPaneAdaptedValue(value, role).type === 'expanded',
  );
  const showDragHandle = paneExpansionDragHandle != null && expandedRoles.length === 2;
  const expansionLayout = expansionState.getLayoutState(geometry.width, geometry.direction);

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
    if (
      (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
      dragHandleOffset === PaneExpansionUnspecified
    ) {
      return;
    }
    event.preventDefault();
    expansionState.onExpansionOffsetMeasured(dragHandleOffset);
    expansionState.beginDrag();
    expansionState.dispatchRawDelta(event.key === 'ArrowLeft' ? -16 : 16);
    expansionState.endDrag(0);
  };

  const panes: Array<[ThreePaneScaffoldRole, ReactNode, PanePlacement | undefined]> = [
    ['primary', primaryPane, layout.primary],
    ['secondary', secondaryPane, layout.secondary],
    ['tertiary', tertiaryPane, layout.tertiary],
  ];

  const dragHandle =
    typeof paneExpansionDragHandle === 'function'
      ? paneExpansionDragHandle(expansionState)
      : paneExpansionDragHandle;
  const dragHandlePercent =
    dragHandleOffset === PaneExpansionUnspecified || geometry.width <= 0
      ? 0
      : Math.round((dragHandleOffset / geometry.width) * 100);

  return (
    <div
      {...props}
      ref={rootRef}
      className={['three-pane-scaffold', className].filter(Boolean).join(' ')}
      style={style}
    >
      {panes.map(([role, content, placement]) => {
        const adaptedValue = getPaneAdaptedValue(value, role);
        if (content == null || adaptedValue.type === 'hidden' || placement === undefined) return null;
        return (
          <div
            key={role}
            ref={(node) => {
              if (node === null) delete paneRefs.current[role];
              else paneRefs.current[role] = node;
            }}
            className="three-pane-scaffold__pane"
            data-pane-role={role}
            data-pane-adapted-value={adaptedValue.type}
            tabIndex={-1}
            style={paneStyle(placement)}
          >
            {content}
          </div>
        );
      })}
      {showDragHandle && dragHandleOffset !== PaneExpansionUnspecified ? (
        <div
          className="three-pane-scaffold__drag-handle"
          role="separator"
          aria-label={paneExpansionHandleAriaLabel}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={dragHandlePercent}
          tabIndex={0}
          style={{ left: dragHandleOffset }}
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
    </div>
  );
}
