import {
  cloneElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { IconButton } from '../IconButton';
import { Menu } from '../Menu';
import {
  activateAppBarBuiltInItem,
  AppBarBuiltInInlineItem,
  AppBarBuiltInOverflowItem,
  AppBarOverflowIcon,
  buildAppBarOverflowActionMap,
  getAppBarItemKey,
} from '../../internal/appBar/AppBarItems';
import { normalizeAppBarMaxItemCount } from '../../internal/appBar/appBarLayout';
import {
  resolveAppBarColumnLayout,
  type AppBarColumnLayout,
} from './AppBarColumn.layout';
import type { AppBarAction } from '../AppBarRow/AppBarRow.types';
import type { AppBarColumnProps } from './AppBarColumn.types';
import './app-bar-column.css';

const defaultOverflowHeight = 48;

function initialLayout(items: readonly AppBarAction[], maxItemCount?: number) {
  const maxCount = normalizeAppBarMaxItemCount(maxItemCount);
  if (items.length > maxCount) {
    const inlineCount = Math.max(0, maxCount - 1);
    return {
      inlineCount,
      overflowCount: items.length - inlineCount,
      hasOverflow: true,
    } satisfies AppBarColumnLayout;
  }
  return {
    inlineCount: items.length,
    overflowCount: 0,
    hasOverflow: false,
  } satisfies AppBarColumnLayout;
}

function sameLayout(a: AppBarColumnLayout, b: AppBarColumnLayout) {
  return (
    a.inlineCount === b.inlineCount &&
    a.overflowCount === b.overflowCount &&
    a.hasOverflow === b.hasOverflow
  );
}

export function AppBarColumn({
  items,
  maxItemCount,
  overflowLabel = 'More actions',
  overflowTrigger,
  className,
  ...props
}: AppBarColumnProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemHeightsRef = useRef(new Map<string, number>());
  const overflowHeightRef = useRef<number | null>(null);
  const [layout, setLayout] = useState<AppBarColumnLayout>(() =>
    initialLayout(items, maxItemCount),
  );
  const [isMenuOpen, setMenuOpen] = useState(false);
  const keys = useMemo(
    () => items.map((item, index) => getAppBarItemKey(item, index)),
    [items],
  );
  const signature = keys.join('\u001f');

  useLayoutEffect(() => {
    setLayout((current) => {
      const next = initialLayout(items, maxItemCount);
      return sameLayout(current, next) ? current : next;
    });
  }, [items.length, maxItemCount, signature]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      root
        .querySelectorAll<HTMLElement>('[data-app-bar-column-item-index]')
        .forEach((node) => {
          const index = Number(node.dataset.appBarColumnItemIndex);
          const key = keys[index];
          if (!key) return;
          itemHeightsRef.current.set(key, node.getBoundingClientRect().height);
        });

      const overflowNode = root.querySelector<HTMLElement>(
        '[data-app-bar-column-overflow-trigger]',
      );
      if (overflowNode) {
        overflowHeightRef.current = overflowNode.getBoundingClientRect().height;
      }

      const heights = keys.map((key) => itemHeightsRef.current.get(key));
      const allMeasured = heights.every(
        (height): height is number =>
          height !== undefined && Number.isFinite(height),
      );
      const maxCount = normalizeAppBarMaxItemCount(maxItemCount);
      const countOverflows = items.length > maxCount;

      const next = allMeasured
        ? resolveAppBarColumnLayout({
            availableHeight: root.clientHeight,
            itemHeights: heights,
            overflowHeight: overflowHeightRef.current ?? defaultOverflowHeight,
            maxItemCount,
          })
        : countOverflows
          ? initialLayout(items, maxItemCount)
          : ({
              inlineCount: items.length,
              overflowCount: 0,
              hasOverflow: false,
            } satisfies AppBarColumnLayout);

      setLayout((current) => (sameLayout(current, next) ? current : next));
    };

    const scheduleUpdate = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(root);
    root
      .querySelectorAll<HTMLElement>(
        '[data-app-bar-column-item-index], [data-app-bar-column-overflow-trigger]',
      )
      .forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items, keys, layout.hasOverflow, layout.inlineCount, maxItemCount]);

  useEffect(() => {
    if (!layout.hasOverflow) setMenuOpen(false);
  }, [layout.hasOverflow]);

  const dismiss = () => setMenuOpen(false);
  const inlineItems = items.slice(0, layout.inlineCount);
  const overflowItems = items.slice(layout.inlineCount);
  const menuActions = buildAppBarOverflowActionMap(
    items,
    keys,
    layout.inlineCount,
    'app-bar-column',
  );

  const trigger = overflowTrigger?.({ isOpen: isMenuOpen }) ?? (
    <IconButton aria-label={overflowLabel}>
      <AppBarOverflowIcon className="app-bar-column__overflow-icon" />
    </IconButton>
  );

  let overflowContent: ReactNode = null;
  if (layout.hasOverflow) {
    overflowContent = (
      <span
        className="app-bar-column__overflow"
        data-app-bar-column-overflow-trigger="true"
      >
        <Menu
          aria-label={overflowLabel}
          isOpen={isMenuOpen}
          onOpenChange={setMenuOpen}
          placement="bottom end"
          trigger={trigger}
          onAction={(key) => {
            if (activateAppBarBuiltInItem(menuActions.get(String(key)))) dismiss();
          }}
        >
          {overflowItems.map((item, offset) => {
            const absoluteIndex = layout.inlineCount + offset;
            const key = keys[absoluteIndex] ?? `item-${absoluteIndex}`;
            if (item.type === 'custom') {
              return cloneElement(item.renderOverflow({ dismiss }), { key });
            }
            return (
              <AppBarBuiltInOverflowItem
                key={key}
                id={`app-bar-column:${key}`}
                item={item}
                toggleStateClassName="app-bar-column__toggle-state"
              />
            );
          })}
        </Menu>
      </span>
    );
  }

  return (
    <div
      {...props}
      ref={rootRef}
      className={className ? `app-bar-column ${className}` : 'app-bar-column'}
      data-inline-count={layout.inlineCount}
      data-overflow-count={layout.overflowCount}
      data-overflow={layout.hasOverflow || undefined}
    >
      {inlineItems.map((item, index) => {
        const key = keys[index] ?? `item-${index}`;
        return (
          <span
            key={key}
            className="app-bar-column__item"
            data-app-bar-column-item-index={index}
          >
            {item.type === 'custom' ? (
              item.renderInline()
            ) : (
              <AppBarBuiltInInlineItem item={item} />
            )}
          </span>
        );
      })}
      {overflowContent}
    </div>
  );
}
