import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DockedEdge,
  DragToResizeState,
  ListDetailPaneScaffold,
  ListDetailPaneScaffoldRole,
  PaneAdaptStrategy,
  PaneAlignment,
  calculatePaneScaffoldDirective,
  calculateThreePaneScaffoldValueFromDirective,
  calculateWindowAdaptiveInfo,
  listDetailPaneScaffoldAdaptStrategies,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/DragToResizePaneSemantics',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function NoHandleFixture() {
  const width = 720;
  const height = 640;
  const [dragToResizeState] = useState(
    () => new DragToResizeState({ dockedEdge: DockedEdge.Bottom }),
  );
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const value = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: {
      ...listDetailPaneScaffoldAdaptStrategies,
      tertiary: PaneAdaptStrategy.Levitate({
        alignment: PaneAlignment.BottomCenter,
        dragToResizeState,
      }).onlyIfSinglePane(directive),
    },
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Extra }],
  });

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        value={value}
        preferredWidths={{ tertiary: width }}
        preferredHeights={{ tertiary: height / 2 }}
        listPane={<div>List</div>}
        detailPane={<div>Detail</div>}
        extraPane={
          <div style={{ height: '100%', padding: 24, boxSizing: 'border-box' }}>
            <h2 style={{ marginTop: 0 }}>Resizable pane</h2>
            <button type="button" data-testid="inner-action">
              Inner action
            </button>
          </div>
        }
      />
    </div>
  );
}

export const NoHandle: Story = {
  render: () => <NoHandleFixture />,
};
