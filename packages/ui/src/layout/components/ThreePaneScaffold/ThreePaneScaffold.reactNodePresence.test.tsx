import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DockedEdge,
  DragToResizeState,
} from '../../adaptive/dragToResizeState';
import type { PaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  PaneAlignment,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import { ThreePaneScaffold } from './ThreePaneScaffold';

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '0px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

describe('ThreePaneScaffold rendered-content presence parity', () => {
  it('does not create a pane measurable for a boolean React conditional', () => {
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Expanded,
      secondary: PaneAdaptedValue.Expanded,
      tertiary: PaneAdaptedValue.Hidden,
    };

    const markup = renderToStaticMarkup(
      <ThreePaneScaffold
        directive={directive}
        value={value}
        paneOrder={listDetailPaneScaffoldOrder}
        primaryPane={false}
        secondaryPane={<span>Secondary</span>}
      />,
    );

    expect(markup).not.toContain('data-pane-role="primary"');
    expect(markup).toContain('data-pane-role="secondary"');
  });

  it('falls back to whole-pane resize when the visual resize handle is empty', () => {
    const resizeState = new DragToResizeState({ dockedEdge: DockedEdge.Bottom });
    const value: ThreePaneScaffoldValue = {
      primary: PaneAdaptedValue.Levitated(
        PaneAlignment.BottomCenter,
        undefined,
        resizeState,
      ),
      secondary: PaneAdaptedValue.Hidden,
      tertiary: PaneAdaptedValue.Hidden,
    };

    const markup = renderToStaticMarkup(
      <ThreePaneScaffold
        directive={directive}
        value={value}
        paneOrder={listDetailPaneScaffoldOrder}
        primaryPane={<span>Pane</span>}
        secondaryPane={false}
        levitatedPaneDragHandles={{ primary: false }}
      />,
    );

    expect(markup).toContain('three-pane-scaffold__pane--resize-target');
    expect(markup).not.toContain('three-pane-scaffold__levitated-resize-handle');
  });
});
