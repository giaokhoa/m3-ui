import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  HorizontalDivider,
  ThemeProvider,
  VerticalDivider,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/Divider',
  component: HorizontalDivider,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HorizontalDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ width: 320 }}>
        <HorizontalDivider aria-label="Horizontal divider" />
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="storybook-center">
      <div
        style={{
          alignItems: 'stretch',
          display: 'flex',
          gap: 24,
          height: 120,
        }}
      >
        <span>Start</span>
        <VerticalDivider aria-label="Vertical divider" />
        <span>End</span>
      </div>
    </div>
  ),
};

export const Overrides: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 24, width: 320 }}>
        <HorizontalDivider
          aria-label="Custom horizontal divider"
          color="#b3261e"
          thickness={4}
        />
        <div
          style={{
            alignItems: 'stretch',
            display: 'flex',
            gap: 24,
            height: 80,
          }}
        >
          <span>Start</span>
          <VerticalDivider
            aria-label="Custom vertical divider"
            color="#b3261e"
            thickness={4}
          />
          <span>End</span>
        </div>
      </div>
    </div>
  ),
};

function ThemeDividerSet() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <HorizontalDivider aria-label="Theme horizontal divider" />
      <div style={{ display: 'flex', height: 56 }}>
        <VerticalDivider aria-label="Theme vertical divider" />
      </div>
    </div>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeDividerSet />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeDividerSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeDividerSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeDividerSet />
      </ThemeProvider>
    </div>
  ),
};
