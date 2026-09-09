import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DatePicker,
  DateRangePicker,
  ThemeProvider,
  TimeInput,
  TimePicker,
} from './index';

function renderLane7(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('Lane 7 picker SSR contracts', () => {
  it('renders DatePicker deterministically from explicit calendar-date and locale inputs', () => {
    const tree = (
      <DatePicker
        defaultDisplayedMonth="2026-08-01"
        defaultValue="2026-08-26"
        locale="en-US"
      />
    );

    const first = renderLane7(tree);
    const second = renderLane7(tree);

    expect(second).toBe(first);
    expect(first).toContain('data-variant="modal"');
    expect(first).toContain('data-display-mode="calendar"');
    expect(first).toContain('data-testid="date-picker"');
    expect(first).toContain('Aug');
    expect(first).toContain('26');
    expect(first).not.toContain('NaN');
  });

  it('renders DateRangePicker deterministically without converting its ISO range through a timezone', () => {
    const tree = (
      <DateRangePicker
        defaultDisplayedMonth="2026-08-01"
        defaultValue={{ start: '2026-08-28', end: '2026-09-03' }}
        locale="en-US"
      />
    );

    const first = renderLane7(tree);
    const second = renderLane7(tree);

    expect(second).toBe(first);
    expect(first).toContain('date-picker--range');
    expect(first).toContain('data-testid="date-range-picker"');
    expect(first).toContain('data-display-mode="calendar"');
    expect(first).not.toContain('NaN');
  });

  it('renders fixed-layout TimePicker and TimeInput deterministically from time-of-day values', () => {
    const tree = (
      <>
        <TimePicker
          aria-label="Server time picker"
          defaultValue={{ hour: 10, minute: 30 }}
          layout="vertical"
        />
        <TimeInput defaultValue={{ hour: 10, minute: 30 }} />
      </>
    );

    const first = renderLane7(tree);
    const second = renderLane7(tree);

    expect(second).toBe(first);
    expect(first).toContain('data-layout="vertical"');
    expect(first).toContain('data-layout-requested="vertical"');
    expect(first).toContain('aria-label="Hour dial"');
    expect(first).toContain('aria-label="Hour"');
    expect(first).toContain('aria-label="Minute"');
    expect(first).toContain('10');
    expect(first).toContain('30');
    expect(first).not.toContain('NaN');
  });

  it('uses a deterministic vertical first render for auto TimePicker before browser measurement', () => {
    const tree = (
      <TimePicker
        aria-label="Server auto time picker"
        defaultValue={{ hour: 9, minute: 15 }}
        layout="auto"
      />
    );

    const first = renderLane7(tree);
    const second = renderLane7(tree);

    expect(second).toBe(first);
    expect(first).toContain('data-layout="vertical"');
    expect(first).toContain('data-layout-requested="auto"');
  });
});
