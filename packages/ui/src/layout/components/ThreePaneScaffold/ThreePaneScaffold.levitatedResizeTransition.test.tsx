import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DockedEdge, DragToResizeState } from '../../adaptive/dragToResizeState';
import { defaultPaneScaffoldDirective } from '../../adaptive/paneScaffoldDirective';
import {
  PaneAdaptedValue,
  PaneAlignment,
  type ThreePaneScaffoldValue,
} from '../../adaptive/threePaneScaffold';
import type { ThreePaneScaffoldState } from '../../adaptive/threePaneScaffoldState';
import { ThreePaneScaffold } from './ThreePaneScaffold';

const paneOrder = ['primary', 'secondary', 'tertiary'] as const;

function value(primary: ThreePaneScaffoldValue['primary']): ThreePaneScaffoldValue {
  return {
    primary,
    secondary: PaneAdaptedValue.Hidden,
    tertiary: PaneAdaptedValue.Hidden,
  };
}

function transitioningToLevitated(resizeState: DragToResizeState): ThreePaneScaffoldState {
  const currentState = value(PaneAdaptedValue.Expanded);
  const targetState = value(
    PaneAdaptedValue.Levitated(PaneAlignment.Center, undefined, resizeState),
  );
  return {
    currentState,
    targetState,
    progressFraction: 0.5,
    isPredictiveBackInProgress: false,
    subscribe: () => () => {},
    getSnapshot: () => 0,
  };
}

describe('ThreePaneScaffold levitated resize transition parity', () => {
  it('keeps a custom resize handle composed while the target pane is levitated', () => {
    const resizeState = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    const markup = renderToStaticMarkup(
      <ThreePaneScaffold
        directive={defaultPaneScaffoldDirective}
        scaffoldState={transitioningToLevitated(resizeState)}
        paneOrder={paneOrder}
        primaryPane={<span>Primary content</span>}
        secondaryPane={null}
        levitatedPaneDragHandles={{ primary: <span>Resize handle</span> }}
      />,
    );

    expect(markup).toContain('three-pane-scaffold__levitated-resize-handle');
    expect(markup).toContain('Resize handle');
  });

  it('keeps the no-handle resize semantics action while the target pane is levitated', () => {
    const resizeState = new DragToResizeState({ dockedEdge: DockedEdge.Start });
    const markup = renderToStaticMarkup(
      <ThreePaneScaffold
        directive={defaultPaneScaffoldDirective}
        scaffoldState={transitioningToLevitated(resizeState)}
        paneOrder={paneOrder}
        primaryPane={<span>Primary content</span>}
        secondaryPane={null}
      />,
    );

    expect(markup).toContain('three-pane-scaffold__levitated-resize-action');
  });
});