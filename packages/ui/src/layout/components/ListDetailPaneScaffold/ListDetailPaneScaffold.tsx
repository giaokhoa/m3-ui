import type { HTMLAttributes, ReactNode } from 'react';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { ThreePaneScaffold } from '../ThreePaneScaffold';

export interface ListDetailPaneScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  directive: PaneScaffoldDirective;
  value: ThreePaneScaffoldValue;
  listPane: ReactNode;
  detailPane: ReactNode;
  extraPane?: ReactNode;
}

/** Material canonical list-detail layout: List, Detail, Extra from start to end. */
export function ListDetailPaneScaffold({
  directive,
  value,
  listPane,
  detailPane,
  extraPane,
  ...props
}: ListDetailPaneScaffoldProps) {
  return (
    <ThreePaneScaffold
      {...props}
      directive={directive}
      value={value}
      paneOrder={listDetailPaneScaffoldOrder}
      primaryPane={detailPane}
      secondaryPane={listPane}
      tertiaryPane={extraPane}
    />
  );
}
