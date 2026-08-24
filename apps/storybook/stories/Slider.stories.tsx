import type { Meta, StoryObj } from '@storybook/react-vite';
import { RangeSlider, Slider, ThemeProvider, type SliderSize } from '@m3/ui';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: { layout: 'fullscreen' },
  args: {
    label: 'Volume',
    defaultValue: 40,
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: SliderSize[] = ['xSmall', 'small', 'medium', 'large', 'xLarge'];

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 28, inlineSize: 'min(720px, 80vw)' }}>{children}</div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Frame>
      <Slider label="Volume" defaultValue={40} />
    </Frame>
  ),
};

export const Range: Story = {
  render: () => (
    <Frame>
      <RangeSlider
        label="Price range"
        defaultValue={[25, 75]}
        thumbLabels={['Minimum price', 'Maximum price']}
      />
    </Frame>
  ),
};

export const SizeFamily: Story = {
  name: 'Size family',
  render: () => (
    <Frame>
      {sizes.map((size) => (
        <Slider key={size} aria-label={`${size} slider`} defaultValue={58} size={size} />
      ))}
    </Frame>
  ),
};

export const DiscreteTicks: Story = {
  name: 'Discrete + ticks',
  render: () => (
    <Frame>
      <Slider label="Rating" defaultValue={60} step={20} showTicks showValueIndicator />
      <RangeSlider
        label="Allowed range"
        defaultValue={[20, 80]}
        step={20}
        showTicks
        showValueIndicator
        thumbLabels={['Range start', 'Range end']}
      />
    </Frame>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ alignItems: 'end', display: 'flex', gap: 48, blockSize: 360 }}>
        <Slider aria-label="Vertical volume" defaultValue={40} orientation="vertical" />
        <RangeSlider
          aria-label="Vertical range"
          defaultValue={[25, 75]}
          orientation="vertical"
          thumbLabels={['Vertical start', 'Vertical end']}
        />
        <Slider aria-label="Large vertical" defaultValue={65} orientation="vertical" size="large" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Frame>
      <Slider label="Disabled single" defaultValue={55} isDisabled />
      <RangeSlider
        label="Disabled range"
        defaultValue={[25, 75]}
        isDisabled
        thumbLabels={['Disabled start', 'Disabled end']}
      />
    </Frame>
  ),
};

function ThemeSet() {
  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <Slider aria-label="Theme slider" defaultValue={42} />
      <RangeSlider
        aria-label="Theme range"
        defaultValue={[25, 75]}
        thumbLabels={['Theme start', 'Theme end']}
      />
      <Slider aria-label="Theme medium slider" defaultValue={60} size="medium" />
    </div>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeSet />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeSet />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60">
        <h3>Dynamic · #006A60</h3>
        <ThemeSet />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e">
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeSet />
      </ThemeProvider>
    </div>
  ),
};
