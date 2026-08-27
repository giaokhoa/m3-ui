import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomSheet,
  Button,
  ModalBottomSheet,
  SheetValue,
  ThemeProvider,
  useSheetState,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Stage({
  children,
  testId = 'bottom-sheet-stage',
}: {
  children: ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: 600,
        overflow: 'hidden',
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      {children}
    </div>
  );
}

function SheetBody({
  minHeight = 560,
  label = 'Places',
}: {
  minHeight?: number;
  label?: string;
}) {
  return (
    <div style={{ minHeight, padding: '0 24px 24px' }}>
      <h2 style={{ margin: '0 0 12px' }}>{label}</h2>
      <p style={{ margin: '0 0 24px' }}>
        BottomSheet stays in the local composition tree. The parent owns its
        stacking context; SheetState owns the Material anchor state.
      </p>
      <Button>Continue</Button>
    </div>
  );
}

function DefaultDemo() {
  const state = useSheetState({
    initialValue: SheetValue.PartiallyExpanded,
  });

  return (
    <Stage>
      <div style={{ padding: 24 }}>Background content remains non-modal.</div>
      <BottomSheet data-testid="bottom-sheet-default" state={state}>
        <SheetBody />
      </BottomSheet>
    </Stage>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function ExpandedDemo() {
  const state = useSheetState({
    initialValue: SheetValue.Expanded,
  });
  return (
    <Stage>
      <BottomSheet data-testid="bottom-sheet-expanded" state={state}>
        <SheetBody />
      </BottomSheet>
    </Stage>
  );
}

export const Expanded: Story = {
  render: () => <ExpandedDemo />,
};

function ShortContentDemo() {
  const state = useSheetState({
    initialValue: SheetValue.PartiallyExpanded,
  });
  return (
    <Stage>
      <BottomSheet data-testid="bottom-sheet-short" state={state}>
        <SheetBody label="Compact sheet" minHeight={160} />
      </BottomSheet>
    </Stage>
  );
}

export const ShortContent: Story = {
  render: () => <ShortContentDemo />,
};

function StateControlsDemo() {
  const state = useSheetState({
    initialValue: SheetValue.Expanded,
  });

  return (
    <Stage>
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 24,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button onPress={() => state.show()}>Show sheet</Button>
        <Button onPress={() => state.expand()}>Expand sheet</Button>
        <Button onPress={() => state.hide()}>Hide sheet</Button>
      </div>
      <BottomSheet data-testid="bottom-sheet-controls" state={state}>
        <SheetBody />
      </BottomSheet>
    </Stage>
  );
}

export const StateControls: Story = {
  render: () => <StateControlsDemo />,
};

function ModalDemo({
  shouldDismissOnClickOutside = true,
}: {
  shouldDismissOnClickOutside?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  const state = useSheetState();

  return (
    <Stage testId="modal-bottom-sheet-stage">
      <div style={{ padding: 24 }}>
        <Button data-testid="modal-bottom-sheet-trigger" onPress={() => setOpen(true)}>
          Open modal sheet
        </Button>
        <span data-testid="modal-bottom-sheet-dismiss-count" style={{ marginInlineStart: 12 }}>
          {dismissCount}
        </span>
      </div>
      {open ? (
        <ModalBottomSheet
          data-testid="modal-bottom-sheet"
          aria-label="Modal places"
          state={state}
          shouldDismissOnClickOutside={shouldDismissOnClickOutside}
          onDismissRequest={() => {
            setDismissCount((count) => count + 1);
            setOpen(false);
          }}
        >
          <SheetBody label="Modal places" />
        </ModalBottomSheet>
      ) : null}
    </Stage>
  );
}

export const Modal: Story = {
  render: () => <ModalDemo />,
};

export const ModalNoOutsideDismiss: Story = {
  render: () => <ModalDemo shouldDismissOnClickOutside={false} />,
};

function ThemeSheet({
  mode,
  sourceColor,
  label,
}: {
  mode: 'light' | 'dark';
  sourceColor?: string;
  label: string;
}) {
  const state = useSheetState({
    initialValue: SheetValue.Expanded,
  });
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div
        style={{
          position: 'relative',
          height: 300,
          overflow: 'hidden',
          background: 'var(--surface)',
        }}
      >
        <BottomSheet state={state}>
          <div style={{ minHeight: 180, padding: '0 20px 20px' }}>
            <strong>{label}</strong>
          </div>
        </BottomSheet>
      </div>
    </ThemeProvider>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 16,
        padding: 16,
      }}
    >
      <ThemeSheet label="Baseline light" mode="light" />
      <ThemeSheet label="Baseline dark" mode="dark" />
      <ThemeSheet
        label="Dynamic light"
        mode="light"
        sourceColor="#006a60"
      />
      <ThemeSheet
        label="Dynamic dark"
        mode="dark"
        sourceColor="#b3261e"
      />
    </div>
  ),
};
