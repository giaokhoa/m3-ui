import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Checkbox,
  RadioButton,
  RadioGroup,
  ThemeProvider,
  type RippleFocusIndication,
} from '@m3/ui';

const meta = {
  title: 'Foundations/RippleFocus',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Samples({ rippleFocus }: { rippleFocus: RippleFocusIndication }) {
  return (
    <ThemeProvider rippleFocus={rippleFocus}>
      <div
        data-ripple-focus-preview={rippleFocus}
        style={{
          display: 'flex',
          minHeight: 240,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 32,
          background: 'var(--surface)',
          color: 'var(--on-surface)',
        }}
      >
        <Button>Button</Button>
        <Checkbox defaultSelected>Checkbox</Checkbox>
        <RadioGroup aria-label="Ripple focus radio" defaultValue="selected">
          <RadioButton value="selected">Radio</RadioButton>
        </RadioGroup>
      </div>
    </ThemeProvider>
  );
}

export const Opacity: Story = {
  render: () => <Samples rippleFocus="opacity" />,
};

export const InsetRing: Story = {
  render: () => <Samples rippleFocus="inset-ring" />,
};

export const Comparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, padding: 24 }}>
      <Samples rippleFocus="opacity" />
      <Samples rippleFocus="inset-ring" />
    </div>
  ),
};
