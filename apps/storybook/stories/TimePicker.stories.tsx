import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimeInput, TimePicker, TimeScroll, type TimeInputDraftValue, type TimeOfDay } from '@m3-ui/ui';

const meta = {
  title: 'Components/TimePicker',
  parameters: { layout: 'centered' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TimePicker aria-label="Choose time" defaultValue={{ hour: 10, minute: 30 }} />
  ),
};
export const Midnight: Story = {
  render: () => <TimePicker layout="vertical" defaultValue={{ hour: 0, minute: 0 }} />,
};
export const Noon: Story = {
  render: () => <TimePicker layout="vertical" defaultValue={{ hour: 12, minute: 0 }} />,
};
export const TwentyFourHour: Story = {
  render: () => (
    <TimePicker layout="vertical" is24Hour defaultValue={{ hour: 18, minute: 45 }} />
  ),
};
export const Horizontal: Story = {
  render: () => <TimePicker layout="horizontal" defaultValue={{ hour: 9, minute: 15 }} />,
};
export const Vibrant: Story = {
  render: () => (
    <TimePicker layout="vertical" variant="vibrant" defaultValue={{ hour: 14, minute: 20 }} />
  ),
};
export const VibrantHorizontal: Story = {
  render: () => (
    <TimePicker layout="horizontal" variant="vibrant" defaultValue={{ hour: 14, minute: 20 }} />
  ),
};
export const Input: Story = {
  render: () => <TimeInput defaultValue={{ hour: 10, minute: 30 }} />,
};
export const VibrantInput: Story = {
  render: () => (
    <TimeInput variant="vibrant" defaultValue={{ hour: 21, minute: 5 }} is24Hour />
  ),
};

export const Scroll: Story = {
  render: () => <TimeScroll data-testid="time-scroll" defaultValue={{ hour: 10, minute: 30 }} />,
};
export const ScrollTwentyFourHour: Story = {
  render: () => (
    <TimeScroll data-testid="time-scroll" is24Hour defaultValue={{ hour: 18, minute: 45 }} />
  ),
};
export const ScrollRtl: Story = {
  render: () => (
    <div dir="rtl">
      <TimeScroll data-testid="time-scroll" defaultValue={{ hour: 8, minute: 10 }} />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <TimePicker layout="vertical" disabled defaultValue={{ hour: 7, minute: 40 }} />
  ),
};
export const Rtl: Story = {
  render: () => (
    <div dir="rtl">
      <TimePicker layout="vertical" defaultValue={{ hour: 8, minute: 10 }} />
    </div>
  ),
};

function ResponsiveDemo() {
  const [width, setWidth] = useState(420);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setWidth(420)}>Narrow</button>
        <button type="button" onClick={() => setWidth(720)}>Wide</button>
      </div>
      <div data-testid="time-picker-container" style={{ width }}>
        <TimePicker data-testid="responsive-time-picker" defaultValue={{ hour: 9, minute: 15 }} />
      </div>
    </div>
  );
}
export const Responsive: Story = { render: () => <ResponsiveDemo /> };

function SharedDemo() {
  const [value, setValue] = useState<TimeOfDay>({ hour: 11, minute: 25 });
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <TimePicker layout="vertical" value={value} onChange={setValue} />
      <TimeInput value={value} onChange={setValue} />
      <output data-testid="time-value">
        {String(value.hour).padStart(2, '0')}:{String(value.minute).padStart(2, '0')}
      </output>
    </div>
  );
}
export const SharedState: Story = { render: () => <SharedDemo /> };


function DraftStateDemo() {
  const [value, setValue] = useState<TimeOfDay>({ hour: 10, minute: 30 });
  const [draftValue, setDraftValue] = useState<TimeInputDraftValue>({ hour: '10', minute: '30' });
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TimeInput
        value={value}
        onChange={setValue}
        draftValue={draftValue}
        onDraftValueChange={setDraftValue}
      />
      <output data-testid="draft-time-value">
        {String(value.hour).padStart(2, '0')}:{String(value.minute).padStart(2, '0')}
      </output>
      <output data-testid="draft-raw-value">{draftValue.hour}:{draftValue.minute}</output>
    </div>
  );
}
export const DraftState: Story = { render: () => <DraftStateDemo /> };

function ModeSwitchDemo() {
  const [value, setValue] = useState<TimeOfDay>({ hour: 11, minute: 25 });
  const [mode, setMode] = useState<'dial' | 'input' | 'scroll'>('dial');
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => setMode('dial')}>Dial</button>
        <button type="button" onClick={() => setMode('input')}>Input</button>
        <button type="button" onClick={() => setMode('scroll')}>Scroll</button>
      </div>
      {mode === 'dial' ? <TimePicker layout="vertical" value={value} onChange={setValue} /> : null}
      {mode === 'input' ? <TimeInput value={value} onChange={setValue} /> : null}
      {mode === 'scroll' ? <TimeScroll value={value} onChange={setValue} /> : null}
      <output data-testid="switch-time-value">
        {String(value.hour).padStart(2, '0')}:{String(value.minute).padStart(2, '0')}
      </output>
    </div>
  );
}
export const ModeSwitch: Story = { render: () => <ModeSwitchDemo /> };
