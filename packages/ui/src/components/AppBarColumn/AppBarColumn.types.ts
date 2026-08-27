import type { HTMLAttributes, ReactElement } from 'react';
import type {
  AppBarAction,
  AppBarOverflowTriggerRenderProps,
} from '../AppBarRow/AppBarRow.types';

export interface AppBarColumnProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly AppBarAction[];
  /** Maximum slots including the overflow trigger when overflow exists. */
  maxItemCount?: number;
  /** Accessible label for the default overflow icon button and overflow menu. */
  overflowLabel?: string;
  /** Uses the same trigger render contract as AppBarRow. */
  overflowTrigger?: (
    props: AppBarOverflowTriggerRenderProps,
  ) => ReactElement;
}
