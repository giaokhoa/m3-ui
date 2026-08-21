import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioButton, RadioGroup, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    value: 'option',
    children: 'Radio label',
  },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function StateGroup({ disabled = false }: { disabled?: boolean }) {
  return (
    <RadioGroup
      aria-label={disabled ? 'Disabled radio states' : 'Radio states'}
      defaultValue="selected"
      isDisabled={disabled}
    >
      <RadioButton value="selected">Selected</RadioButton>
      <RadioButton value="unselected">Unselected</RadioButton>
    </RadioGroup>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <RadioGroup aria-label="Default radio" defaultValue="option">
        <RadioButton {...args} />
      </RadioGroup>
    </div>
  ),
};

export const Unselected: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <RadioGroup aria-label="Unselected radio">
        <RadioButton {...args} />
      </RadioGroup>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <StateGroup />
    </div>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <StateGroup disabled />
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <RadioGroup aria-label="Read-only radio group" defaultValue="selected" isReadOnly>
        <RadioButton value="selected">Selected</RadioButton>
        <RadioButton value="other">Other</RadioButton>
      </RadioGroup>
    </div>
  ),
};

export const HorizontalGroup: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <RadioGroup
        label="Delivery speed"
        description="Choose one option"
        defaultValue="standard"
        orientation="horizontal"
      >
        <RadioButton value="standard">Standard</RadioButton>
        <RadioButton value="express">Express</RadioButton>
        <RadioButton value="overnight">Overnight</RadioButton>
      </RadioGroup>
    </div>
  ),
};

export const ControlOnly: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <RadioGroup aria-label="Control-only radios" defaultValue="selected">
        <RadioButton aria-label="Selected control" value="selected" />
        <RadioButton aria-label="Unselected control" value="unselected" />
      </RadioGroup>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="m3-storybook-theme-grid">
      <ThemeProvider className="m3-storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <StateGroup />
      </ThemeProvider>
      <ThemeProvider className="m3-storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <StateGroup />
      </ThemeProvider>
      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <StateGroup />
      </ThemeProvider>
      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <StateGroup />
      </ThemeProvider>
    </div>
  ),
};
