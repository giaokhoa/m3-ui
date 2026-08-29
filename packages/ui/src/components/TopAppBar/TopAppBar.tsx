import clsx from 'clsx';
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  clampScrollFraction,
  getTopAppBarStyle,
  topAppBarRuntime,
  type TopAppBarStyleOptions,
  type TopAppBarVariant,
} from './TopAppBar.defaults';
import './top-app-bar.css';

export interface TopAppBarState {
  collapsedFraction: number;
  overlappedFraction: number;
  contentOffset?: number;
}

export type TopAppBarScrollBehaviorType =
  | 'pinned'
  | 'enter-always'
  | 'exit-until-collapsed';

export interface TopAppBarScrollBehavior {
  type: TopAppBarScrollBehaviorType;
  state: TopAppBarState;
}

export function createTopAppBarState(
  collapsedFraction = 0,
  contentOffset = 0,
  overlappedFraction = collapsedFraction,
): TopAppBarState {
  return {
    collapsedFraction: clampScrollFraction(collapsedFraction),
    overlappedFraction: clampScrollFraction(overlappedFraction),
    contentOffset,
  };
}

export function pinnedTopAppBarScrollBehavior(
  state: TopAppBarState,
): TopAppBarScrollBehavior {
  return { type: 'pinned', state };
}

export function enterAlwaysTopAppBarScrollBehavior(
  state: TopAppBarState,
): TopAppBarScrollBehavior {
  return { type: 'enter-always', state };
}

export function exitUntilCollapsedTopAppBarScrollBehavior(
  state: TopAppBarState,
): TopAppBarScrollBehavior {
  return { type: 'exit-until-collapsed', state };
}

export const TopAppBarDefaults = {
  createState: createTopAppBarState,
  pinnedScrollBehavior: pinnedTopAppBarScrollBehavior,
  enterAlwaysScrollBehavior: enterAlwaysTopAppBarScrollBehavior,
  exitUntilCollapsedScrollBehavior: exitUntilCollapsedTopAppBarScrollBehavior,
} as const;

export interface TopAppBarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'color'>,
    TopAppBarStyleOptions {
  title: ReactNode;
  subtitle?: ReactNode;
  navigationIcon?: ReactNode;
  actions?: ReactNode;
  variant?: TopAppBarVariant;
  scrollFraction?: number;
  overlappedFraction?: number;
  state?: TopAppBarState;
  scrollBehavior?: TopAppBarScrollBehavior;
}

interface CenterTitleLayout {
  inlineStart: number;
  width: number;
}

function isTwoRowVariant(variant: TopAppBarVariant) {
  return (
    variant === 'medium' ||
    variant === 'medium-flexible' ||
    variant === 'large' ||
    variant === 'large-flexible'
  );
}

function supportsSubtitle(variant: TopAppBarVariant) {
  return variant === 'medium-flexible' || variant === 'large-flexible';
}

function useCenterTitleLayout(enabled: boolean, dependencies: readonly unknown[]) {
  const rootRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CenterTitleLayout | null>(null);

  useLayoutEffect(() => {
    if (!enabled) {
      setLayout(null);
      return;
    }

    const root = rootRef.current;
    const navigation = navigationRef.current;
    const actions = actionsRef.current;
    const titleGroup = titleRef.current;
    if (!root || !navigation || !actions || !titleGroup) return;

    const update = () => {
      const contentWidth = Math.max(
        0,
        root.clientWidth - topAppBarRuntime.horizontalPadding * 2,
      );
      const start = Math.max(
        topAppBarRuntime.titleInset - topAppBarRuntime.horizontalPadding,
        navigation.getBoundingClientRect().width,
      );
      const end = actions.getBoundingClientRect().width;
      const maxTitleWidth = Math.max(0, contentWidth - start - end);
      const title = titleGroup.querySelector<HTMLElement>(
        '.top-app-bar__collapsed-title',
      );
      const naturalTitleWidth = title?.scrollWidth ?? titleGroup.scrollWidth;
      const titleWidth = Math.min(naturalTitleWidth, maxTitleWidth);

      let titleX = (contentWidth - titleWidth) / 2;
      if (titleX < start) {
        titleX = start;
      } else if (titleX + titleWidth > contentWidth - end) {
        titleX = contentWidth - end - titleWidth;
      }

      const next = {
        inlineStart: topAppBarRuntime.horizontalPadding + Math.max(0, titleX),
        width: titleWidth,
      };
      setLayout((current) =>
        current &&
        Math.abs(current.inlineStart - next.inlineStart) < 0.01 &&
        Math.abs(current.width - next.width) < 0.01
          ? current
          : next,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(navigation);
    observer.observe(actions);
    observer.observe(titleGroup);
    return () => observer.disconnect();
    // Slot identity is intentionally included so layout is recalculated when
    // callers replace leading/trailing/title content without a resize.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  return { rootRef, navigationRef, actionsRef, titleRef, layout };
}

export function TopAppBar({
  title,
  subtitle,
  navigationIcon,
  actions,
  variant = 'small',
  scrollFraction,
  overlappedFraction,
  state,
  scrollBehavior,
  containerColor,
  scrolledContainerColor,
  titleColor,
  subtitleColor,
  navigationIconColor,
  actionIconColor,
  className,
  style,
  ...props
}: TopAppBarProps) {
  const effectiveState = scrollBehavior?.state ?? state;
  const fraction = clampScrollFraction(
    scrollFraction ?? effectiveState?.collapsedFraction ?? 0,
  );
  const overlap = clampScrollFraction(
    overlappedFraction ?? effectiveState?.overlappedFraction ?? fraction,
  );
  const twoRow = isTwoRowVariant(variant);
  const showSubtitle = supportsSubtitle(variant) && subtitle !== undefined;
  const centered = variant === 'center-aligned';
  const center = useCenterTitleLayout(centered, [title, navigationIcon, actions]);
  const appBarStyle = {
    ...getTopAppBarStyle(
      variant,
      fraction,
      showSubtitle,
      {
        containerColor,
        scrolledContainerColor,
        titleColor,
        subtitleColor,
        navigationIconColor,
        actionIconColor,
      },
      overlap,
    ),
    ...style,
  } as CSSProperties;
  const visuallyScrolled = twoRow ? fraction > 0 : overlap > 0.01;
  const centerTitleStyle = center.layout
    ? ({
        insetInlineStart: `${center.layout.inlineStart}px`,
        inlineSize: `${center.layout.width}px`,
      } satisfies CSSProperties)
    : undefined;

  return (
    <header
      {...props}
      ref={center.rootRef}
      className={clsx('top-app-bar', className)}
      data-variant={variant}
      data-scroll-fraction={fraction}
      data-overlapped-fraction={overlap}
      data-scrolled={visuallyScrolled ? true : undefined}
      data-collapsed={fraction >= 1 ? true : undefined}
      data-scroll-behavior={scrollBehavior?.type}
      data-center-layout={center.layout ? true : undefined}
      style={appBarStyle}
    >
      <div className="top-app-bar__top-row">
        <div ref={center.navigationRef} className="top-app-bar__navigation">
          {navigationIcon}
        </div>
        <div
          ref={center.titleRef}
          className="top-app-bar__collapsed-title-group"
          style={centerTitleStyle}
        >
          <div className="top-app-bar__collapsed-title">{title}</div>
          {showSubtitle ? (
            <div className="top-app-bar__collapsed-subtitle">{subtitle}</div>
          ) : null}
        </div>
        <div ref={center.actionsRef} className="top-app-bar__actions">
          {actions}
        </div>
      </div>
      {twoRow ? (
        <div
          className="top-app-bar__expanded-row"
          aria-hidden={fraction >= 1 || undefined}
        >
          <div className="top-app-bar__expanded-title-group">
            <div className="top-app-bar__expanded-title">{title}</div>
            {showSubtitle ? (
              <div className="top-app-bar__expanded-subtitle">{subtitle}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
