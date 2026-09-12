import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker, ThemeProvider, TimePicker, TimeScroll } from '@m3-ui/ui';

const meta = {
  title: 'Conformance/Pickers',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DynamicTheme: Story = {
  render: () => (
    <ThemeProvider
      className="picker-conformance-dynamic-theme"
      mode="light"
      sourceColor="#006a60"
    >
      <div
        style={{
          alignItems: 'start',
          background: 'var(--surface)',
          color: 'var(--on-surface)',
          display: 'grid',
          gap: 32,
          gridTemplateColumns: 'max-content max-content',
          minHeight: '100vh',
          padding: 32,
        }}
      >
        <DatePicker
          data-testid="theme-date-picker"
          defaultDisplayedMonth="2026-08-01"
          defaultValue="2026-08-26"
          locale="en-US"
        />
        <TimePicker
          aria-label="Dynamic time picker"
          data-testid="theme-time-picker"
          defaultValue={{ hour: 10, minute: 30 }}
          layout="vertical"
        />
        <TimeScroll
          data-testid="theme-time-scroll"
          defaultValue={{ hour: 10, minute: 30 }}
        />
      </div>
    </ThemeProvider>
  ),
};
