import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppBarRow, IconButton, MenuItem, type AppBarAction } from '@m3/ui';

const meta = {
  title: 'Components/AppBarRow',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'grid', inlineSize: 24, blockSize: 24, placeItems: 'center' }}
    >
      {children}
    </span>
  );
}

function Demo({
  width,
  maxItemCount,
  dir = 'ltr',
  includeCustom = false,
  longLabels = false,
  customTrigger = false,
}: {
  width: number;
  maxItemCount?: number;
  dir?: 'ltr' | 'rtl';
  includeCustom?: boolean;
  longLabels?: boolean;
  customTrigger?: boolean;
}) {
  const [selected, setSelected] = useState(false);
  const [lastAction, setLastAction] = useState('none');
  const labels = longLabels
    ? [
        'Share this document with everyone in the workspace',
        'Pin this document to the primary navigation area',
        'Archive this document after the current review finishes',
      ]
    : ['Share', 'Pin', 'Archive'];

  const items: AppBarAction[] = [
    {
      type: 'action',
      id: 'share',
      label: labels[0],
      icon: <Icon>↗</Icon>,
      onPress: () => setLastAction('share'),
    },
    {
      type: 'toggle',
      id: 'pin',
      label: labels[1],
      icon: <Icon>●</Icon>,
      isSelected: selected,
      onChange: (next) => {
        setSelected(next);
        setLastAction(next ? 'pin-on' : 'pin-off');
      },
    },
    {
      type: 'action',
      id: 'disabled',
      label: labels[2],
      icon: <Icon>×</Icon>,
      isDisabled: true,
      onPress: () => setLastAction('disabled'),
    },
    {
      type: 'action',
      id: 'settings',
      label: 'Settings',
      icon: <Icon>⚙</Icon>,
      onPress: () => setLastAction('settings'),
    },
  ];

  if (includeCustom) {
    items.splice(2, 0, {
      type: 'custom',
      id: 'custom',
      renderInline: () => (
        <button
          type="button"
          data-testid="custom-inline"
          onClick={() => setLastAction('custom-inline')}
          style={{ inlineSize: 72, blockSize: 40 }}
        >
          Custom
        </button>
      ),
      renderOverflow: ({ dismiss }) => (
        <MenuItem
          id="custom-overflow"
          onAction={() => {
            setLastAction('custom-overflow');
            dismiss();
          }}
        >
          Custom overflow
        </MenuItem>
      ),
    });
  }

  return (
    <div dir={dir} style={{ inlineSize: width }} data-testid="app-bar-row-host">
      <output data-testid="app-bar-row-action">{lastAction}</output>
      <AppBarRow
        aria-label="Document actions"
        items={items}
        maxItemCount={maxItemCount}
        overflowTrigger={
          customTrigger
            ? ({ isOpen }) => (
                <IconButton aria-label="Custom more actions" data-open={isOpen || undefined}>
                  <Icon>+</Icon>
                </IconButton>
              )
            : undefined
        }
      />
    </div>
  );
}

export const AllFit: Story = { render: () => <Demo width={240} /> };
export const WidthOverflow: Story = { render: () => <Demo width={144} /> };
export const MaxCount: Story = { render: () => <Demo width={320} maxItemCount={3} /> };
export const Resize: Story = { render: () => <Demo width={240} /> };
export const RTL: Story = { render: () => <Demo width={144} dir="rtl" /> };
export const CustomItem: Story = { render: () => <Demo width={240} includeCustom /> };
export const CustomOverflowTrigger: Story = { render: () => <Demo width={144} customTrigger /> };
export const LongLabels: Story = { render: () => <Demo width={144} longLabels /> };
export const ToggleOverflow: Story = { render: () => <Demo width={96} /> };
