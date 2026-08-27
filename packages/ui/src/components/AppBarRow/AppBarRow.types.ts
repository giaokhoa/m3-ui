import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

interface AppBarLabeledItemBase {
  /** Optional stable identity. Labels are used as the fallback key for built-in items. */
  id?: string;
  label: string;
  icon: ReactNode;
  isDisabled?: boolean;
}

export interface AppBarActionItem extends AppBarLabeledItemBase {
  type: 'action';
  onPress: () => void;
}

export interface AppBarToggleItem extends AppBarLabeledItemBase {
  type: 'toggle';
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
}

export interface AppBarCustomOverflowContext {
  dismiss: () => void;
}

export interface AppBarCustomItem {
  type: 'custom';
  /** Custom items require explicit identity because they do not have a built-in label. */
  id: string;
  renderInline: () => ReactNode;
  renderOverflow: (context: AppBarCustomOverflowContext) => ReactElement;
}

export type AppBarAction =
  | AppBarActionItem
  | AppBarToggleItem
  | AppBarCustomItem;

export interface AppBarOverflowTriggerRenderProps {
  isOpen: boolean;
}

export interface AppBarRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly AppBarAction[];
  /**
   * Maximum number of row slots, including the overflow trigger when overflow
   * exists. Values below 1 are normalized to 1.
   */
  maxItemCount?: number;
  /** Accessible label for the default overflow icon button and overflow menu. */
  overflowLabel?: string;
  /**
   * Optional interactive trigger renderer. Return a focusable button-like
   * element; React Aria Menu owns keyboard activation, positioning and focus
   * restoration.
   */
  overflowTrigger?: (
    props: AppBarOverflowTriggerRenderProps,
  ) => ReactElement;
}
