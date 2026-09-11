import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Surface, ThemeProvider } from '@m3-ui/ui';

const meta = {
  title: 'Components/Surface',
  component: Surface,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { inlineSize: 220, minBlockSize: 120, padding: 20 } as const;

export const PassiveDefault: Story = {
  render: () => <div className="storybook-center"><Surface style={box}>Passive surface</Surface></div>,
};

export const ShapeClipAndBorder: Story = {
  render: () => (
    <div className="storybook-center" style={{ gap: 24 }}>
      <Surface shape={28} style={{ inlineSize: 220, blockSize: 140 }}>
        <div data-testid="clipped-child" style={{ inlineSize: 320, blockSize: 200, background: 'var(--primary)' }} />
      </Surface>
      <Surface border={{ color: 'var(--outline)', width: 2 }} shape={16} style={box}>Bordered</Surface>
    </div>
  ),
};

export const Elevations: Story = {
  render: () => (
    <div className="storybook-center" style={{ gap: 20 }}>
      {(['level0', 'level1', 'level3', 'level5'] as const).map((level) => (
        <Surface key={level} tonalElevation={level} shadowElevation={level} shape={12} style={box} data-level={level}>{level}</Surface>
      ))}
    </div>
  ),
};

export const Clickable: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    return <div className="storybook-center" style={{ gap: 16 }}><span data-testid="click-count">{count}</span><Surface interaction={{ kind: 'clickable', onPress: () => setCount((v) => v + 1) }} shape={12} style={box}>Clickable</Surface></div>;
  },
};

export const DisabledClickable: Story = {
  render: () => <div className="storybook-center"><Surface interaction={{ kind: 'clickable', onPress: () => {} }} isDisabled shape={12} style={box}>Disabled</Surface></div>,
};

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return <div className="storybook-center"><Surface aria-label="Selectable surface" interaction={{ kind: 'selectable', selected, onSelect: () => setSelected((v) => !v) }} shape={12} style={box}>{selected ? 'Selected' : 'Not selected'}</Surface></div>;
  },
};

export const Toggleable: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <div className="storybook-center" style={{ gap: 20 }}><Surface aria-label="Checkbox surface" interaction={{ kind: 'toggleable', checked, onCheckedChange: setChecked }} shape={12} style={box}>Checkbox</Surface><Surface aria-label="Switch surface" interaction={{ kind: 'toggleable', checked, onCheckedChange: setChecked, role: 'switch' }} shape={12} style={box}>Switch</Surface><Surface aria-label="Pressed surface" interaction={{ kind: 'toggleable', checked, onCheckedChange: setChecked, role: 'button' }} shape={12} style={box}>Pressed</Surface></div>;
  },
};

export const Nested: Story = {
  render: () => <div className="storybook-center"><Surface tonalElevation="level1" shape={20} style={{ padding: 24 }} data-testid="outer-surface"><Surface tonalElevation="level2" shape={12} style={box} data-testid="inner-surface">Nested tonal elevation</Surface></Surface></div>,
};

export const ThemeMatrix: Story = {
  render: () => <div className="storybook-theme-grid"><ThemeProvider className="storybook-theme-card" mode="light"><h3>Light</h3><Surface tonalElevation="level3" shadowElevation="level2" shape={12} style={box}>Surface</Surface></ThemeProvider><ThemeProvider className="storybook-theme-card" mode="dark"><h3>Dark</h3><Surface tonalElevation="level3" shadowElevation="level2" shape={12} style={box}>Surface</Surface></ThemeProvider></div>,
};
