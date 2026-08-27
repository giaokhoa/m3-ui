import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExposedDropdownMenu } from '@m3/ui';

const baseItems = [
  { value: 'compact', label: 'Compact' },
  { value: 'medium', label: 'Medium' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'disabled', label: 'Unavailable', isDisabled: true },
];

const meta = {
  title: 'Components/ExposedDropdownMenu',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ReadOnlyDemo({ variant = 'filled', secondary = false }: { variant?: 'filled' | 'outlined'; secondary?: boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('medium');
  return (
    <div style={{ width: 280, padding: 48 }}>
      <output data-testid="selected-value">{value}</output>
      <output data-testid="open-state">{String(open)}</output>
      <ExposedDropdownMenu
        aria-label="Density"
        label="Density"
        variant={variant}
        items={baseItems}
        value={value}
        onSelectionChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
        isReadOnly
        secondaryTrigger={secondary ? '⌄' : undefined}
      />
    </div>
  );
}

export const FilledReadOnly: Story = { render: () => <ReadOnlyDemo /> };
export const OutlinedReadOnly: Story = { render: () => <ReadOnlyDemo variant="outlined" /> };
export const SecondaryTrigger: Story = { render: () => <ReadOnlyDemo secondary /> };

function EditableDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('medium');
  const [inputValue, setInputValue] = useState('Medium');
  return (
    <div style={{ width: 320, padding: 48 }}>
      <output data-testid="selected-value">{value}</output>
      <output data-testid="input-value">{inputValue}</output>
      <ExposedDropdownMenu
        aria-label="Density"
        label="Density"
        items={baseItems}
        value={value}
        onSelectionChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
        inputValue={inputValue}
        onInputChange={setInputValue}
      />
    </div>
  );
}

export const Editable: Story = { render: () => <EditableDemo /> };

function ControlledDemo() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState('compact');
  const [inputValue, setInputValue] = useState('Compact');
  return (
    <div style={{ width: 300, padding: 48 }}>
      <output data-testid="open-state">{String(open)}</output>
      <output data-testid="selected-value">{value}</output>
      <output data-testid="input-value">{inputValue}</output>
      <ExposedDropdownMenu
        aria-label="Controlled density"
        label="Controlled density"
        items={baseItems}
        value={value}
        onSelectionChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
        inputValue={inputValue}
        onInputChange={setInputValue}
      />
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 280, padding: 48 }}>
      <ExposedDropdownMenu
        aria-label="Disabled density"
        label="Density"
        items={baseItems}
        value="medium"
        onSelectionChange={() => {}}
        isOpen={false}
        onOpenChange={() => {}}
        isReadOnly
        isDisabled
        secondaryTrigger="⌄"
      />
    </div>
  ),
};

function WidthDemo() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState('medium');
  return (
    <div style={{ width: 360, padding: 48 }}>
      <ExposedDropdownMenu
        aria-label="Free width density"
        label="Density"
        items={[...baseItems, { value: 'wide', label: 'A deliberately longer option label' }]}
        value={value}
        onSelectionChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
        isReadOnly
        matchAnchorWidth={false}
      />
    </div>
  );
}

export const WidthNotMatched: Story = { render: () => <WidthDemo /> };

function LongListDemo() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState('item-1');
  const items = useMemo(
    () => Array.from({ length: 40 }, (_, index) => ({ value: `item-${index + 1}`, label: `Item ${index + 1}` })),
    [],
  );
  return (
    <div style={{ width: 280, padding: 24 }}>
      <ExposedDropdownMenu
        aria-label="Long list"
        label="Long list"
        items={items}
        value={value}
        onSelectionChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
        isReadOnly
      />
    </div>
  );
}

export const LongList: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <LongListDemo />,
};

export const RTL: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 280, padding: 48 }}>
      <ReadOnlyDemo />
    </div>
  ),
};

function EdgeDemo() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState('medium');
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', insetInlineEnd: 2, bottom: 2, width: 260 }}>
        <ExposedDropdownMenu
          aria-label="Edge density"
          label="Density"
          items={baseItems}
          value={value}
          onSelectionChange={setValue}
          isOpen={open}
          onOpenChange={setOpen}
          isReadOnly
        />
      </div>
    </div>
  );
}

export const EdgePlacement: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <EdgeDemo />,
};

function FormDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('compact');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const output = event.currentTarget.querySelector<HTMLOutputElement>('[data-testid="form-value"]');
        if (output) output.value = String(data.get('density'));
      }}
    >
      <ExposedDropdownMenu
        aria-label="Form density"
        label="Density"
        name="density"
        items={baseItems}
        value={value}
        onSelectionChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
        isReadOnly
      />
      <button type="submit">Submit</button>
      <output data-testid="form-value" />
    </form>
  );
}

export const FormParticipation: Story = { render: () => <FormDemo /> };
