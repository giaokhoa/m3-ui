import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  PaneAdaptedValue,
  ThreePaneScaffold,
  ThreePaneScaffoldRole,
  VerticalDragHandle,
  calculatePaneScaffoldDirective,
  calculateWindowAdaptiveInfo,
  listDetailPaneScaffoldOrder,
  type ThreePaneScaffoldValue,
} from '@m3-ui/ui';

const meta = {
  title: 'Layout/PaneExpansionStateKeying',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const primarySecondaryValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
  currentDestination: ThreePaneScaffoldRole.Primary,
};

const primaryTertiaryValue: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Hidden,
  tertiary: PaneAdaptedValue.Expanded,
  currentDestination: ThreePaneScaffoldRole.Tertiary,
};

function Pane({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {label}
    </div>
  );
}

function KeyedDefaultStateFixture() {
  const width = 1000;
  const height = 560;
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const [value, setValue] = useState(primarySecondaryValue);

  return (
    <div style={{ margin: '0 auto', maxWidth: '100%', width }}>
      <div style={{ display: 'flex', gap: 8, padding: 8 }}>
        <button type="button" onClick={() => setValue(primarySecondaryValue)}>
          Show primary + secondary
        </button>
        <button type="button" onClick={() => setValue(primaryTertiaryValue)}>
          Show primary + tertiary
        </button>
      </div>
      <div style={{ height }}>
        <ThreePaneScaffold
          directive={directive}
          value={value}
          paneOrder={listDetailPaneScaffoldOrder}
          primaryPane={<Pane label="Primary" />}
          secondaryPane={<Pane label="Secondary" />}
          tertiaryPane={<Pane label="Tertiary" />}
          paneExpansionDragHandle={(state) => (
            <VerticalDragHandle
              aria-hidden="true"
              data-testid="keyed-expansion-handle-visual"
              isDragged={state.isDraggingOrSettling}
            />
          )}
        />
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <KeyedDefaultStateFixture />,
};
