import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ContainedLoadingIndicator,
  LoadingIndicator,
  ThemeProvider,
} from '@m3/ui';

const meta = {
  title: 'Components/LoadingIndicator',
  component: LoadingIndicator,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    'aria-label': 'Loading',
  },
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
      }}
    >
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <LoadingIndicator aria-label="Loading" />
    </div>
  ),
};

export const Determinate: Story = {
  render: () => (
    <div className="storybook-center">
      <Row>
        <LoadingIndicator aria-label="Loading 0 percent" value={0} />
        <LoadingIndicator aria-label="Loading 25 percent" value={0.25} />
        <LoadingIndicator aria-label="Loading 50 percent" value={0.5} />
        <LoadingIndicator aria-label="Loading 75 percent" value={0.75} />
        <LoadingIndicator aria-label="Loading 100 percent" value={1} />
      </Row>
    </div>
  ),
};

export const Contained: Story = {
  render: () => (
    <div className="storybook-center">
      <Row>
        <ContainedLoadingIndicator aria-label="Contained loading" />
        <ContainedLoadingIndicator
          aria-label="Contained loading 60 percent"
          value={0.6}
        />
      </Row>
    </div>
  ),
};

function ThemeSet() {
  return (
    <Row>
      <LoadingIndicator aria-label="Theme loading" />
      <LoadingIndicator aria-label="Theme loading 55 percent" value={0.55} />
      <ContainedLoadingIndicator aria-label="Theme contained loading" />
      <ContainedLoadingIndicator
        aria-label="Theme contained loading 55 percent"
        value={0.55}
      />
    </Row>
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
