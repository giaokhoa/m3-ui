import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AppBarColumn,
  AppBarRow,
  IconButton,
  MenuItem,
  type AppBarAction,
} from '@m3/ui';

const meta = {
  title: 'Components/AppBarColumn',
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
  height,
  maxItemCount,
  dir = 'ltr',
  includeCustom = false,
  tallCustom = false,
  customTrigger = false,
}: {
  height: number;
  maxItemCount?: number;
  dir?: 'ltr' | 'rtl';
  includeCustom?: boolean;
  tallCustom?: boolean;
  customTrigger?: boolean;
}) {
  const [selected, setSelected] = useState(false);
  const [lastAction, setLastAction] = useState('none');
  const items: AppBarAction[] = [
    {
      type: 'action',
      id: 'share',
      label: 'Share this document',
      icon: <Icon>↗</Icon>,
      onPress: () => setLastAction('share'),
    },
    {
      type: 'toggle',
      id: 'pin',
      label: 'Pin',
      icon: <Icon>●</Icon>,
      isSelected: selected,
      onChange: (next) => {
        setSelected(next);
        setLastAction(next ? 'pin-on' : 'pin-off');
      },
    },
    {
      type: 'action',
      id: 'archive',
      label: 'Archive',
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
          data-testid="column-custom-inline"
          onClick={() => setLastAction('custom-inline')}
          style={{ inlineSize: 88, blockSize: tallCustom ? 72 : 40 }}
        >
          Custom content
        </button>
      ),
      renderOverflow: ({ dismiss }) => (
        <MenuItem
          id="column-custom-overflow"
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
    <div
      dir={dir}
      data-testid="app-bar-column-host"
      style={{ blockSize: height, inlineSize: 160 }}
    >
      <output data-testid="app-bar-column-action">{lastAction}</output>
      <AppBarColumn
        aria-label="Document actions"
        items={items}
        maxItemCount={maxItemCount}
        overflowTrigger={
          customTrigger
            ? ({ isOpen }) => (
                <IconButton
                  aria-label="Custom more actions"
                  data-open={isOpen || undefined}
                >
                  <Icon>+</Icon>
                </IconButton>
              )
            : undefined
        }
      />
    </div>
  );
}

export const AllFit: Story = { render: () => <Demo height={240} /> };
export const HeightOverflow: Story = { render: () => <Demo height={144} /> };
export const MaxCount: Story = {
  render: () => <Demo height={320} maxItemCount={3} />,
};
export const MixedItems: Story = {
  render: () => <Demo height={240} includeCustom />,
};
export const DisabledItem: Story = { render: () => <Demo height={240} /> };
export const CustomOverflowTrigger: Story = {
  render: () => <Demo height={144} customTrigger />,
};
export const VeryShort: Story = { render: () => <Demo height={40} /> };
export const Tall: Story = { render: () => <Demo height={360} /> };
export const RTL: Story = { render: () => <Demo height={144} dir="rtl" /> };
export const Resize: Story = { render: () => <Demo height={240} /> };
export const LongCustomHeight: Story = {
  render: () => <Demo height={176} includeCustom tallCustom />,
};
export const ToggleOverflow: Story = { render: () => <Demo height={96} /> };
export const RowAndColumn: Story = {
  render: () => {
    const items: AppBarAction[] = [
      { type: 'action', id: 'one', label: 'One', icon: <Icon>1</Icon>, onPress: () => {} },
      { type: 'action', id: 'two', label: 'Two', icon: <Icon>2</Icon>, onPress: () => {} },
      { type: 'action', id: 'three', label: 'Three', icon: <Icon>3</Icon>, onPress: () => {} },
    ];
    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <AppBarRow items={items} style={{ inlineSize: 144 }} />
        <div style={{ blockSize: 144 }}>
          <AppBarColumn items={items} />
        </div>
      </div>
    );
  },
};
