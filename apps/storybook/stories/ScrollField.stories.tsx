import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollField, ThemeProvider } from '@m3-ui/ui';

const meta = { title: 'Components/ScrollField', component: ScrollField } satisfies Meta<typeof ScrollField>;
export default meta;
type Story = StoryObj<typeof meta>;

const values = ['00', '01', '02', '03', '04', '05'];

export const Uncontrolled: Story = {
  args: { items: values, defaultSelectedIndex: 2, 'aria-label': 'Minutes' },
};

export function Controlled() {
  const [selected, setSelected] = useState(1);
  return (
    <div>
      <div data-testid="controlled-value">{selected}</div>
      <ScrollField
        data-testid="scroll-field"
        items={values}
        selectedIndex={selected}
        onSelectionChange={setSelected}
        aria-label="Controlled minutes"
      />
    </div>
  );
}

export const Disabled: Story = {
  args: { items: values, defaultSelectedIndex: 3, isDisabled: true, 'aria-label': 'Disabled minutes' },
};

export const CustomLabels: Story = {
  args: {
    itemCount: 4,
    defaultSelectedIndex: 1,
    renderItem: (index) => ['Mercury', 'Venus', 'Earth', 'Mars'][index],
    getItemText: (index) => `Planet ${['Mercury', 'Venus', 'Earth', 'Mars'][index]}`,
    'aria-label': 'Planet',
  },
};

export const LongLabels: Story = {
  args: {
    items: ['A very long option label that must stay centered', 'Second long option label for resizing', 'Third option'],
    defaultSelectedIndex: 0,
    'aria-label': 'Long labels',
    style: { width: 280 },
  },
};

export const ReducedMotion: Story = {
  args: { items: values, defaultSelectedIndex: 4, 'aria-label': 'Reduced motion minutes' },
  parameters: { chromatic: { prefersReducedMotion: 'reduce' } },
};

export const Rtl: Story = {
  args: { items: values, defaultSelectedIndex: 2, 'aria-label': 'RTL minutes', dir: 'rtl' },
};

export const FocusModes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <ThemeProvider rippleFocus="opacity">
        <ScrollField
          data-testid="scroll-field-opacity-focus"
          items={values}
          defaultSelectedIndex={2}
          aria-label="Opacity focus minutes"
        />
      </ThemeProvider>
      <ThemeProvider rippleFocus="inset-ring">
        <ScrollField
          data-testid="scroll-field-inset-focus"
          items={values}
          defaultSelectedIndex={2}
          aria-label="Inset ring focus minutes"
        />
      </ThemeProvider>
    </div>
  ),
};
