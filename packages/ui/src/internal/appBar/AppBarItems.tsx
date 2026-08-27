import type { ReactNode } from 'react';
import { IconButton, IconToggleButton } from '../../components/IconButton';
import { MenuItem } from '../../components/Menu';
import { PlainTooltip, TooltipTrigger } from '../../components/Tooltip';
import type {
  AppBarAction,
  AppBarActionItem,
  AppBarToggleItem,
} from '../../components/AppBarRow/AppBarRow.types';

export function getAppBarItemKey(item: AppBarAction, index: number) {
  if (item.id) return item.id;
  return item.type === 'custom' ? item.id : `${item.type}:${item.label}:${index}`;
}

export function AppBarBuiltInInlineItem({
  item,
}: {
  item: AppBarActionItem | AppBarToggleItem;
}) {
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

export function AppBarBuiltInOverflowItem({
  item,
  id,
  toggleStateClassName,
}: {
  item: AppBarActionItem | AppBarToggleItem;
  id: string;
  toggleStateClassName: string;
}) {
  return (
    <MenuItem
      id={id}
      isDisabled={item.isDisabled}
      leading={item.icon}
      textValue={item.label}
      trailing={
        item.type === 'toggle' && item.isSelected ? (
          <span aria-hidden="true" className={toggleStateClassName}>
            ✓
          </span>
        ) : undefined
      }
    >
      {item.label}
    </MenuItem>
  );
}

export function activateAppBarBuiltInItem(
  item: AppBarActionItem | AppBarToggleItem | undefined,
) {
  if (!item || item.isDisabled) return false;
  if (item.type === 'action') item.onPress();
  else item.onChange(!item.isSelected);
  return true;
}

export function AppBarOverflowIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

export type AppBarOverflowMenuActionMap = Map<
  string,
  AppBarActionItem | AppBarToggleItem
>;

export function buildAppBarOverflowActionMap(
  items: readonly AppBarAction[],
  keys: readonly string[],
  inlineCount: number,
  idPrefix: string,
): AppBarOverflowMenuActionMap {
  const actions: AppBarOverflowMenuActionMap = new Map();
  items.slice(inlineCount).forEach((item, offset) => {
    if (item.type === 'custom') return;
    const key = keys[inlineCount + offset];
    if (key) actions.set(`${idPrefix}:${key}`, item);
  });
  return actions;
}

export type AppBarRenderedOverflow = ReactNode;
