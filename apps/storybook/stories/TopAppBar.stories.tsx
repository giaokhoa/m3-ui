import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, TopAppBar, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/TopAppBar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const menuIcon = <Icon><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" /></Icon>;
const moreIcon = <Icon><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /></Icon>;
const searchIcon = <Icon><path d="m20.3 19-4.6-4.6a7 7 0 1 0-1.4 1.4l4.6 4.6 1.4-1.4ZM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" /></Icon>;

const navigation = <IconButton aria-label="Open navigation">{menuIcon}</IconButton>;
const actions = (
  <>
    <IconButton aria-label="Search">{searchIcon}</IconButton>
    <IconButton aria-label="More options">{moreIcon}</IconButton>
  </>
);

function Stage({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: 360, background: 'var(--surface)', color: 'var(--on-surface)' }}>
      {children}
      <main style={{ padding: 24 }}><p>Scrollable content starts here.</p></main>
    </div>
  );
}

export const Small: Story = {
  render: () => (
    <Stage>
      <TopAppBar data-testid="top-app-bar" title="Inbox" navigationIcon={navigation} actions={actions} />
    </Stage>
  ),
};

export const CenterAligned: Story = {
  render: () => (
    <Stage>
      <TopAppBar
        data-testid="top-app-bar"
        variant="center-aligned"
        title="Centered title"
        navigationIcon={navigation}
        actions={actions}
      />
    </Stage>
  ),
};

export const Medium: Story = {
  render: () => (
    <Stage><TopAppBar data-testid="top-app-bar" variant="medium" title="Medium title" navigationIcon={navigation} actions={actions} /></Stage>
  ),
};

export const MediumFlexible: Story = {
  render: () => (
    <Stage><TopAppBar data-testid="top-app-bar" variant="medium-flexible" title="Medium flexible" subtitle="Supporting text" navigationIcon={navigation} actions={actions} /></Stage>
  ),
};

export const Large: Story = {
  render: () => (
    <Stage><TopAppBar data-testid="top-app-bar" variant="large" title="Large title" navigationIcon={navigation} actions={actions} /></Stage>
  ),
};

export const LargeFlexible: Story = {
  render: () => (
    <Stage><TopAppBar data-testid="top-app-bar" variant="large-flexible" title="Large flexible" subtitle="Supporting text" navigationIcon={navigation} actions={actions} /></Stage>
  ),
};

function ScrollDemo() {
  const [fraction, setFraction] = useState(0);
  return (
    <Stage>
      <TopAppBar
        data-testid="top-app-bar"
        variant="large"
        title="Scroll-aware title"
        navigationIcon={navigation}
        actions={actions}
        scrollFraction={fraction}
      />
      <div style={{ padding: 24, display: 'flex', gap: 12 }}>
        <button data-testid="expand-app-bar" onClick={() => setFraction(0)}>Expanded</button>
        <button data-testid="collapse-app-bar" onClick={() => setFraction(1)}>Collapsed</button>
      </div>
    </Stage>
  );
}

export const ScrollStates: Story = { render: () => <ScrollDemo /> };

export const PinnedOverlap: Story = {
  render: () => (
    <Stage>
      <TopAppBar
        data-testid="top-app-bar"
        title="Pinned title"
        navigationIcon={navigation}
        actions={actions}
        state={{ collapsedFraction: 0, overlappedFraction: 1, contentOffset: -64 }}
      />
    </Stage>
  ),
};

export const Rtl: Story = {
  render: () => (
    <div dir="rtl">
      <Stage><TopAppBar data-testid="top-app-bar" variant="medium" title="عنوان" navigationIcon={navigation} actions={actions} /></Stage>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 12 }}>
      {[
        ['light', undefined, 'Baseline light'],
        ['dark', undefined, 'Baseline dark'],
        ['light', '#006a60', 'Dynamic light'],
        ['dark', '#b3261e', 'Dynamic dark'],
      ].map(([mode, sourceColor, label]) => (
        <ThemeProvider key={label} mode={mode as 'light' | 'dark'} sourceColor={sourceColor}>
          <div style={{ background: 'var(--surface)' }}>
            <TopAppBar variant="medium-flexible" title={label} subtitle="Supporting text" navigationIcon={navigation} actions={actions} />
          </div>
        </ThemeProvider>
      ))}
    </div>
  ),
};
