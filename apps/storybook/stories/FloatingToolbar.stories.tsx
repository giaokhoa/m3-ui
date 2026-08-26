import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FloatingActionButton,
  HorizontalFloatingToolbar,
  IconButton,
  VerticalFloatingToolbar,
  createFloatingToolbarState,
  type FloatingToolbarState,
} from '@m3/ui';

const meta = {
  title: 'Components/FloatingToolbar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const homeIcon = (
  <Icon>
    <path d="M12 3 3 10v11h6v-7h6v7h6V10l-9-7Z" />
  </Icon>
);
const searchIcon = (
  <Icon>
    <path d="m20.3 19-4.6-4.6a7 7 0 1 0-1.4 1.4l4.6 4.6 1.4-1.4ZM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
  </Icon>
);
const editIcon = (
  <Icon>
    <path d="m4 17.25 9.8-9.8 2.75 2.75-9.8 9.8H4v-2.75Zm14.7-9.2-2.75-2.75 1.1-1.1a1.4 1.4 0 0 1 2 0l.75.75a1.4 1.4 0 0 1 0 2l-1.1 1.1Z" />
  </Icon>
);
const moreIcon = (
  <Icon>
    <path d="M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
  </Icon>
);
const addIcon = (
  <Icon>
    <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
  </Icon>
);

const leading = <IconButton aria-label="Home">{homeIcon}</IconButton>;
const main = <IconButton aria-label="Search">{searchIcon}</IconButton>;
const trailing = <IconButton aria-label="More options">{moreIcon}</IconButton>;

function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      data-testid="floating-toolbar-stage"
      style={{
        minHeight: 420,
        boxSizing: 'border-box',
        display: 'grid',
        placeItems: 'center',
        padding: 32,
        overflow: 'hidden',
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      {children}
    </div>
  );
}

function StandardFab() {
  return (
    <FloatingActionButton aria-label="Create" variant="primaryContainer">
      {addIcon}
    </FloatingActionButton>
  );
}

function VibrantFab() {
  return (
    <FloatingActionButton aria-label="Create" variant="tertiaryContainer">
      {addIcon}
    </FloatingActionButton>
  );
}

export const HorizontalExpanded: Story = {
  render: () => (
    <Stage>
      <HorizontalFloatingToolbar
        aria-label="Editor tools"
        data-testid="floating-toolbar"
        expanded
        leadingContent={leading}
        trailingContent={trailing}
      >
        {main}
        <IconButton aria-label="Edit">{editIcon}</IconButton>
      </HorizontalFloatingToolbar>
    </Stage>
  ),
};

export const HorizontalCollapsed: Story = {
  render: () => (
    <Stage>
      <HorizontalFloatingToolbar
        aria-label="Editor tools"
        data-testid="floating-toolbar"
        expanded={false}
        leadingContent={leading}
        trailingContent={trailing}
      >
        {main}
      </HorizontalFloatingToolbar>
    </Stage>
  ),
};

export const HorizontalFabExpanded: Story = {
  render: () => (
    <Stage>
      <HorizontalFloatingToolbar
        aria-label="Creation tools"
        data-testid="floating-toolbar"
        expanded
        floatingActionButton={<StandardFab />}
        floatingActionButtonPosition="end"
      >
        {main}
        <IconButton aria-label="Edit">{editIcon}</IconButton>
      </HorizontalFloatingToolbar>
    </Stage>
  ),
};

export const HorizontalFabCollapsed: Story = {
  render: () => (
    <Stage>
      <HorizontalFloatingToolbar
        aria-label="Creation tools"
        data-testid="floating-toolbar"
        expanded={false}
        floatingActionButton={<StandardFab />}
        floatingActionButtonPosition="end"
      >
        {main}
        <IconButton aria-label="Edit">{editIcon}</IconButton>
      </HorizontalFloatingToolbar>
    </Stage>
  ),
};

export const VerticalVibrant: Story = {
  render: () => (
    <Stage>
      <VerticalFloatingToolbar
        aria-label="Navigation tools"
        data-testid="floating-toolbar"
        expanded
        leadingContent={leading}
        trailingContent={trailing}
        variant="vibrant"
      >
        {main}
      </VerticalFloatingToolbar>
    </Stage>
  ),
};

export const VerticalFabCollapsed: Story = {
  render: () => (
    <Stage>
      <VerticalFloatingToolbar
        aria-label="Creation tools"
        data-testid="floating-toolbar"
        expanded={false}
        floatingActionButton={<VibrantFab />}
        floatingActionButtonPosition="top"
        variant="vibrant"
      >
        {main}
      </VerticalFloatingToolbar>
    </Stage>
  ),
};

function ExitStateDemo() {
  const [state, setState] = useState<FloatingToolbarState>(() =>
    createFloatingToolbarState(-64, 0, 0),
  );
  const setOffset = (offset: number) =>
    setState(createFloatingToolbarState(-64, offset, state.contentOffset));

  return (
    <Stage>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-testid="show-floating-toolbar" onClick={() => setOffset(0)}>
            Shown
          </button>
          <button data-testid="half-floating-toolbar" onClick={() => setOffset(-32)}>
            Half
          </button>
          <button data-testid="hide-floating-toolbar" onClick={() => setOffset(-64)}>
            Hidden
          </button>
        </div>
        <HorizontalFloatingToolbar
          aria-label="Scrolling tools"
          data-testid="floating-toolbar"
          exitDirection="bottom"
          expanded
          state={state}
        >
          {main}
          <IconButton aria-label="Edit">{editIcon}</IconButton>
        </HorizontalFloatingToolbar>
      </div>
    </Stage>
  );
}

export const ExitStates: Story = { render: () => <ExitStateDemo /> };

export const RtlStartExit: Story = {
  render: () => (
    <Stage>
      <HorizontalFloatingToolbar
        aria-label="RTL tools"
        data-testid="floating-toolbar"
        dir="rtl"
        exitDirection="start"
        expanded
        leadingContent={leading}
        state={createFloatingToolbarState(-64, -24, 0)}
      >
        {main}
      </HorizontalFloatingToolbar>
    </Stage>
  ),
};
