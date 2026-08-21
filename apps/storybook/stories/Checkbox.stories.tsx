import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: 'Checkbox label',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function StateStack({ disabled = false }: { disabled?: boolean }) {
  return (
    <div className="m3-storybook-stack">
      <Checkbox isDisabled={disabled}>Unchecked</Checkbox>
      <Checkbox isDisabled={disabled} isSelected>
        Checked
      </Checkbox>
      <Checkbox isDisabled={disabled} isIndeterminate>
        Indeterminate
      </Checkbox>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <Checkbox {...args} />
    </div>
  ),
};

export const Selected: Story = {
  args: {
    defaultSelected: true,
    children: 'Selected checkbox',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <Checkbox {...args} />
    </div>
  ),
};

export const Indeterminate: Story = {
  args: {
    isIndeterminate: true,
    children: 'Indeterminate checkbox',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <Checkbox {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <StateStack />
    </div>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <StateStack disabled />
    </div>
  ),
};

export const ControlOnly: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <div className="m3-storybook-stack">
        <Checkbox aria-label="Unchecked control" />
        <Checkbox aria-label="Checked control" isSelected />
        <Checkbox aria-label="Indeterminate control" isIndeterminate />
      </div>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="m3-storybook-theme-grid">
      <ThemeProvider className="m3-storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <StateStack />
      </ThemeProvider>
      <ThemeProvider className="m3-storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <StateStack />
      </ThemeProvider>
      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <StateStack />
      </ThemeProvider>
      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <StateStack />
      </ThemeProvider>
    </div>
  ),
};
