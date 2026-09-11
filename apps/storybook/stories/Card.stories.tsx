import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Button,
  Card,
  ElevatedCard,
  OutlinedCard,
  ThemeProvider,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const cardStyle = { inlineSize: 280 } as const;
const contentStyle = { padding: 20, gap: 8 } as const;

function Content({ title, body = 'Supporting content for the card.' }: { title: string; body?: string }) {
  return (
    <div style={contentStyle}>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function VariantRow({ disabled = false }: { disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <Card style={cardStyle} isDisabled={disabled} onPress={disabled ? () => {} : undefined}>
        <Content title="Filled" />
      </Card>
      <ElevatedCard
        style={cardStyle}
        isDisabled={disabled}
        onPress={disabled ? () => {} : undefined}
      >
        <Content title="Elevated" />
      </ElevatedCard>
      <OutlinedCard
        style={cardStyle}
        isDisabled={disabled}
        onPress={disabled ? () => {} : undefined}
      >
        <Content title="Outlined" />
      </OutlinedCard>
    </div>
  );
}

function ClickableRow() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <span data-testid="card-press-count">Card presses: {count}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <Card style={cardStyle} onPress={() => setCount((value) => value + 1)}>
          <Content title="Filled clickable" />
        </Card>
        <ElevatedCard style={cardStyle} onPress={() => setCount((value) => value + 1)}>
          <Content title="Elevated clickable" />
        </ElevatedCard>
        <OutlinedCard style={cardStyle} onPress={() => setCount((value) => value + 1)}>
          <Content title="Outlined clickable" />
        </OutlinedCard>
      </div>
    </div>
  );
}

export const Variants: Story = {
  render: () => (
    <div className="storybook-center">
      <VariantRow />
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="storybook-center">
      <ClickableRow />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="storybook-center">
      <VariantRow disabled />
    </div>
  ),
};

export const CustomShape: Story = {
  render: () => (
    <div className="storybook-center">
      <Card style={cardStyle} shape={4}>
        <Content title="4px shape override" />
      </Card>
    </div>
  ),
};

export const FocusModes: Story = {
  render: () => (
    <div className="storybook-center" style={{ gap: 32 }}>
      <ThemeProvider rippleFocus="opacity">
        <Card style={cardStyle} onPress={() => {}}>
          <Content title="Opacity focus" />
        </Card>
      </ThemeProvider>
      <ThemeProvider rippleFocus="inset-ring">
        <Card style={cardStyle} onPress={() => {}}>
          <Content title="Inset focus ring" />
        </Card>
      </ThemeProvider>
    </div>
  ),
};

export const NestedAction: Story = {
  render: () => {
    const [cardCount, setCardCount] = useState(0);
    const [buttonCount, setButtonCount] = useState(0);
    return (
      <div className="storybook-center">
        <Card style={cardStyle} onPress={() => setCardCount((value) => value + 1)}>
          <div style={contentStyle}>
            <strong>Card with child action</strong>
            <span data-testid="nested-card-count">Card presses: {cardCount}</span>
            <span data-testid="nested-button-count">Button presses: {buttonCount}</span>
            <Button onPress={() => setButtonCount((value) => value + 1)}>Child action</Button>
          </div>
        </Card>
      </div>
    );
  },
};

export const RoleOptIn: Story = {
  render: () => (
    <div className="storybook-center">
      <Card aria-label="Action card" role="button" style={cardStyle} onPress={() => {}}>
        <Content title="Explicit web button role" />
      </Card>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <VariantRow />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <VariantRow />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60">
        <h3>Dynamic · #006A60</h3>
        <VariantRow />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e">
        <h3>Dynamic dark · #B3261E</h3>
        <VariantRow />
      </ThemeProvider>
    </div>
  ),
};
