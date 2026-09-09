import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ContainedLoadingIndicator,
  LinearProgressIndicator,
  PlainTooltip,
  RichTooltip,
  RichTooltipTrigger,
  Snackbar,
  SnackbarAction,
  TextButton,
  ThemeProvider,
  TooltipTrigger,
} from '@m3-ui/ui';

const meta = {
  title: 'Conformance/FeedbackStatus',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function DynamicThemeDemo() {
  return (
    <ThemeProvider
      className="feedback-status-dynamic-theme"
      mode="light"
      sourceColor="#006a60"
    >
      <div
        style={{
          boxSizing: 'border-box',
          display: 'grid',
          gap: 28,
          minHeight: '100vh',
          padding: 32,
          alignContent: 'start',
          background: 'var(--surface)',
          color: 'var(--on-surface)',
        }}
      >
        <LinearProgressIndicator
          aria-label="Dynamic progress"
          data-testid="theme-progress"
          value={0.5}
        />

        <ContainedLoadingIndicator
          aria-label="Dynamic loading"
          data-testid="theme-loading"
          value={0.5}
        />

        <div style={{ width: 420, maxWidth: '100%' }}>
          <Snackbar
            data-testid="theme-snackbar"
            action={
              <SnackbarAction data-testid="theme-snackbar-action" onPress={() => {}}>
                Undo
              </SnackbarAction>
            }
          >
            Dynamic snackbar
          </Snackbar>
        </div>

        <TooltipTrigger delay={0} closeDelay={0}>
          <Button data-testid="theme-plain-tooltip-trigger">Plain help</Button>
          <PlainTooltip data-testid="theme-plain-tooltip">
            Dynamic plain tooltip
          </PlainTooltip>
        </TooltipTrigger>

        <RichTooltipTrigger>
          <Button data-testid="theme-rich-tooltip-trigger">Rich help</Button>
          <RichTooltip
            data-testid="theme-rich-tooltip"
            title="Dynamic rich tooltip"
            action={(close) => (
              <TextButton data-testid="theme-rich-tooltip-action" onPress={close}>
                Dismiss
              </TextButton>
            )}
          >
            Nested theme portal content
          </RichTooltip>
        </RichTooltipTrigger>
      </div>
    </ThemeProvider>
  );
}

export const DynamicTheme: Story = {
  render: () => <DynamicThemeDemo />,
};

export const RtlProgress: Story = {
  render: () => (
    <div dir="rtl" style={{ padding: 32 }}>
      <LinearProgressIndicator
        aria-label="RTL progress"
        data-testid="rtl-progress"
        value={0.5}
      />
    </div>
  ),
};
