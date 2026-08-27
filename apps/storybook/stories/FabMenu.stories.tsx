import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FloatingActionButtonMenu,
  FloatingActionButtonMenuItem,
  ToggleFloatingActionButton,
} from '@m3/ui';

const meta = {
  title: 'Components/FabMenu',
  component: FloatingActionButtonMenu,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FloatingActionButtonMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" fill="currentColor" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 17.3V20h2.7l8-8-2.7-2.7-8 8Zm12.8-7.4a.7.7 0 0 0 0-1l-1.7-1.7a.7.7 0 0 0-1 0l-1.3 1.3 2.7 2.7 1.3-1.3Z" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.1c.1-.3.1-.5.1-.8s0-.5-.1-.8L16 7.1c.5.5 1.2.8 2 .8a3 3 0 1 0-3-3c0 .3 0 .5.1.8L8 9.8a3 3 0 1 0 0 4.4l7.1 4.1c-.1.2-.1.5-.1.7a3 3 0 1 0 3-2.9Z" fill="currentColor" />
    </svg>
  );
}

function FabMenuDemo({
  initialExpanded = false,
  dir = 'ltr',
  maxMenuHeight,
}: {
  initialExpanded?: boolean;
  dir?: 'ltr' | 'rtl';
  maxMenuHeight?: number;
}) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [lastAction, setLastAction] = useState('none');
  const act = (name: string) => {
    setLastAction(name);
    setExpanded(false);
  };

  return (
    <div dir={dir} style={{ position: 'relative', inlineSize: 360, blockSize: 420, overflow: 'hidden' }}>
      <output data-testid="fab-menu-action" style={{ position: 'absolute', inset: 16 }}>
        {lastAction}
      </output>
      <div style={{ position: 'absolute', insetInlineEnd: 0, insetBlockEnd: 0 }}>
        <FloatingActionButtonMenu
          aria-label="Create actions"
          expanded={expanded}
          horizontalAlignment="end"
          maxMenuHeight={maxMenuHeight}
          onExpandedChange={setExpanded}
          trigger={
            <ToggleFloatingActionButton
              aria-label="More actions"
              checked={expanded}
              checkedIcon={<CloseIcon />}
              icon={<PlusIcon />}
              onCheckedChange={setExpanded}
            />
          }
        >
          <FloatingActionButtonMenuItem icon={<EditIcon />} onPress={() => act('edit')}>
            Edit
          </FloatingActionButtonMenuItem>
          <FloatingActionButtonMenuItem icon={<ShareIcon />} onPress={() => act('share')}>
            Share
          </FloatingActionButtonMenuItem>
          <FloatingActionButtonMenuItem isDisabled icon={<PlusIcon />} onPress={() => act('archive')}>
            Archive
          </FloatingActionButtonMenuItem>
        </FloatingActionButtonMenu>
      </div>
    </div>
  );
}

export const Default: Story = { render: () => <FabMenuDemo /> };
export const Expanded: Story = { render: () => <FabMenuDemo initialExpanded /> };
export const RTL: Story = { render: () => <FabMenuDemo dir="rtl" initialExpanded /> };
export const ReducedMotion: Story = { render: () => <FabMenuDemo /> };
export const RapidToggle: Story = { render: () => <FabMenuDemo /> };

function OverflowDemo() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ position: 'relative', inlineSize: 360, blockSize: 300, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', insetInlineEnd: 0, insetBlockEnd: 0 }}>
        <FloatingActionButtonMenu
          expanded={expanded}
          maxMenuHeight={180}
          onExpandedChange={setExpanded}
          trigger={
            <ToggleFloatingActionButton
              aria-label="Overflow actions"
              checked={expanded}
              checkedIcon={<CloseIcon />}
              icon={<PlusIcon />}
              onCheckedChange={setExpanded}
            />
          }
        >
          {Array.from({ length: 12 }, (_, index) => (
            <FloatingActionButtonMenuItem
              key={index}
              icon={<PlusIcon />}
              onPress={() => undefined}
            >
              Action {index + 1}
            </FloatingActionButtonMenuItem>
          ))}
        </FloatingActionButtonMenu>
      </div>
    </div>
  );
}

export const Overflow: Story = { render: () => <OverflowDemo /> };

export const ToggleGeometry: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 24, padding: 48, alignItems: 'start' }}>
      {(['baseline', 'medium', 'large'] as const).map((size) => (
        <div key={size} style={{ display: 'grid', gap: 16 }}>
          <ToggleFloatingActionButton
            aria-label={`${size} unchecked`}
            checked={false}
            icon={<PlusIcon />}
            onCheckedChange={() => undefined}
            size={size}
          />
          <ToggleFloatingActionButton
            aria-label={`${size} checked`}
            checked
            checkedIcon={<CloseIcon />}
            icon={<PlusIcon />}
            onCheckedChange={() => undefined}
            size={size}
          />
        </div>
      ))}
    </div>
  ),
};
