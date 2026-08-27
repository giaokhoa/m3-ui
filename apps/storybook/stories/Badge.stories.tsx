import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, BadgedBox, ThemeProvider } from '@m3-ui/ui';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

function Anchor({ label }: { label: string }) {
  return (
    <span
      data-testid={`anchor-${label.toLowerCase()}`}
      style={{
        alignItems: 'center',
        border: '1px solid currentColor',
        borderRadius: 20,
        boxSizing: 'border-box',
        display: 'inline-flex',
        height: 40,
        justifyContent: 'center',
        width: 40,
      }}
    >
      {label.slice(0, 1)}
    </span>
  );
}

export const Dot: Story = {
  render: () => (
    <div className="storybook-center">
      <Badge aria-label="New activity" data-testid="dot-badge" />
    </div>
  ),
};

export const Numeric: Story = {
  render: () => (
    <div className="storybook-center">
      <Badge data-testid="numeric-badge">8</Badge>
    </div>
  ),
};

export const LongValue: Story = {
  render: () => (
    <div className="storybook-center">
      <Badge data-testid="long-badge">99+</Badge>
    </div>
  ),
};

export const Positioned: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ alignItems: 'center', display: 'flex', gap: 48 }}>
        <BadgedBox
          badge={<Badge aria-label="Unread activity" data-testid="positioned-dot" />}
          data-testid="dot-box"
        >
          <Anchor label="Dot" />
        </BadgedBox>
        <BadgedBox
          badge={<Badge data-testid="positioned-content">8</Badge>}
          data-testid="content-box"
        >
          <Anchor label="Count" />
        </BadgedBox>
      </div>
    </div>
  ),
};

export const Rtl: Story = {
  render: () => (
    <div className="storybook-center" dir="rtl">
      <div style={{ alignItems: 'center', display: 'flex', gap: 48 }}>
        <BadgedBox
          badge={<Badge aria-label="RTL activity" data-testid="rtl-dot" />}
          data-testid="rtl-dot-box"
        >
          <Anchor label="RtlDot" />
        </BadgedBox>
        <BadgedBox
          badge={<Badge data-testid="rtl-content">8</Badge>}
          data-testid="rtl-content-box"
        >
          <Anchor label="RtlCount" />
        </BadgedBox>
      </div>
    </div>
  ),
};

function ThemeBadgeSet() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 24 }}>
      <Badge aria-label="Theme dot badge" />
      <Badge>8</Badge>
      <Badge>99+</Badge>
      <BadgedBox badge={<Badge>3</Badge>}>
        <Anchor label="Theme" />
      </BadgedBox>
    </div>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeBadgeSet />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeBadgeSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeBadgeSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeBadgeSet />
      </ThemeProvider>
    </div>
  ),
};
