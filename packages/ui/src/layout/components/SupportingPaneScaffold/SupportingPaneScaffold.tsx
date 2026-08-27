import type { HTMLAttributes, ReactNode } from 'react';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  supportingPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { ThreePaneScaffold } from '../ThreePaneScaffold';

export interface SupportingPaneScaffoldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  directive: PaneScaffoldDirective;
  value: ThreePaneScaffoldValue;
  mainPane: ReactNode;
  supportingPane: ReactNode;
  extraPane?: ReactNode;
}

/** Material canonical supporting-pane layout: Main, Supporting, Extra from start to end. */
export function SupportingPaneScaffold({
  directive,
  value,
  mainPane,
  supportingPane,
  extraPane,
  ...props
}: SupportingPaneScaffoldProps) {
  return (
    <ThreePaneScaffold
      {...props}
      directive={directive}
      value={value}
      paneOrder={supportingPaneScaffoldOrder}
      primaryPane={mainPane}
      secondaryPane={supportingPane}
      tertiaryPane={extraPane}
    />
  );
}
