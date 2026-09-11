import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Scrim, ThemeProvider } from '@m3-ui/ui';

const meta = {
  title: 'Components/Scrim',
  component: Scrim,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Scrim>;

export default meta;
type Story = StoryObj<typeof meta>;

function SurfaceFrame({
  children,
  width = 360,
  height = 220,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: `min(${width}px, calc(100vw - 32px))`,
        height,
        overflow: 'hidden',
        borderRadius: 12,
        background: 'var(--surface-container-low)',
        color: 'var(--on-surface)',
      }}
    >
      <div style={{ padding: 24 }}>
        <strong>Underlying content</strong>
        <p style={{ marginBlock: 8, maxWidth: 260 }}>
          The scrim obscures content without owning modal state or stacking.
        </p>
      </div>
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <SurfaceFrame>
        <Scrim data-testid="scrim-default" />
      </SurfaceFrame>
    </div>
  ),
};

function DismissibleDemo() {
  const [dismissals, setDismissals] = useState(0);

  return (
    <div
      className="storybook-center"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <SurfaceFrame>
        <Scrim
          aria-label="Dismiss modal"
          data-testid="scrim-dismissible"
          onDismiss={() => setDismissals((count) => count + 1)}
        />
      </SurfaceFrame>
      <output data-testid="scrim-dismissals">Dismissed: {dismissals}</output>
    </div>
  );
}

export const Dismissible: Story = {
  render: () => <DismissibleDemo />,
};

export const HalfAlpha: Story = {
  render: () => (
    <div className="storybook-center">
      <SurfaceFrame>
        <Scrim alpha={0.5} data-testid="scrim-half-alpha" />
      </SurfaceFrame>
    </div>
  ),
};

function ThemeScrim() {
  return (
    <SurfaceFrame width={240} height={140}>
      <Scrim />
    </SurfaceFrame>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeScrim />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeScrim />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeScrim />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeScrim />
      </ThemeProvider>
    </div>
  ),
};
