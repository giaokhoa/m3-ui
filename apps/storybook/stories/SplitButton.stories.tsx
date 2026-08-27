import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitButton, ThemeProvider } from '@m3-ui/ui';

const meta = {
  title: 'Components/SplitButton',
  component: SplitButton,
  parameters: { layout: 'fullscreen' },
  args: {
    leading: 'Save',
    trailing: <ChevronDownIcon />,
    leadingAriaLabel: 'Save',
    trailingAriaLabel: 'More save options',
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m7 10 5 5 5-5H7Z" fill="currentColor" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5Z" fill="currentColor" />
    </svg>
  );
}

function storyFrame(children: ReactNode) {
  return <div className="storybook-center">{children}</div>;
}

export const Default: Story = {
  render: (args) => storyFrame(<SplitButton {...args} />),
};

export const Variants: Story = {
  render: () =>
    storyFrame(
      <div className="storybook-stack">
        <SplitButton leading="Filled" trailing={<ChevronDownIcon />} trailingAriaLabel="Filled options" />
        <SplitButton variant="tonal" leading="Tonal" trailing={<ChevronDownIcon />} trailingAriaLabel="Tonal options" />
        <SplitButton variant="elevated" leading="Elevated" trailing={<ChevronDownIcon />} trailingAriaLabel="Elevated options" />
        <SplitButton variant="outlined" leading="Outlined" trailing={<ChevronDownIcon />} trailingAriaLabel="Outlined options" />
      </div>,
    ),
};

export const Sizes: Story = {
  render: () =>
    storyFrame(
      <div className="storybook-stack">
        {(['extraSmall', 'small', 'medium', 'large', 'extraLarge'] as const).map((size) => (
          <SplitButton
            key={size}
            size={size}
            leading={size}
            trailing={<ChevronDownIcon />}
            trailingAriaLabel={`${size} options`}
          />
        ))}
      </div>,
    ),
};

export const Constrained: Story = {
  render: () =>
    storyFrame(
      <div className="storybook-stack">
        <SplitButton
          data-testid="split-unconstrained"
          leading="A very long primary action label"
          trailing="Options"
          trailingAriaLabel="Unconstrained options"
        />
        <div style={{ width: 220 }}>
          <SplitButton
            data-testid="split-constrained"
            style={{ width: '100%' }}
            leading="A very long primary action label that must yield width first"
            trailing="Options"
            trailingAriaLabel="Constrained options"
          />
        </div>
      </div>,
    ),
};

export const EqualHeight: Story = {
  render: () =>
    storyFrame(
      <div style={{ width: 260 }}>
        <SplitButton
          style={{ width: '100%' }}
          leading="Primary action with enough text to wrap onto another line"
          trailing={<ChevronDownIcon />}
          trailingAriaLabel="More options"
        />
      </div>,
    ),
};

export const IndependentDisabled: Story = {
  render: () =>
    storyFrame(
      <div className="storybook-stack">
        <SplitButton
          isLeadingDisabled
          leading="Primary disabled"
          trailing={<ChevronDownIcon />}
          trailingAriaLabel="More options"
        />
        <SplitButton
          isTrailingDisabled
          leading="Primary enabled"
          trailing={<ChevronDownIcon />}
          trailingAriaLabel="More options disabled"
        />
      </div>,
    ),
};

function InteractionExample() {
  const [leadingPresses, setLeadingPresses] = useState(0);
  const [trailingPresses, setTrailingPresses] = useState(0);
  return (
    <div className="storybook-stack">
      <SplitButton
        leading="Run"
        trailing={<ChevronDownIcon />}
        trailingAriaLabel="Run options"
        onLeadingPress={() => setLeadingPresses((count) => count + 1)}
        onTrailingPress={() => setTrailingPresses((count) => count + 1)}
      />
      <span data-testid="leading-press-count">Leading presses: {leadingPresses}</span>
      <span data-testid="trailing-press-count">Trailing presses: {trailingPresses}</span>
    </div>
  );
}

export const Interactions: Story = {
  render: () => storyFrame(<InteractionExample />),
};

function CheckableExample() {
  const [checked, setChecked] = useState(false);
  return (
    <SplitButton
      leading="Favorite"
      trailing={<StarIcon />}
      trailingAriaLabel="Pin favorite"
      trailingChecked={checked}
      onTrailingCheckedChange={setChecked}
    />
  );
}

export const CheckableTrailing: Story = {
  render: () => storyFrame(<CheckableExample />),
};

export const ExpandedTrailing: Story = {
  render: () =>
    storyFrame(
      <SplitButton
        leading="Export"
        trailing={<ChevronDownIcon />}
        trailingAriaLabel="Export menu"
        trailingExpanded
      />,
    ),
};

export const RTL: Story = {
  render: () =>
    storyFrame(
      <div dir="rtl">
        <SplitButton
          leading="שמירה"
          trailing={<ChevronDownIcon />}
          trailingAriaLabel="אפשרויות"
        />
      </div>,
    ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Light</h3>
        <SplitButton leading="Filled" trailing={<ChevronDownIcon />} trailingAriaLabel="Options" />
        <SplitButton variant="outlined" leading="Outlined" trailing={<ChevronDownIcon />} trailingAriaLabel="Options" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Dark</h3>
        <SplitButton variant="tonal" leading="Tonal" trailing={<ChevronDownIcon />} trailingAriaLabel="Options" />
        <SplitButton variant="elevated" leading="Elevated" trailing={<ChevronDownIcon />} trailingAriaLabel="Options" />
      </ThemeProvider>
    </div>
  ),
};
