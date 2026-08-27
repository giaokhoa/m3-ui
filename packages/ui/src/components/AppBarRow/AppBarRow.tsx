import {
  cloneElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { IconButton, IconToggleButton } from '../IconButton';
import { Menu, MenuItem } from '../Menu';
import { PlainTooltip, TooltipTrigger } from '../Tooltip';
import {
  normalizeMaxItemCount,
  resolveAppBarRowLayout,
  type AppBarRowLayout,
} from './AppBarRow.layout';
import type {
  AppBarAction,
  AppBarActionItem,
  AppBarRowProps,
  AppBarToggleItem,
} from './AppBarRow.types';
import './app-bar-row.css';

const defaultOverflowWidth = 48;

function itemKey(item: AppBarAction, index: number) {
  if (item.id) return item.id;
  if (item.type === 'custom') return item.id;
  return `${item.type}:${item.label}:${index}`;
}

function initialLayout(items: readonly AppBarAction[], maxItemCount?: number) {
  const maxCount = normalizeMaxItemCount(maxItemCount);
  if (items.length > maxCount) {
    const inlineCount = Math.max(0, maxCount - 1);
    return {
      inlineCount,
      overflowCount: items.length - inlineCount,
      hasOverflow: true,
    } satisfies AppBarRowLayout;
  }
  return {
    inlineCount: items.length,
    overflowCount: 0,
    hasOverflow: false,
  } satisfies AppBarRowLayout;
}

function sameLayout(a: AppBarRowLayout, b: AppBarRowLayout) {
  return (
    a.inlineCount === b.inlineCount &&
    a.overflowCount === b.overflowCount &&
    a.hasOverflow === b.hasOverflow
  );
}

function MoreVertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="app-bar-row__overflow-icon"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function BuiltInInlineItem({ item }: { item: AppBarActionItem | AppBarToggleItem }) {
  const control =
    item.type === 'action' ? (
      <IconButton
        aria-label={item.label}
        isDisabled={item.isDisabled}
        onPress={item.onPress}
      >
        {item.icon}
      </IconButton>
    ) : (
      <IconToggleButton
        aria-label={item.label}
        isDisabled={item.isDisabled}
        isSelected={item.isSelected}
        onChange={item.onChange}
      >
        {item.icon}
      </IconToggleButton>
    );

  return (
    <TooltipTrigger>
      {control}
      <PlainTooltip>{item.label}</PlainTooltip>
    </TooltipTrigger>
  );
}

function BuiltInOverflowItem({
  item,
  id,
}: {
  item: AppBarActionItem | AppBarToggleItem;
  id: string;
}) {
  return (
    <MenuItem
      id={id}
      isDisabled={item.isDisabled}
      leading={item.icon}
      textValue={item.label}
      trailing={
        item.type === 'toggle' && item.isSelected ? (
          <span aria-hidden="true" className="app-bar-row__toggle-state">
            ✓
          </span>
        ) : undefined
      }
    >
      {item.label}
    </MenuItem>
  );
}

export function AppBarRow({
  items,
  maxItemCount,
  overflowLabel = 'More actions',
  overflowTrigger,
  className,
  ...props
}: AppBarRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemWidthsRef = useRef(new Map<string, number>());
  const overflowWidthRef = useRef<number | null>(null);
  const [layout, setLayout] = useState<AppBarRowLayout>(() =>
    initialLayout(items, maxItemCount),
  );
  const [isMenuOpen, setMenuOpen] = useState(false);
  const keys = useMemo(
    () => items.map((item, index) => itemKey(item, index)),
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
        .querySelectorAll<HTMLElement>('[data-app-bar-row-item-index]')
        .forEach((node) => {
          const index = Number(node.dataset.appBarRowItemIndex);
          const key = keys[index];
          if (!key) return;
          itemWidthsRef.current.set(key, node.getBoundingClientRect().width);
        });

      const overflowNode = root.querySelector<HTMLElement>(
        '[data-app-bar-row-overflow-trigger]',
      );
      if (overflowNode) {
        overflowWidthRef.current = overflowNode.getBoundingClientRect().width;
      }

      const widths = keys.map((key) => itemWidthsRef.current.get(key));
      const allMeasured = widths.every(
        (width): width is number => width !== undefined && Number.isFinite(width),
      );
      const maxCount = normalizeMaxItemCount(maxItemCount);
      const countOverflows = items.length > maxCount;

      const next = allMeasured
        ? resolveAppBarRowLayout({
            availableWidth: root.clientWidth,
            itemWidths: widths,
            overflowWidth: overflowWidthRef.current ?? defaultOverflowWidth,
            maxItemCount,
          })
        : countOverflows
          ? initialLayout(items, maxItemCount)
          : ({
              inlineCount: items.length,
              overflowCount: 0,
              hasOverflow: false,
            } satisfies AppBarRowLayout);

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
        '[data-app-bar-row-item-index], [data-app-bar-row-overflow-trigger]',
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
  const menuActions = new Map<string, AppBarActionItem | AppBarToggleItem>();

  overflowItems.forEach((item, offset) => {
    if (item.type === 'custom') return;
    const absoluteIndex = layout.inlineCount + offset;
    menuActions.set(`app-bar-row:${keys[absoluteIndex]}`, item);
  });

  const trigger = overflowTrigger?.({ isOpen: isMenuOpen }) ?? (
    <IconButton aria-label={overflowLabel}>
      <MoreVertIcon />
    </IconButton>
  );

  let overflowContent: ReactNode = null;
  if (layout.hasOverflow) {
    overflowContent = (
      <span
        className="app-bar-row__overflow"
        data-app-bar-row-overflow-trigger="true"
      >
        <Menu
          aria-label={overflowLabel}
          isOpen={isMenuOpen}
          onOpenChange={setMenuOpen}
          placement="bottom end"
          trigger={trigger}
          onAction={(key) => {
            const item = menuActions.get(String(key));
            if (!item || item.isDisabled) return;
            if (item.type === 'action') item.onPress();
            else item.onChange(!item.isSelected);
            dismiss();
          }}
        >
          {overflowItems.map((item, offset) => {
            const absoluteIndex = layout.inlineCount + offset;
            const key = keys[absoluteIndex] ?? `item-${absoluteIndex}`;
            if (item.type === 'custom') {
              return cloneElement(item.renderOverflow({ dismiss }), { key });
            }
            return (
              <BuiltInOverflowItem
                key={key}
                id={`app-bar-row:${key}`}
                item={item}
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
      className={className ? `app-bar-row ${className}` : 'app-bar-row'}
      data-inline-count={layout.inlineCount}
      data-overflow-count={layout.overflowCount}
      data-overflow={layout.hasOverflow || undefined}
    >
      {inlineItems.map((item, index) => {
        const key = keys[index] ?? `item-${index}`;
        return (
          <span
            key={key}
            className="app-bar-row__item"
            data-app-bar-row-item-index={index}
          >
            {item.type === 'custom' ? (
              item.renderInline()
            ) : (
              <BuiltInInlineItem item={item} />
            )}
          </span>
        );
      })}
      {overflowContent}
    </div>
  );
}
