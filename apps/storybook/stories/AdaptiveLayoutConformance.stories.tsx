import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationSuiteScaffold } from '@m3-ui/ui/layout';

const items = [
  {
    selected: true,
    icon: <span aria-hidden="true">H</span>,
    label: 'Home',
    ariaLabel: 'Home',
  },
  {
    selected: false,
    icon: <span aria-hidden="true">S</span>,
    label: 'Search',
    ariaLabel: 'Search',
  },
];

const meta = {
  title: 'Conformance/AdaptiveLayout',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MeasuredWindow: Story = {
  render: () => (
    <div style={{ minHeight: '100vh' }}>
      <NavigationSuiteScaffold items={items}>
        <main style={{ minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}>
          Adaptive body
        </main>
      </NavigationSuiteScaffold>
    </div>
  ),
};
