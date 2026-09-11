import type { ReactNode } from 'react';
import { supportingPaneScaffoldOrder } from '../../adaptive/threePaneScaffold';
import {
  ThreePaneScaffold,
  type ThreePaneScaffoldProps,
} from '../ThreePaneScaffold';

export interface SupportingPaneScaffoldProps
  extends Omit<
    ThreePaneScaffoldProps,
    'paneOrder' | 'primaryPane' | 'secondaryPane' | 'tertiaryPane'
  > {
  mainPane: ReactNode;
  supportingPane: ReactNode;
  extraPane?: ReactNode;
}

/** Material canonical supporting-pane layout: Main, Supporting, Extra from start to end. */
export function SupportingPaneScaffold({
  mainPane,
  supportingPane,
  extraPane,
  ...props
}: SupportingPaneScaffoldProps) {
  return (
    <ThreePaneScaffold
      {...props}
      paneOrder={supportingPaneScaffoldOrder}
      primaryPane={mainPane}
      secondaryPane={supportingPane}
      tertiaryPane={extraPane}
    />
  );
}
