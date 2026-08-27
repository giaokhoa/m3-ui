import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface } from '@m3-ui/ui';
import {
  SupportingPaneScaffold,
  SupportingPaneScaffoldRole,
  calculatePaneScaffoldDirective,
  calculateThreePaneScaffoldValueFromDirective,
  calculateWindowAdaptiveInfo,
  supportingPaneScaffoldAdaptStrategies,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/SupportingPaneScaffold',
  component: SupportingPaneScaffold,
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
        adaptStrategies: supportingPaneScaffoldAdaptStrategies,
        destinationHistory: [{ pane: SupportingPaneScaffoldRole.Main }],
      },
    ),
    mainPane: null,
    supportingPane: null,
  },
} satisfies Meta<typeof SupportingPaneScaffold>;

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

function Fixture({ width, height }: { width: number; height: number }) {
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const value = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: supportingPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: SupportingPaneScaffoldRole.Main }],
  });

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <SupportingPaneScaffold
        directive={directive}
        value={value}
        mainPane={<Pane title="Main">Primary task content</Pane>}
        supportingPane={<Pane title="Supporting">Secondary tools and context</Pane>}
        extraPane={<Pane title="Extra">Additional information</Pane>}
      />
    </div>
  );
}

export const CompactExpandedHeightReflow: Story = {
  render: () => <Fixture width={480} height={960} />,
};

export const Expanded: Story = {
  render: () => <Fixture width={1000} height={720} />,
};

export const Large: Story = {
  render: () => <Fixture width={1280} height={720} />,
};

export const Rtl: Story = {
  render: () => (
    <div dir="rtl">
      <Fixture width={1000} height={720} />
    </div>
  ),
};
