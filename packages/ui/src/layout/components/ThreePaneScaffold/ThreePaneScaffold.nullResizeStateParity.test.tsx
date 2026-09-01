import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  PaneAlignment,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { ThreePaneScaffold } from './ThreePaneScaffold';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 1,
  horizontalPartitionSpacerSize: '0px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('ThreePaneScaffold nullable resize state parity', () => {
  it('treats structural null as no levitated resize state', () => {
    const value = {
      primary: {
        type: 'levitated',
        alignment: PaneAlignment.Center,
        dragToResizeState: null,
      },
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    } as unknown as ThreePaneScaffoldValue;

    const markup = renderToStaticMarkup(
      <ThreePaneScaffold
        directive={directive}
        value={value}
        paneOrder={listDetailPaneScaffoldOrder}
        primaryPane={<span>Pane</span>}
        secondaryPane={false}
      />,
    );

    expect(markup).toContain('data-pane-role="primary"');
    expect(markup).not.toContain('three-pane-scaffold__pane--resize-target');
    expect(markup).not.toContain('three-pane-scaffold__levitated-resize-action');
    expect(markup).not.toContain('data-resize-state=');
  });
});