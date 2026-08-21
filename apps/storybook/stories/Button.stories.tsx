import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: 'Filled button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <Button {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: 'Disabled button',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <Button {...args} />
    </div>
  ),
};

export const ContentLengths: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <div className="m3-storybook-stack">
        <Button>OK</Button>
        <Button>Filled button</Button>
        <Button>A considerably longer button label</Button>
        <Button isDisabled>Disabled button</Button>
      </div>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="m3-storybook-theme-grid">
      <ThemeProvider className="m3-storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <Button>Filled button</Button>
      </ThemeProvider>

      <ThemeProvider className="m3-storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <Button>Filled button</Button>
      </ThemeProvider>

      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <Button>Filled button</Button>
      </ThemeProvider>

      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <Button>Filled button</Button>
      </ThemeProvider>
    </div>
  ),
};
