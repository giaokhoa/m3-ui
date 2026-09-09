import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AssistChip,
  Badge,
  BadgedBox,
  Button,
  ElevatedAssistChip,
  FilterChip,
  HorizontalDivider,
  ListItem,
  Menu,
  MenuItem,
  ThemeProvider,
} from '@m3-ui/ui';

const meta = {
  title: 'Conformance/ContentPrimitives',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function MotionAndDirectionDemo() {
  const [selected, setSelected] = useState(false);

  return (
    <div
      style={{
        display: 'grid',
        gap: 24,
        alignItems: 'start',
        padding: 32,
        maxWidth: 520,
      }}
    >
      <FilterChip
        data-testid="motion-chip"
        isSelected={selected}
        onChange={setSelected}
        shapes={{}}
      >
        Motion filter
      </FilterChip>
      <AssistChip
        data-testid="rtl-chip"
        leadingIcon={<span data-testid="chip-leading">L</span>}
        trailingIcon={<span data-testid="chip-trailing">T</span>}
      >
        Directional chip
      </AssistChip>
      <ListItem data-testid="motion-list-item" onPress={() => {}}>
        Motion list item
      </ListItem>
    </div>
  );
}

export const MotionAndDirection: Story = {
  render: () => <MotionAndDirectionDemo />,
};

function DynamicThemeDemo() {
  return (
    <ThemeProvider
      className="content-primitives-dynamic-theme"
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
        }}
      >
        <ElevatedAssistChip data-testid="theme-chip">
          Dynamic chip
        </ElevatedAssistChip>
        <ListItem data-testid="theme-list-item">Dynamic list item</ListItem>
        <BadgedBox
          data-testid="theme-badged-box"
          badge={<Badge data-testid="theme-badge">3</Badge>}
        >
          <span>Inbox</span>
        </BadgedBox>
        <HorizontalDivider data-testid="theme-divider" />
        <Menu
          aria-label="Dynamic menu"
          trigger={<Button data-testid="theme-menu-trigger">Open dynamic menu</Button>}
        >
          <MenuItem id="first" data-testid="theme-menu-item">
            First item
          </MenuItem>
        </Menu>
      </div>
    </ThemeProvider>
  );
}

export const DynamicTheme: Story = {
  render: () => <DynamicThemeDemo />,
};
