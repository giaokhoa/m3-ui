import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider, VerticalDragHandle } from '@m3/ui';

const meta = {
  title: 'Components/DragHandle',
  component: VerticalDragHandle,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof VerticalDragHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <VerticalDragHandle
        aria-label="Resize pane"
        aria-orientation="vertical"
        data-testid="default-handle"
        role="separator"
        tabIndex={0}
      />
    </div>
  ),
};

export const Dragged: Story = {
  render: () => (
    <div className="storybook-center">
      <VerticalDragHandle
        aria-label="Dragged resize handle"
        aria-orientation="vertical"
        data-testid="dragged-handle"
        isDragged
        role="separator"
      />
    </div>
  ),
};

function ResizablePaneDemo() {
  const [paneWidth, setPaneWidth] = useState(220);
  const [isDragged, setIsDragged] = useState(false);
  const dragOrigin = useRef<{ x: number; width: number } | null>(null);

  const endDrag = () => {
    dragOrigin.current = null;
    setIsDragged(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    dragOrigin.current = { x: event.clientX, width: paneWidth };
    setIsDragged(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const origin = dragOrigin.current;
    if (!origin) return;
    setPaneWidth(Math.max(120, Math.min(320, origin.width + event.clientX - origin.x)));
  };

  return (
    <div
      data-testid="resizable-shell"
      style={{
        blockSize: 220,
        border: '1px solid var(--outline-variant)',
        display: 'flex',
        inlineSize: 520,
        overflow: 'hidden',
      }}
    >
      <div
        data-testid="left-pane"
        style={{
          alignItems: 'center',
          background: 'var(--surface-container)',
          display: 'flex',
          inlineSize: paneWidth,
          justifyContent: 'center',
        }}
      >
        Pane · {Math.round(paneWidth)}px
      </div>
      <div style={{ alignItems: 'center', display: 'flex' }}>
        <VerticalDragHandle
          aria-label="Resize panes"
          aria-orientation="vertical"
          aria-valuemax={320}
          aria-valuemin={120}
          aria-valuenow={Math.round(paneWidth)}
          data-testid="resizable-handle"
          isDragged={isDragged}
          role="separator"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              setPaneWidth((width) => Math.max(120, width - 8));
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              setPaneWidth((width) => Math.min(320, width + 8));
            }
          }}
          onPointerCancel={endDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
        />
      </div>
      <div
        style={{
          alignItems: 'center',
          background: 'var(--surface-container-low)',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        Flexible pane
      </div>
    </div>
  );
}

export const ResizablePane: Story = {
  render: () => (
    <div className="storybook-center">
      <ResizablePaneDemo />
    </div>
  ),
};

function ThemeSet() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 28 }}>
      <VerticalDragHandle aria-label="Theme default handle" />
      <VerticalDragHandle aria-label="Theme dragged handle" isDragged />
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
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeSet />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeSet />
      </ThemeProvider>
    </div>
  ),
};
