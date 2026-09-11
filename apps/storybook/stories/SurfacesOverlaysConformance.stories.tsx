import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogCloseAction,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  ElevatedCard,
  ModalBottomSheet,
  Scrim,
  Surface,
  ThemeProvider,
  useSheetState,
} from '@m3-ui/ui';

const meta = {
  title: 'Conformance/SurfacesOverlays',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function CardMotionDemo() {
  const [presses, setPresses] = useState(0);

  return (
    <div style={{ padding: 32 }}>
      <Card
        data-testid="motion-card"
        onPress={() => setPresses((count) => count + 1)}
        style={{ width: 240 }}
      >
        <div style={{ padding: 24 }}>Reduced-motion card</div>
      </Card>
      <output data-testid="motion-card-count">{presses}</output>
    </div>
  );
}

export const CardMotion: Story = {
  render: () => <CardMotionDemo />,
};

function DynamicThemeDemo() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetState = useSheetState();

  return (
    <ThemeProvider
      className="surfaces-overlays-dynamic-theme"
      mode="light"
      sourceColor="#006a60"
    >
      <div
        style={{
          display: 'grid',
          gap: 20,
          alignItems: 'start',
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: 32,
          background: 'var(--surface)',
          color: 'var(--on-surface)',
        }}
      >
        <ElevatedCard data-testid="theme-card" style={{ width: 240 }}>
          <div style={{ padding: 20 }}>Dynamic elevated card</div>
        </ElevatedCard>

        <Surface
          data-testid="theme-surface"
          shape={12}
          style={{ width: 240, padding: 20 }}
        >
          Dynamic surface
        </Surface>

        <div
          data-testid="theme-scrim-frame"
          style={{
            position: 'relative',
            width: 240,
            height: 72,
            overflow: 'hidden',
            borderRadius: 12,
            background: 'var(--surface-container-high)',
          }}
        >
          <Scrim data-testid="theme-scrim" />
        </div>

        <DialogTrigger>
          <Button data-testid="theme-dialog-trigger">Open dynamic dialog</Button>
          <DialogOverlay>
            <Dialog aria-label="Dynamic dialog" data-testid="theme-dialog">
              <DialogTitle>Dynamic dialog</DialogTitle>
              <DialogDescription>
                This portal must inherit the nested ThemeProvider roles.
              </DialogDescription>
              <DialogActions>
                <DialogCloseAction>Close dialog</DialogCloseAction>
              </DialogActions>
            </Dialog>
          </DialogOverlay>
        </DialogTrigger>

        <Button
          data-testid="theme-sheet-trigger"
          onPress={() => setSheetOpen(true)}
        >
          Open dynamic sheet
        </Button>
        {sheetOpen ? (
          <ModalBottomSheet
            aria-label="Dynamic sheet"
            data-testid="theme-modal-sheet"
            state={sheetState}
            onDismissRequest={() => setSheetOpen(false)}
          >
            <div style={{ minHeight: 320, padding: '0 24px 24px' }}>
              Dynamic modal sheet
            </div>
          </ModalBottomSheet>
        ) : null}
      </div>
    </ThemeProvider>
  );
}

export const DynamicTheme: Story = {
  render: () => <DynamicThemeDemo />,
};
