import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomAppBar,
  FlexibleBottomAppBar,
  FloatingActionButton,
  IconButton,
} from '@m3/ui';

const meta = {
  title: 'Components/BottomAppBar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const addIcon = <Icon><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></Icon>;
const editIcon = <Icon><path d="m4 17.25 9.8-9.8 2.75 2.75-9.8 9.8H4v-2.75Zm14.7-9.2-2.75-2.75 1.1-1.1a1.4 1.4 0 0 1 2 0l.75.75a1.4 1.4 0 0 1 0 2l-1.1 1.1Z" /></Icon>;
const searchIcon = <Icon><path d="m20.3 19-4.6-4.6a7 7 0 1 0-1.4 1.4l4.6 4.6 1.4-1.4ZM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" /></Icon>;
const moreIcon = <Icon><path d="M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></Icon>;

const actions = (
  <>
    <IconButton aria-label="Search">{searchIcon}</IconButton>
    <IconButton aria-label="Edit">{editIcon}</IconButton>
    <IconButton aria-label="More options">{moreIcon}</IconButton>
  </>
);

const fab = (
  <FloatingActionButton aria-label="Create" variant="secondaryContainer">
    {addIcon}
  </FloatingActionButton>
);

function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      data-testid="bottom-app-bar-stage"
      style={{
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      <main data-testid="bottom-app-bar-main" style={{ flex: 1, padding: 24 }}>
        Bottom app bar content
      </main>
      {children}
    </div>
  );
}

export const Standard: Story = {
  render: () => (
    <Stage>
      <BottomAppBar
        data-testid="bottom-app-bar"
        actions={actions}
        floatingActionButton={fab}
      />
    </Stage>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Stage>
      <BottomAppBar data-testid="bottom-app-bar">{actions}</BottomAppBar>
    </Stage>
  ),
};

export const Flexible: Story = {
  render: () => (
    <Stage>
      <FlexibleBottomAppBar data-testid="bottom-app-bar">
        <IconButton aria-label="Search">{searchIcon}</IconButton>
        <IconButton aria-label="Edit">{editIcon}</IconButton>
        <IconButton aria-label="More options">{moreIcon}</IconButton>
      </FlexibleBottomAppBar>
    </Stage>
  ),
};

export const FlexibleFixed: Story = {
  render: () => (
    <Stage>
      <FlexibleBottomAppBar
        data-testid="bottom-app-bar"
        horizontalArrangement="fixed"
      >
        <IconButton aria-label="Search">{searchIcon}</IconButton>
        <IconButton aria-label="Edit">{editIcon}</IconButton>
        <IconButton aria-label="More options">{moreIcon}</IconButton>
      </FlexibleBottomAppBar>
    </Stage>
  ),
};

function ScrollDemo() {
  const [fraction, setFraction] = useState(0);
  return (
    <Stage>
      <div style={{ display: 'flex', gap: 8, padding: 12 }}>
        <button data-testid="expand-bottom-app-bar" onClick={() => setFraction(0)}>
          Expanded
        </button>
        <button data-testid="half-bottom-app-bar" onClick={() => setFraction(0.5)}>
          Half
        </button>
        <button data-testid="collapse-bottom-app-bar" onClick={() => setFraction(1)}>
          Collapsed
        </button>
      </div>
      <BottomAppBar
        data-testid="bottom-app-bar"
        actions={actions}
        floatingActionButton={fab}
        collapsedFraction={fraction}
      />
    </Stage>
  );
}

export const ScrollStates: Story = { render: () => <ScrollDemo /> };

export const Rtl: Story = {
  render: () => (
    <div dir="rtl">
      <Stage>
        <BottomAppBar
          data-testid="bottom-app-bar"
          actions={actions}
          floatingActionButton={fab}
        />
      </Stage>
    </div>
  ),
};
