import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: 'Switch label',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 8.2 6.5 11 12.5 4.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function StateSet({ disabled = false }: { disabled?: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Switch isDisabled={disabled}>Unchecked</Switch>
      <Switch defaultSelected isDisabled={disabled}>
        Checked
      </Switch>
      <Switch isDisabled={disabled} thumbContent={<CheckIcon />}>
        Unchecked with icon
      </Switch>
      <Switch defaultSelected isDisabled={disabled} thumbContent={<CheckIcon />}>
        Checked with icon
      </Switch>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="storybook-center">
      <Switch {...args} />
    </div>
  ),
};

export const Checked: Story = {
  render: (args) => (
    <div className="storybook-center">
      <Switch {...args} defaultSelected />
    </div>
  ),
};

export const WithThumbContent: Story = {
  render: () => (
    <div className="storybook-center">
      <StateSet />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="storybook-center">
      <StateSet />
    </div>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <div className="storybook-center">
      <StateSet disabled />
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div className="storybook-center">
      <Switch defaultSelected isReadOnly>
        Read-only
      </Switch>
    </div>
  ),
};

export const ControlOnly: Story = {
  render: () => (
    <div className="storybook-center">
      <Switch aria-label="Airplane mode" />
    </div>
  ),
};

export const FocusModes: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light" rippleFocus="opacity">
        <h3>Opacity focus</h3>
        <Switch>Opacity switch</Switch>
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        rippleFocus="inset-ring"
      >
        <h3>Inset ring</h3>
        <Switch>Inset switch</Switch>
      </ThemeProvider>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <StateSet />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <StateSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <StateSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <StateSet />
      </ThemeProvider>
    </div>
  ),
};
