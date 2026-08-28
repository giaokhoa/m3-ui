import type { ReactNode } from 'react';
import { listDetailPaneScaffoldOrder } from '../../adaptive/threePaneScaffold';
import {
  ThreePaneScaffold,
  type ThreePaneScaffoldProps,
} from '../ThreePaneScaffold';

export interface ListDetailPaneScaffoldProps
  extends Omit<
    ThreePaneScaffoldProps,
    'paneOrder' | 'primaryPane' | 'secondaryPane' | 'tertiaryPane'
  > {
  listPane: ReactNode;
  detailPane: ReactNode;
  extraPane?: ReactNode;
}

/** Material canonical list-detail layout: List, Detail, Extra from start to end. */
export function ListDetailPaneScaffold({
  listPane,
  detailPane,
  extraPane,
  ...props
}: ListDetailPaneScaffoldProps) {
  return (
    <ThreePaneScaffold
      {...props}
      paneOrder={listDetailPaneScaffoldOrder}
      primaryPane={detailPane}
      secondaryPane={listPane}
      tertiaryPane={extraPane}
    />
  );
}
