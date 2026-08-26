import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListItem, ListItemSelectionGroup, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/ListItem',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const personIcon = <Icon><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" /></Icon>;
const chevronIcon = <Icon><path d="m9 18 6-6-6-6 1.4-1.4L17.8 12l-7.4 7.4L9 18Z" /></Icon>;

function Stage({ children, dir }: { children: ReactNode; dir?: 'ltr' | 'rtl' }) {
  return (
    <div dir={dir} style={{ maxWidth: 560, margin: '32px auto', background: 'var(--surface)', color: 'var(--on-surface)' }}>
      {children}
    </div>
  );
}

export const Geometry: Story = {
  render: () => (
    <Stage>
      <ListItem data-testid="list-one" leading={personIcon} trailing="Meta">One-line headline</ListItem>
      <ListItem data-testid="list-two" leading={personIcon} trailing={chevronIcon} supportingText="Supporting text">Two-line headline</ListItem>
      <ListItem data-testid="list-three" leading={personIcon} trailing="11:42" overline="OVERLINE" supportingText="Supporting text">Three-line headline</ListItem>
    </Stage>
  ),
};

export const Clickable: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <Stage>
        <ListItem data-testid="list-clickable" leading={personIcon} trailing={chevronIcon} supportingText={`Pressed ${count} times`} onPress={() => setCount((value) => value + 1)}>Clickable item</ListItem>
      </Stage>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Stage>
      <ListItem data-testid="list-disabled-passive" isDisabled leading={personIcon}>Disabled passive</ListItem>
      <ListItem data-testid="list-disabled-clickable" isDisabled leading={personIcon} onPress={() => undefined}>Disabled clickable</ListItem>
    </Stage>
  ),
};

export const SingleSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState('alpha');
    return (
      <Stage>
        <div data-testid="single-selection-value">Selected: {selected}</div>
        <ListItemSelectionGroup aria-label="Single choice">
          {['alpha', 'beta', 'gamma'].map((value) => (
            <ListItem key={value} data-testid={`single-${value}`} selectionMode="single" selected={selected === value} onPress={() => setSelected(value)} leading={personIcon}>{value}</ListItem>
          ))}
        </ListItemSelectionGroup>
      </Stage>
    );
  },
};

export const MultipleSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <Stage>
        <ListItem data-testid="multi-item" selectionMode="multiple" selected={selected} onSelectionChange={setSelected} leading={personIcon} trailing={selected ? 'On' : 'Off'}>Multiple choice</ListItem>
      </Stage>
    );
  },
};

export const VisualStates: Story = {
  render: () => (
    <Stage>
      <ListItem data-testid="selected-item" selectionMode="multiple" selected onSelectionChange={() => undefined} leading={personIcon}>Selected</ListItem>
      <ListItem data-testid="dragged-item" isDragged leading={personIcon} onPress={() => undefined}>Dragged</ListItem>
      <ListItem data-testid="selected-disabled-item" selectionMode="multiple" selected isDisabled onSelectionChange={() => undefined} leading={personIcon}>Selected disabled</ListItem>
    </Stage>
  ),
};

export const RTL: Story = {
  render: () => (
    <Stage dir="rtl">
      <ListItem data-testid="rtl-item" leading={personIcon} trailing={chevronIcon} supportingText="Supporting text">RTL headline</ListItem>
    </Stage>
  ),
};

function ThemeList({ mode, sourceColor, label }: { mode: 'light' | 'dark'; sourceColor?: string; label: string }) {
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div style={{ background: 'var(--surface)', padding: 16 }}>
        <div style={{ marginBottom: 8, color: 'var(--on-surface)' }}>{label}</div>
        <ListItem leading={personIcon} supportingText="Supporting text">List item</ListItem>
      </div>
    </ThemeProvider>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 12 }}>
      <ThemeList label="Baseline light" mode="light" />
      <ThemeList label="Baseline dark" mode="dark" />
      <ThemeList label="Dynamic light" mode="light" sourceColor="#006a60" />
      <ThemeList label="Dynamic dark" mode="dark" sourceColor="#b3261e" />
    </div>
  ),
};
