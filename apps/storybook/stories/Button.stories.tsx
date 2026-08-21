import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  TextButton,
  ThemeProvider,
} from '@m3/ui';

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

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M3 20.5v-17L22 12 3 20.5Zm2-3.05L16.85 12 5 6.55v4.2L11 12l-6 1.25v4.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VariantStack({ disabled = false }: { disabled?: boolean }) {
  return (
    <div className="m3-storybook-stack">
      <Button isDisabled={disabled}>Filled</Button>
      <ElevatedButton isDisabled={disabled}>Elevated</ElevatedButton>
      <FilledTonalButton isDisabled={disabled}>Filled tonal</FilledTonalButton>
      <OutlinedButton isDisabled={disabled}>Outlined</OutlinedButton>
      <TextButton isDisabled={disabled}>Text</TextButton>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <Button {...args} />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <VariantStack />
    </div>
  ),
};

export const DisabledVariants: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <VariantStack disabled />
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <div className="m3-storybook-stack">
        <Button startIcon={<SendIcon />}>Send</Button>
        <FilledTonalButton startIcon={<SendIcon />}>Send</FilledTonalButton>
        <OutlinedButton endIcon={<SendIcon />}>Continue</OutlinedButton>
        <TextButton startIcon={<SendIcon />}>Share</TextButton>
      </div>
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
        <VariantStack />
      </ThemeProvider>

      <ThemeProvider className="m3-storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <VariantStack />
      </ThemeProvider>

      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <VariantStack />
      </ThemeProvider>

      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <VariantStack />
      </ThemeProvider>
    </div>
  ),
};
