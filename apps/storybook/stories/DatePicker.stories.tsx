import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Button,
  DatePicker,
  DateRangePicker,
  Dialog,
  DialogAction,
  DialogActions,
  DialogCloseAction,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  type DatePickerDate,
  type DatePickerRangeValue,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Calendar: Story = {
  args: {
    defaultValue: '2026-08-26',
    defaultDisplayedMonth: '2026-08-01',
  },
};

/** Keeps the visible month coupled to the browser's notion of today for stable today-indicator coverage. */
export const Today: Story = { args: {} };

export const UnavailableDate: Story = {
  args: {
    defaultDisplayedMonth: '2026-08-01',
    isDateUnavailable: (date) => date === '2026-08-27',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: '2026-08-26',
    defaultDisplayedMonth: '2026-08-01',
    isDisabled: true,
  },
};

export const InputMode: Story = {
  args: {
    defaultValue: '2026-08-26',
    defaultDisplayMode: 'input',
  },
};

export const Docked: Story = {
  args: {
    variant: 'docked',
    defaultValue: '2026-08-26',
    defaultDisplayedMonth: '2026-08-01',
  },
};

export const LocaleMondayFirst: Story = {
  args: {
    locale: 'vi-VN',
    firstDayOfWeek: 'mon',
    defaultDisplayedMonth: '2026-08-01',
  },
};

export const YearBoundary: Story = {
  args: {
    yearRange: [2026, 2026],
    defaultDisplayedMonth: '2026-01-01',
  },
};

function ControlledSingleExample() {
  const [value, setValue] = useState<DatePickerDate | null>('2026-08-26');
  return (
    <div>
      <DatePicker value={value} onChange={setValue} defaultDisplayedMonth="2026-08-01" />
      <output data-testid="single-value">{value ?? 'null'}</output>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledSingleExample /> };

function RangeExample() {
  const [value, setValue] = useState<DatePickerRangeValue | null>({
    start: '2026-08-28',
    end: '2026-09-03',
  });
  return (
    <div>
      <DateRangePicker
        value={value}
        onChange={setValue}
        defaultDisplayedMonth="2026-08-01"
      />
      <output data-testid="range-value">
        {value ? `${value.start}/${value.end}` : 'null'}
      </output>
    </div>
  );
}

export const Range: Story = { render: () => <RangeExample /> };

function RangeInputExample() {
  const [value, setValue] = useState<DatePickerRangeValue | null>({
    start: '2026-08-20',
    end: '2026-08-25',
  });
  return (
    <div>
      <DateRangePicker
        value={value}
        onChange={setValue}
        defaultDisplayMode="input"
      />
      <output data-testid="range-input-value">
        {value ? `${value.start}/${value.end}` : 'null'}
      </output>
    </div>
  );
}

export const RangeInput: Story = { render: () => <RangeInputExample /> };

export const Rtl: Story = {
  args: {
    dir: 'rtl',
    locale: 'ar-EG',
    defaultValue: '2026-08-26',
    defaultDisplayedMonth: '2026-08-01',
  },
};

export const InDialog: Story = {
  render: () => (
    <DialogTrigger>
      <Button data-testid="open-date-dialog">Choose date</Button>
      <DialogOverlay>
        <Dialog aria-label="Date picker example">
          <DialogTitle>Date picker composition</DialogTitle>
          <DatePicker defaultValue="2026-08-26" defaultDisplayedMonth="2026-08-01" />
          <DialogActions>
            <DialogCloseAction>Cancel</DialogCloseAction>
            <DialogAction>OK</DialogAction>
          </DialogActions>
        </Dialog>
      </DialogOverlay>
    </DialogTrigger>
  ),
};
