import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ElevatedToggleButton,
  FilledTonalToggleButton,
  OutlinedToggleButton,
  ToggleButton,
  type ToggleButtonSize,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  parameters: { layout: 'fullscreen' },
  args: {
    children: 'Toggle',
    isSelected: false,
    onChange: () => {},
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function AddIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor" />
    </svg>
  );
}

function VariantRow({ selected, disabled = false }: { selected: boolean; disabled?: boolean }) {
  const noop = () => {};
  return (
    <div className="storybook-stack">
      <ToggleButton isDisabled={disabled} isSelected={selected} onChange={noop}>Filled</ToggleButton>
      <ElevatedToggleButton isDisabled={disabled} isSelected={selected} onChange={noop}>Elevated</ElevatedToggleButton>
      <FilledTonalToggleButton isDisabled={disabled} isSelected={selected} onChange={noop}>Tonal</FilledTonalToggleButton>
      <OutlinedToggleButton isDisabled={disabled} isSelected={selected} onChange={noop}>Outlined</OutlinedToggleButton>
    </div>
  );
}

function ControlledDemo() {
  const [selected, setSelected] = useState(false);
  return (
    <ToggleButton isSelected={selected} onChange={setSelected} startIcon={<AddIcon />}>
      Controlled
    </ToggleButton>
  );
}

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <ToggleButton isSelected={false} onChange={() => {}}>Toggle</ToggleButton>
    </div>
  ),
};

export const VariantStates: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 24 }}>
        <VariantRow selected={false} />
        <VariantRow selected />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        {(['extraSmall', 'small', 'medium', 'large', 'extraLarge'] as ToggleButtonSize[]).map((size) => (
          <FilledTonalToggleButton
            key={size}
            aria-label={`${size} toggle`}
            isSelected={false}
            onChange={() => {}}
            size={size}
          >
            {size}
          </FilledTonalToggleButton>
        ))}
      </div>
    </div>
  ),
};

export const Content: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        <ToggleButton isSelected={false} onChange={() => {}}>Text only</ToggleButton>
        <ToggleButton isSelected={false} onChange={() => {}} startIcon={<AddIcon />}>Icon and text</ToggleButton>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => <div className="storybook-center"><ControlledDemo /></div>,
};

export const Disabled: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 24 }}>
        <VariantRow disabled selected={false} />
        <VariantRow disabled selected />
      </div>
    </div>
  ),
};

export const Rtl: Story = {
  render: () => (
    <div className="storybook-center" dir="rtl">
      <ToggleButton isSelected={false} onChange={() => {}} startIcon={<AddIcon />}>
        نص تجريبي
      </ToggleButton>
    </div>
  ),
};

export const ReducedMotion: Story = {
  parameters: { reducedMotion: 'reduce' },
  render: () => <div className="storybook-center"><ControlledDemo /></div>,
};
