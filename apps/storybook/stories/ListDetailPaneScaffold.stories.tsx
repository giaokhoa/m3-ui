import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface, VerticalDragHandle } from '@m3-ui/ui';
import {
  ListDetailPaneScaffold,
  ListDetailPaneScaffoldRole,
  PaneExpansionAnchor,
  PaneExpansionState,
  calculatePaneScaffoldDirective,
  calculateThreePaneScaffoldValueFromDirective,
  calculateWindowAdaptiveInfo,
  listDetailPaneScaffoldAdaptStrategies,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/ListDetailPaneScaffold',
  component: ListDetailPaneScaffold,
  parameters: { layout: 'fullscreen' },
  args: {
    directive: calculatePaneScaffoldDirective(
      calculateWindowAdaptiveInfo({ width: 1000, height: 720 }),
    ),
    value: calculateThreePaneScaffoldValueFromDirective(
      calculatePaneScaffoldDirective(
        calculateWindowAdaptiveInfo({ width: 1000, height: 720 }),
      ),
      {
        adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
        destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
      },
    ),
    listPane: null,
    detailPane: null,
  },
} satisfies Meta<typeof ListDetailPaneScaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

function Pane({ title, children }: { title: string; children: string }) {
  return (
    <Surface style={{ height: '100%', padding: 24, boxSizing: 'border-box' }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p>{children}</p>
    </Surface>
  );
}

function Fixture({
  width,
  height = 640,
  resizable = false,
}: {
  width: number;
  height?: number;
  resizable?: boolean;
}) {
  const [paneExpansionState] = useState(
    () =>
      new PaneExpansionState({
        anchors: [
          PaneExpansionAnchor.proportion(0.3),
          PaneExpansionAnchor.proportion(0.5),
          PaneExpansionAnchor.proportion(0.7),
        ],
        initialAnchoredIndex: 1,
      }),
  );
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const value = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
  });

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        value={value}
        listPane={<Pane title="List">Inbox conversations</Pane>}
        detailPane={<Pane title="Detail">Selected conversation</Pane>}
        extraPane={<Pane title="Extra">Context and metadata</Pane>}
        paneExpansionState={resizable ? paneExpansionState : undefined}
        paneExpansionDragHandle={
          resizable
            ? (state) => <VerticalDragHandle isDragged={state.isDragging} />
            : undefined
        }
      />
    </div>
  );
}

export const Compact: Story = {
  render: () => <Fixture width={480} />,
};

export const Expanded: Story = {
  render: () => <Fixture width={1000} />,
};

export const Resizable: Story = {
  render: () => <Fixture width={1000} resizable />,
};

export const ExtraLarge: Story = {
  render: () => <Fixture width={1680} />,
};

export const Rtl: Story = {
  render: () => (
    <div dir="rtl">
      <Fixture width={1000} />
    </div>
  ),
};
