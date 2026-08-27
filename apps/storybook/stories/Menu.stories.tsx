import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ExposedMenu,
  Menu,
  MenuItem,
  MenuSection,
} from '@m3/ui';

const meta = {
  title: 'Components/Menu',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultDemo() {
  const [lastAction, setLastAction] = useState('none');
  return (
    <div style={{ padding: 80 }}>
      <output data-testid="menu-action">{lastAction}</output>
      <Menu
        aria-label="File actions"
        trigger={<Button data-testid="menu-trigger">Open menu</Button>}
        onAction={(key) => setLastAction(String(key))}
      >
        <MenuItem id="new" leading="＋" trailing="⌘N">New file</MenuItem>
        <MenuItem id="open" leading="↗" trailing="⌘O">Open</MenuItem>
        <MenuItem id="disabled" isDisabled>Unavailable</MenuItem>
        <MenuItem id="delete" leading="−">Delete</MenuItem>
      </Menu>
    </div>
  );
}

export const Default: Story = { render: () => <DefaultDemo /> };

function ControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 80 }}>
      <output data-testid="controlled-open">{String(open)}</output>
      <Menu
        aria-label="Controlled actions"
        isOpen={open}
        onOpenChange={setOpen}
        trigger={<Button data-testid="controlled-trigger">Controlled</Button>}
      >
        <MenuItem id="one">One</MenuItem>
        <MenuItem id="two">Two</MenuItem>
      </Menu>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const LongMenu: Story = {
  render: () => (
    <div style={{ height: 240, padding: 24 }}>
      <Menu
        aria-label="Long menu"
        defaultOpen
        trigger={<Button>Long menu</Button>}
      >
        {Array.from({ length: 24 }, (_, index) => (
          <MenuItem key={index} id={`item-${index}`}>Item {index + 1}</MenuItem>
        ))}
      </Menu>
    </div>
  ),
};

export const SegmentedGroups: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Menu
        aria-label="Grouped actions"
        defaultOpen
        trigger={<Button>Grouped</Button>}
      >
        <MenuSection label="Edit" variant="segmented">
          <MenuItem id="cut">Cut</MenuItem>
          <MenuItem id="copy">Copy</MenuItem>
        </MenuSection>
        <MenuSection label="Share" variant="segmented">
          <MenuItem id="link">Copy link</MenuItem>
          <MenuItem id="send">Send</MenuItem>
        </MenuSection>
      </Menu>
    </div>
  ),
};

function ExposedDemo() {
  const [value, setValue] = useState('Medium');
  return (
    <div style={{ padding: 80, width: 280 }}>
      <ExposedMenu
        aria-label="Density"
        label="Density"
        value={value}
        onAction={(key) => setValue(String(key))}
      >
        <MenuItem id="Compact">Compact</MenuItem>
        <MenuItem id="Medium">Medium</MenuItem>
        <MenuItem id="Comfortable">Comfortable</MenuItem>
      </ExposedMenu>
    </div>
  );
}

export const Exposed: Story = { render: () => <ExposedDemo /> };

export const EdgePlacement: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ position: 'relative', height: '100vh', minHeight: 360 }}>
      <div style={{ position: 'absolute', right: 2, bottom: 2 }}>
        <Menu
          aria-label="Edge menu"
          defaultOpen
          trigger={<Button data-testid="edge-trigger">Edge</Button>}
        >
          <MenuItem id="a">Alpha</MenuItem>
          <MenuItem id="b">Beta</MenuItem>
          <MenuItem id="c">Gamma</MenuItem>
        </Menu>
      </div>
    </div>
  ),
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ padding: 80 }}>
      <Menu
        aria-label="RTL actions"
        defaultOpen
        trigger={<Button>القائمة</Button>}
      >
        <MenuItem id="one" leading="★" trailing="1">الأول</MenuItem>
        <MenuItem id="two" leading="☆" trailing="2">الثاني</MenuItem>
      </Menu>
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <div style={{ padding: 80 }}>
      <Menu
        aria-label="Reduced motion menu"
        trigger={<Button data-testid="reduced-trigger">Menu</Button>}
      >
        <MenuItem id="one">One</MenuItem>
        <MenuItem id="two">Two</MenuItem>
      </Menu>
    </div>
  ),
};
