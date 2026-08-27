import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PullToRefresh, type PullToRefreshIndicatorState } from '@m3-ui/ui';

const meta = {
  title: 'Components/PullToRefresh',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Feed({ children }: { children?: ReactNode }) {
  return (
    <div style={{ minHeight: 760, padding: 20 }}>
      {children}
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          style={{
            background: 'var(--surface-container, #f3f3f3)',
            borderRadius: 16,
            marginBlock: 10,
            padding: 18,
          }}
        >
          Feed item {index + 1}
        </div>
      ))}
    </div>
  );
}

function Stage({ children, dir }: { children: ReactNode; dir?: 'ltr' | 'rtl' }) {
  return (
    <div dir={dir} style={{ margin: 24, width: 360 }}>
      {children}
    </div>
  );
}

function ContractDemo({ enabled = true, initialRefreshing = false }: { enabled?: boolean; initialRefreshing?: boolean }) {
  const [isRefreshing, setRefreshing] = useState(initialRefreshing);
  const [refreshCount, setRefreshCount] = useState(0);
  return (
    <Stage>
      <button data-testid="complete-refresh" onClick={() => setRefreshing(false)} style={{ marginBottom: 8 }}>
        Complete refresh
      </button>
      <output data-testid="refresh-count">{refreshCount}</output>
      <PullToRefresh
        data-testid="pull-to-refresh"
        enabled={enabled}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          setRefreshCount((value) => value + 1);
          setRefreshing(true);
        }}
        style={{ height: 360 }}
      >
        <Feed />
      </PullToRefresh>
    </Stage>
  );
}

export const Default: Story = { render: () => <ContractDemo /> };
export const Disabled: Story = { render: () => <ContractDemo enabled={false} /> };
export const Refreshing: Story = { render: () => <ContractDemo initialRefreshing /> };

function CustomIndicatorDemo() {
  const [isRefreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <Stage>
      <button data-testid="complete-refresh" onClick={() => setRefreshing(false)} style={{ marginBottom: 8 }}>
        Complete refresh
      </button>
      <output data-testid="refresh-count">{count}</output>
      <PullToRefresh
        data-testid="pull-to-refresh"
        indicator={(state: PullToRefreshIndicatorState) => (
          <output
            data-testid="custom-indicator"
            data-progress={state.progress.toFixed(3)}
            data-status={state.status}
            style={{ position: 'absolute', insetBlockStart: 4, insetInlineEnd: 4 }}
          >
            {state.status}:{state.progress.toFixed(2)}
          </output>
        )}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          setCount((value) => value + 1);
          setRefreshing(true);
        }}
        style={{ height: 360 }}
      >
        <Feed />
      </PullToRefresh>
    </Stage>
  );
}

export const CustomIndicator: Story = { render: () => <CustomIndicatorDemo /> };

function NestedDemo() {
  const [count, setCount] = useState(0);
  return (
    <Stage>
      <output data-testid="refresh-count">{count}</output>
      <PullToRefresh
        data-testid="pull-to-refresh"
        isRefreshing={false}
        onRefresh={() => setCount((value) => value + 1)}
        style={{ height: 360 }}
      >
        <Feed>
          <div
            data-testid="nested-scroll"
            style={{ height: 140, overflowY: 'auto', border: '1px solid currentColor' }}
          >
            <div style={{ height: 420, padding: 12 }}>Nested scroll content</div>
          </div>
        </Feed>
      </PullToRefresh>
    </Stage>
  );
}

export const NestedContent: Story = { render: () => <NestedDemo /> };

export const RTL: Story = {
  render: () => (
    <Stage dir="rtl">
      <ContractDemo />
    </Stage>
  ),
};
