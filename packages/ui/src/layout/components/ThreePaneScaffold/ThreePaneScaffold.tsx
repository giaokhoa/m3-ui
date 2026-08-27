import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
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
}

interface ScaffoldGeometry {
  width: number;
  height: number;
  viewportLeft: number;
  viewportTop: number;
  direction: 'ltr' | 'rtl';
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

export function ThreePaneScaffold({
  directive,
  value,
  paneOrder,
  primaryPane,
  secondaryPane,
  tertiaryPane,
  preferredWidths,
  preferredHeights,
  className,
  style,
  ...props
}: ThreePaneScaffoldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paneRefs = useRef<Partial<Record<ThreePaneScaffoldRole, HTMLDivElement>>>({});
  const [geometry, setGeometry] = useState<ScaffoldGeometry>(emptyGeometry);

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
  });

  const panes: Array<[ThreePaneScaffoldRole, ReactNode, PanePlacement | undefined]> = [
    ['primary', primaryPane, layout.primary],
    ['secondary', secondaryPane, layout.secondary],
    ['tertiary', tertiaryPane, layout.tertiary],
  ];

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
    </div>
  );
}
