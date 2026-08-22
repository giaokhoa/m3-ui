import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import {
  AssistChip,
  ElevatedAssistChip,
  ElevatedFilterChip,
  ElevatedSuggestionChip,
  FilterChip,
  InputChip,
  SuggestionChip,
  ThemeProvider,
} from '@m3/ui';

const meta = {
  title: 'Components/Chip',
  component: AssistChip,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AssistChip>;

export default meta;
type Story = StoryObj<typeof meta>;

function SparkIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path fill="currentColor" d="M9 1.5 10.7 7 16.5 9l-5.8 2L9 16.5 7.3 11 1.5 9l5.8-2L9 1.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" d="m3.5 9 3.2 3.2 7.8-7.4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2" d="m4.5 4.5 9 9m0-9-9 9" />
    </svg>
  );
}

function AvatarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" fill="currentColor" opacity="0.16" />
      <circle cx="12" cy="9" r="4" fill="currentColor" />
      <path fill="currentColor" d="M5 22c.4-4.4 3-7 7-7s6.6 2.6 7 7H5Z" />
    </svg>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function ActionVariantsRow({ disabled = false }: { disabled?: boolean }) {
  return (
    <Row>
      <AssistChip isDisabled={disabled} leadingIcon={<SparkIcon />} onPress={() => {}}>
        Assist
      </AssistChip>
      <ElevatedAssistChip
        isDisabled={disabled}
        leadingIcon={<SparkIcon />}
        trailingIcon={<CloseIcon />}
        onPress={() => {}}
      >
        Elevated assist
      </ElevatedAssistChip>
      <SuggestionChip isDisabled={disabled} icon={<SparkIcon />} onPress={() => {}}>
        Suggestion
      </SuggestionChip>
      <ElevatedSuggestionChip isDisabled={disabled} icon={<SparkIcon />} onPress={() => {}}>
        Elevated suggestion
      </ElevatedSuggestionChip>
    </Row>
  );
}

function SelectableRow({ disabled = false }: { disabled?: boolean }) {
  const [filter, setFilter] = useState(false);
  const [elevated, setElevated] = useState(true);
  const [input, setInput] = useState(true);

  return (
    <Row>
      <FilterChip
        isDisabled={disabled}
        isSelected={filter}
        leadingIcon={filter ? <CheckIcon /> : <SparkIcon />}
        onChange={setFilter}
      >
        Filter
      </FilterChip>
      <ElevatedFilterChip
        isDisabled={disabled}
        isSelected={elevated}
        leadingIcon={elevated ? <CheckIcon /> : <SparkIcon />}
        trailingIcon={<CloseIcon />}
        onChange={setElevated}
      >
        Elevated filter
      </ElevatedFilterChip>
      <InputChip
        avatar={<AvatarIcon />}
        isDisabled={disabled}
        isSelected={input}
        trailingIcon={<CloseIcon />}
        onChange={setInput}
      >
        Input
      </InputChip>
    </Row>
  );
}

export const ActionVariants: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <ActionVariantsRow />
    </div>
  ),
};

export const SelectableStates: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <SelectableRow />
    </div>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <div
      className="m3-storybook-center"
      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}
    >
      <ActionVariantsRow disabled />
      <SelectableRow disabled />
    </div>
  ),
};

export const ExpressiveShapes: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    return (
      <div className="m3-storybook-center">
        <FilterChip
          shapes={{}}
          isSelected={selected}
          leadingIcon={<CheckIcon />}
          trailingIcon={<CloseIcon />}
          onChange={setSelected}
        >
          Expressive filter
        </FilterChip>
        <InputChip
          shapes={{}}
          avatar={<AvatarIcon />}
          isSelected={selected}
          trailingIcon={<CloseIcon />}
          onChange={setSelected}
        >
          Expressive input
        </InputChip>
      </div>
    );
  },
};

export const FocusModes: Story = {
  render: () => (
    <div className="m3-storybook-center" style={{ gap: 32 }}>
      <ThemeProvider rippleFocus="opacity">
        <AssistChip onPress={() => {}}>Opacity focus</AssistChip>
      </ThemeProvider>
      <ThemeProvider rippleFocus="inset-ring">
        <AssistChip onPress={() => {}}>Inset ring</AssistChip>
      </ThemeProvider>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="m3-storybook-theme-grid">
      <ThemeProvider className="m3-storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ActionVariantsRow />
        <SelectableRow />
      </ThemeProvider>
      <ThemeProvider className="m3-storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ActionVariantsRow />
        <SelectableRow />
      </ThemeProvider>
      <ThemeProvider className="m3-storybook-theme-card" mode="light" sourceColor="#006a60">
        <h3>Dynamic · #006A60</h3>
        <ActionVariantsRow />
        <SelectableRow />
      </ThemeProvider>
      <ThemeProvider className="m3-storybook-theme-card" mode="dark" sourceColor="#b3261e">
        <h3>Dynamic dark · #B3261E</h3>
        <ActionVariantsRow />
        <SelectableRow />
      </ThemeProvider>
    </div>
  ),
};
