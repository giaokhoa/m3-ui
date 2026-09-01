import { describe, expectTypeOf, it } from 'vitest';
import type { ListDetailPaneScaffoldProps } from '../ListDetailPaneScaffold/ListDetailPaneScaffold';
import type { SupportingPaneScaffoldProps } from '../SupportingPaneScaffold/SupportingPaneScaffold';
import type { ThreePaneScaffoldProps } from './ThreePaneScaffold';

describe('canonical pane transition forwarding', () => {
  it('keeps ListDetailPaneScaffold on the ThreePaneScaffold transition contract', () => {
    expectTypeOf<ListDetailPaneScaffoldProps['paneTransitions']>().toEqualTypeOf<
      ThreePaneScaffoldProps['paneTransitions']
    >();
  });

  it('keeps SupportingPaneScaffold on the ThreePaneScaffold transition contract', () => {
    expectTypeOf<SupportingPaneScaffoldProps['paneTransitions']>().toEqualTypeOf<
      ThreePaneScaffoldProps['paneTransitions']
    >();
  });
});
