import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  PaneAdaptedValue,
  ThreePaneScaffold,
  ThreePaneScaffoldRole,
  listDetailPaneScaffoldOrder,
  type PaneScaffoldDirective,
  type ThreePaneScaffoldValue,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/PaneMargins',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const width = 1000;
const height = 560;
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

const paneMargins = {
  primary: {
    inlineEnd: 56,
    blockStart: 32,
    blockEnd: 48,
  },
  secondary: {
    inlineStart: 40,
    blockStart: 16,
    blockEnd: 24,
  },
} as const;

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

function PaneMarginsFixture({ direction }: { direction: 'ltr' | 'rtl' }) {
  return (
    <div style={{ height, margin: '0 auto', maxWidth: '100%', width }}>
      <ThreePaneScaffold
        data-testid="pane-margins-scaffold"
        dir={direction}
        directive={directive}
        value={value}
        paneOrder={listDetailPaneScaffoldOrder}
        primaryPane={<Pane label="Primary" />}
        secondaryPane={<Pane label="Secondary" />}
        tertiaryPane={<Pane label="Tertiary" />}
        paneMargins={paneMargins}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <PaneMarginsFixture direction="ltr" />,
};

export const Rtl: Story = {
  render: () => <PaneMarginsFixture direction="rtl" />,
};
