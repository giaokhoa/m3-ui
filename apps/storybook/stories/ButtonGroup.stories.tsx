import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonGroup, ThemeProvider, type ButtonGroupActionItem } from '@m3-ui/ui';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'fullscreen' },
  args: { items: [] },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const centerStyle = { minHeight: 260, display: 'grid', placeItems: 'center', padding: 32 } as const;

function ActionStory({ width = 520 }: { width?: number }) {
  const [lastAction, setLastAction] = useState('none');
  const items: ButtonGroupActionItem[] = [
    { id: 'one', label: 'One', onAction: () => setLastAction('one') },
    { id: 'two', label: 'Two medium', onAction: () => setLastAction('two') },
    { id: 'three', label: 'Three', onAction: () => setLastAction('three') },
  ];
  return (
    <div style={centerStyle}>
      <div>
        <ButtonGroup
          aria-label="Standard actions"
          data-testid="button-group"
          items={items}
          style={{ width }}
        />
        <output data-testid="last-action">{lastAction}</output>
      </div>
    </div>
  );
}

export const Standard: Story = { args: {}, render: () => <ActionStory /> };

function OverflowDemo() {
  const [narrow, setNarrow] = useState(true);
  const [lastAction, setLastAction] = useState('none');
  const items: ButtonGroupActionItem[] = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map((label) => ({
    id: label.toLowerCase(),
    label,
    onAction: () => setLastAction(label.toLowerCase()),
  }));
  return (
    <div style={centerStyle}>
      <div style={{ display: 'grid', gap: 24 }}>
        <Button onPress={() => setNarrow((value) => !value)} data-testid="toggle-width">
          Toggle width
        </Button>
        <ButtonGroup
          aria-label="Overflow actions"
          data-testid="button-group"
          items={items}
          style={{ width: narrow ? 260 : 620 }}
        />
        <output data-testid="last-action">{lastAction}</output>
      </div>
    </div>
  );
}

export const Overflow: Story = { args: {}, render: () => <OverflowDemo /> };

const connectedItems = [
  { id: 'work', label: 'Work' },
  { id: 'food', label: 'Food' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'travel', label: 'Travel' },
] as const;

export const ConnectedGeometry: Story = {
  args: {},
  render: () => (
    <div style={centerStyle}>
      <div style={{ display: 'grid', gap: 24 }}>
        {[2, 3, 4].map((count) => (
          <ButtonGroup
            aria-label={`${count} connected options`}
            data-testid={`connected-${count}`}
            items={connectedItems.slice(0, count)}
            key={count}
            selectionMode="single"
            variant="connected"
          />
        ))}
      </div>
    </div>
  ),
};

export const ConnectedSingle: Story = {
  args: {},
  render: () => (
    <div style={centerStyle}>
      <ButtonGroup
        aria-label="Single connected selection"
        data-testid="button-group"
        defaultSelectedKey="work"
        items={connectedItems.slice(0, 3)}
        selectionMode="single"
        variant="connected"
      />
    </div>
  ),
};

export const ConnectedMultiple: Story = {
  args: {},
  render: () => (
    <div style={centerStyle}>
      <ButtonGroup
        aria-label="Multiple connected selection"
        data-testid="button-group"
        defaultSelectedKeys={['work', 'coffee']}
        items={connectedItems}
        selectionMode="multiple"
        variant="connected"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {},
  render: () => (
    <div style={centerStyle}>
      <ButtonGroup
        aria-label="Disabled connected selection"
        data-testid="button-group"
        defaultSelectedKeys={['work']}
        items={[
          connectedItems[0],
          { ...connectedItems[1], isDisabled: true },
          connectedItems[2],
        ]}
        selectionMode="multiple"
        variant="connected"
      />
    </div>
  ),
};

export const Rtl: Story = {
  args: {},
  render: () => (
    <div dir="rtl" style={centerStyle}>
      <ButtonGroup
        aria-label="RTL connected selection"
        data-testid="button-group"
        defaultSelectedKey="work"
        items={connectedItems.slice(0, 3)}
        selectionMode="single"
        variant="connected"
      />
    </div>
  ),
};

export const ThemeMatrix: Story = {
  args: {},
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ButtonGroup aria-label="Light" items={connectedItems.slice(0, 3)} defaultSelectedKey="work" selectionMode="single" variant="connected" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ButtonGroup aria-label="Dark" items={connectedItems.slice(0, 3)} defaultSelectedKey="food" selectionMode="single" variant="connected" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60">
        <h3>Dynamic · Light</h3>
        <ButtonGroup aria-label="Dynamic light" items={connectedItems.slice(0, 3)} defaultSelectedKeys={['work', 'coffee']} selectionMode="multiple" variant="connected" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e">
        <h3>Dynamic · Dark</h3>
        <ButtonGroup aria-label="Dynamic dark" items={connectedItems.slice(0, 3)} defaultSelectedKeys={['food']} selectionMode="multiple" variant="connected" />
      </ThemeProvider>
    </div>
  ),
};
