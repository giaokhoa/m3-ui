import { useState } from 'react';
import {
  DatePicker,
  DateRangePicker,
  TimeInput,
  TimePicker,
  getMaterialTypeCssProperties,
  type DatePickerDate,
  type DatePickerRangeValue,
  type TimeOfDay,
} from '@m3-ui/ui';
import './picker-demos.css';

export function DatePickerPreview() {
  const [date, setDate] = useState<DatePickerDate | null>('2026-08-29');
  const [range, setRange] = useState<DatePickerRangeValue | null>({
    start: '2026-08-29',
    end: '2026-09-03',
  });

  return (
    <div className="docs-picker-demo">
      <section className="docs-picker-demo__section">
        <div
          className="docs-picker-demo__label"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Single date
        </div>
        <div className="docs-picker-demo__scroll">
          <DatePicker
            value={date}
            onChange={setDate}
            defaultDisplayedMonth="2026-08-01"
            locale="vi-VN"
            firstDayOfWeek="mon"
          />
        </div>
        <output
          className="docs-picker-demo__output"
          style={getMaterialTypeCssProperties('bodyMedium')}
        >
          {date ?? 'No date selected'}
        </output>
      </section>

      <section className="docs-picker-demo__section">
        <div
          className="docs-picker-demo__label"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Date range
        </div>
        <div className="docs-picker-demo__scroll">
          <DateRangePicker
            value={range}
            onChange={setRange}
            defaultDisplayedMonth="2026-08-01"
          />
        </div>
        <output
          className="docs-picker-demo__output"
          style={getMaterialTypeCssProperties('bodyMedium')}
        >
          {range ? `${range.start} → ${range.end}` : 'No range selected'}
        </output>
      </section>
    </div>
  );
}

export function TimePickerPreview() {
  const [time, setTime] = useState<TimeOfDay>({ hour: 10, minute: 30 });

  return (
    <div className="docs-picker-demo">
      <section className="docs-picker-demo__section">
        <div
          className="docs-picker-demo__label"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Dial
        </div>
        <div className="docs-picker-demo__scroll">
          <TimePicker
            aria-label="Choose time"
            layout="vertical"
            value={time}
            onChange={setTime}
          />
        </div>
      </section>

      <section className="docs-picker-demo__section">
        <div
          className="docs-picker-demo__label"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Keyboard input
        </div>
        <div className="docs-picker-demo__scroll">
          <TimeInput value={time} onChange={setTime} />
        </div>
      </section>

      <output
        className="docs-picker-demo__output"
        style={getMaterialTypeCssProperties('bodyMedium')}
      >
        {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
      </output>
    </div>
  );
}
