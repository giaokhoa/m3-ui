import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  PaneAdaptedValue,
  ThreePaneScaffold,
  ThreePaneScaffoldRole,
  preferredPaneSizeProportion,
  supportingPaneScaffoldOrder,
  type PaneScaffoldDirective,
  type ThreePaneScaffoldValue,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/PreferredPaneSize',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const directive: PaneScaffoldDirective = {
  maxHorizontalPartitions: 2,
  horizontalPartitionSpacerSize: '24px',
  maxVerticalPartitions: 1,
  verticalPartitionSpacerSize: '24px',
  defaultPanePreferredWidth: '360px',
  defaultPanePreferredHeight: '420px',
  excludedBounds: [],
  shouldAutoFocusCurrentDestination: true,
};

const value: ThreePaneScaffoldValue = {
  primary: PaneAdaptedValue.Expanded,
  secondary: PaneAdaptedValue.Expanded,
  tertiary: PaneAdaptedValue.Hidden,
  currentDestination: ThreePaneScaffoldRole.Primary,
};

function Pane({ label }: { label: string }) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      {label}
    </div>
  );
}

export const WidthProportion: Story = {
  render: () => (
    <div style={{ height: 500, margin: '0 auto', maxWidth: '100%', width: 1000 }}>
      <ThreePaneScaffold
        data-testid="preferred-size-scaffold"
        directive={directive}
        value={value}
        paneOrder={supportingPaneScaffoldOrder}
        primaryPane={<Pane label="Primary" />}
        secondaryPane={<Pane label="Secondary" />}
        tertiaryPane={<Pane label="Tertiary" />}
        preferredWidths={{
          primary: 300,
          secondary: preferredPaneSizeProportion(0.4),
        }}
      />
    </div>
  ),
};
