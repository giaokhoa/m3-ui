import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BottomSheet,
  BottomSheetScaffold,
  Button,
  Card,
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  Scrim,
  Surface,
  ThemeProvider,
} from './index';

function renderLane5(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('Lane 5 surfaces and overlays SSR contracts', () => {
  it('renders passive Card, Surface, and Scrim without inventing interaction semantics', () => {
    const html = renderLane5(
      <>
        <Card data-testid="server-card">Server card</Card>
        <Surface data-testid="server-surface">Server surface</Surface>
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <Scrim data-testid="server-scrim" />
        </div>
      </>,
    );

    expect(html).toContain('Server card');
    expect(html).toContain('Server surface');
    expect(html).toContain('data-testid="server-scrim"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="button"');
  });

  it('keeps a closed Dialog composition server-safe and leaves the overlay unrendered', () => {
    const html = renderLane5(
      <DialogTrigger>
        <Button>Open server dialog</Button>
        <DialogOverlay>
          <Dialog aria-label="Server dialog">
            <DialogTitle>Server dialog title</DialogTitle>
            <DialogDescription>Server dialog body</DialogDescription>
          </Dialog>
        </DialogOverlay>
      </DialogTrigger>,
    );

    expect(html).toContain('Open server dialog');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Server dialog body');
  });

  it('renders the standard BottomSheet in its deterministic hidden server state', () => {
    const html = renderLane5(
      <BottomSheet aria-label="Server sheet">
        <div>Server sheet content</div>
      </BottomSheet>,
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Server sheet"');
    expect(html).toContain('data-state="hidden"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('Server sheet content');
  });

  it('renders BottomSheetScaffold with the persistent partial state before browser measurement', () => {
    const html = renderLane5(
      <BottomSheetScaffold
        data-testid="server-bottom-sheet-scaffold"
        sheetContent={<div>Server scaffold sheet</div>}
      >
        <div>Server scaffold body</div>
      </BottomSheetScaffold>,
    );

    expect(html).toContain('data-testid="server-bottom-sheet-scaffold"');
    expect(html).toContain('data-sheet-state="partially-expanded"');
    expect(html).toContain('Server scaffold body');
    expect(html).toContain('Server scaffold sheet');
  });
});
