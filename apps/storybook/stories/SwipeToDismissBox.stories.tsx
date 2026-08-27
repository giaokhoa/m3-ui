import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SwipeToDismissBox,
  type SwipeToDismissBoxValue,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/SwipeToDismissBox',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Foreground() {
  return (
    <div
      data-testid="foreground-content"
      style={{
        alignItems: 'center',
        background: 'var(--surface-container)',
        borderRadius: 12,
        display: 'flex',
        gap: 12,
        minHeight: 84,
        padding: '0 20px',
      }}
    >
      <button data-testid="foreground-button" type="button">Open</button>
      <span style={{ flex: 1 }}>Swipe this item</span>
      <input aria-label="Item note" data-testid="foreground-input" defaultValue="Focusable" />
    </div>
  );
}

function Background() {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--error-container)',
        color: 'var(--on-error-container)',
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      <button data-testid="archive-action" type="button">Archive</button>
      <button data-testid="delete-action" type="button">Delete</button>
    </div>
  );
}

interface DemoProps {
  enableDismissFromStartToEnd?: boolean;
  enableDismissFromEndToStart?: boolean;
  gesturesEnabled?: boolean;
  dir?: 'ltr' | 'rtl';
}

function Demo({
  enableDismissFromStartToEnd,
  enableDismissFromEndToStart,
  gesturesEnabled,
  dir,
}: DemoProps) {
  const [value, setValue] = useState<SwipeToDismissBoxValue>('settled');
  const [dismisses, setDismisses] = useState(0);
  const [lastDismiss, setLastDismiss] = useState('none');

  return (
    <div dir={dir} style={{ width: 360 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button data-testid="reset" type="button" onClick={() => setValue('settled')}>Reset</button>
        <output data-testid="dismiss-count">{dismisses}</output>
        <output data-testid="dismiss-direction">{lastDismiss}</output>
      </div>
      <SwipeToDismissBox
        aria-label="Dismissible item"
        backgroundContent={<Background />}
        data-testid="swipe-box"
        dir={dir}
        enableDismissFromEndToStart={enableDismissFromEndToStart}
        enableDismissFromStartToEnd={enableDismissFromStartToEnd}
        gesturesEnabled={gesturesEnabled}
        onDismiss={(direction) => {
          setDismisses((count) => count + 1);
          setLastDismiss(direction);
        }}
        onValueChange={setValue}
        value={value}
      >
        <Foreground />
      </SwipeToDismissBox>
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
export const StartToEndDisabled: Story = {
  render: () => <Demo enableDismissFromStartToEnd={false} />,
};
export const EndToStartDisabled: Story = {
  render: () => <Demo enableDismissFromEndToStart={false} />,
};
export const GesturesDisabled: Story = {
  render: () => <Demo gesturesEnabled={false} />,
};
export const RTL: Story = { render: () => <Demo dir="rtl" /> };

export const InitiallyDismissed: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <SwipeToDismissBox
        aria-label="Initially dismissed item"
        backgroundContent={<Background />}
        defaultValue="start-to-end"
      >
        <Foreground />
      </SwipeToDismissBox>
    </div>
  ),
};
