import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomSheetScaffold,
  Button,
  SheetState,
  SheetValue,
  Snackbar,
  Surface,
  TopAppBar,
  VerticalDragHandle,
} from '@m3/ui';

const meta = {
  title: 'Components/BottomSheetScaffold',
  component: BottomSheetScaffold,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BottomSheetScaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

function SheetContent({ nested = false }: { nested?: boolean }) {
  return (
    <Surface style={{ minHeight: 420, padding: 24, boxSizing: 'border-box' }}>
      <h2 style={{ marginTop: 0 }}>Persistent sheet</h2>
      <p>Secondary content stays available while the main body remains interactive.</p>
      {nested ? (
        <div
          data-testid="sheet-scroll"
          tabIndex={0}
          style={{ maxHeight: 180, overflow: 'auto', border: '1px solid currentColor', padding: 12 }}
        >
          {Array.from({ length: 20 }, (_, index) => (
            <p key={index}>Scrollable sheet row {index + 1}</p>
          ))}
        </div>
      ) : null}
      <Button data-testid="sheet-button">Sheet action</Button>
    </Surface>
  );
}

function Body({ nested = false }: { nested?: boolean }) {
  return (
    <main data-testid="body" style={{ minHeight: 900, padding: 24, boxSizing: 'border-box' }}>
      <h1>Inbox</h1>
      <Button data-testid="body-button">Body action</Button>
      {nested ? (
        <div data-testid="body-scroll" style={{ marginTop: 24, height: 240, overflow: 'auto' }}>
          {Array.from({ length: 24 }, (_, index) => (
            <p key={index}>Scrollable body row {index + 1}</p>
          ))}
        </div>
      ) : null}
    </main>
  );
}

function Fixture({
  peekHeight = 56,
  maxSheetWidth = 640,
  isSwipeEnabled = true,
  dragHandle,
  hiddenEnabled = false,
  nested = false,
  withChrome = true,
  dir,
}: {
  peekHeight?: number;
  maxSheetWidth?: number;
  isSwipeEnabled?: boolean;
  dragHandle?: ReactNode | null;
  hiddenEnabled?: boolean;
  nested?: boolean;
  withChrome?: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  const [state] = useState(
    () =>
      new SheetState({
        enabledValues: hiddenEnabled
          ? [SheetValue.Hidden, SheetValue.PartiallyExpanded, SheetValue.Expanded]
          : [SheetValue.PartiallyExpanded, SheetValue.Expanded],
        initialValue: SheetValue.PartiallyExpanded,
      }),
  );

  return (
    <div dir={dir} style={{ width: '100%', height: 640, padding: 16, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <Button data-testid="expand" onPress={() => state.expand()}>Expand</Button>
        <Button data-testid="collapse" onPress={() => state.partialExpand()}>Collapse</Button>
        {hiddenEnabled ? (
          <Button data-testid="hide" onPress={() => state.hide()}>Hide</Button>
        ) : null}
      </div>
      <BottomSheetScaffold
        data-testid="bottom-sheet-scaffold"
        state={state}
        peekHeight={peekHeight}
        maxSheetWidth={maxSheetWidth}
        isSwipeEnabled={isSwipeEnabled}
        dragHandle={dragHandle}
        topBar={withChrome ? <TopAppBar data-testid="top-bar" title="Inbox" /> : undefined}
        snackbarHost={withChrome ? <Snackbar data-testid="snackbar">Saved</Snackbar> : undefined}
        sheetContent={<SheetContent nested={nested} />}
        style={{ height: 560 }}
      >
        <Body nested={nested} />
      </BottomSheetScaffold>
    </div>
  );
}

export const DefaultPartial: Story = { render: () => <Fixture /> };
export const ProgrammaticState: Story = { render: () => <Fixture /> };
export const SwipeDisabled: Story = { render: () => <Fixture isSwipeEnabled={false} /> };
export const CustomPeekHeight: Story = { render: () => <Fixture peekHeight={96} /> };
export const MaxWidth: Story = { render: () => <Fixture maxSheetWidth={420} /> };
export const WithoutDragHandle: Story = { render: () => <Fixture dragHandle={null} /> };
export const CustomDragHandle: Story = {
  render: () => <Fixture dragHandle={<VerticalDragHandle aria-hidden="true" />} />,
};
export const HiddenEnabled: Story = { render: () => <Fixture hiddenEnabled /> };
export const NestedScroll: Story = { render: () => <Fixture nested /> };
export const Rtl: Story = { render: () => <Fixture dir="rtl" /> };
export const ReducedMotion: Story = {
  parameters: { chromatic: { prefersReducedMotion: 'reduce' } },
  render: () => <Fixture />,
};
