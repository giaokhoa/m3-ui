import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  PlainTooltip,
  RichTooltip,
  RichTooltipTrigger,
  TextButton,
  ThemeProvider,
  TooltipTrigger,
  type PlainTooltipProps,
  type RichTooltipProps,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/Tooltip',
  component: PlainTooltip,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlainTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

function TooltipDemo({
  tooltip = 'Helpful context',
  triggerLabel = 'More info',
  testId = 'plain-tooltip',
  triggerTestId = 'tooltip-trigger',
  ...props
}: PlainTooltipProps & {
  tooltip?: string;
  triggerLabel?: string;
  testId?: string;
  triggerTestId?: string;
}) {
  return (
    <TooltipTrigger delay={0} closeDelay={0}>
      <Button data-testid={triggerTestId}>{triggerLabel}</Button>
      <PlainTooltip {...props} data-testid={testId}>
        {tooltip}
      </PlainTooltip>
    </TooltipTrigger>
  );
}

function RichTooltipDemo({
  title = 'Rich tooltip title',
  tooltip = 'Rich tooltips provide more supporting detail and can include an action.',
  triggerLabel = 'Rich info',
  testId = 'rich-tooltip',
  triggerTestId = 'rich-tooltip-trigger',
  withAction = true,
  ...props
}: Omit<RichTooltipProps, 'action' | 'children' | 'title'> & {
  title?: string;
  tooltip?: string;
  triggerLabel?: string;
  testId?: string;
  triggerTestId?: string;
  withAction?: boolean;
}) {
  return (
    <RichTooltipTrigger>
      <Button data-testid={triggerTestId}>{triggerLabel}</Button>
      <RichTooltip
        {...props}
        data-testid={testId}
        title={title}
        action={withAction ? (close) => (
          <TextButton data-testid="rich-tooltip-action" onPress={close}>
            Learn more
          </TextButton>
        ) : undefined}
      >
        {tooltip}
      </RichTooltip>
    </RichTooltipTrigger>
  );
}

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <TooltipDemo tooltip="Info" />
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="storybook-center">
      <TooltipDemo
        placement="bottom"
        testId="long-tooltip"
        triggerLabel="Long tooltip"
        triggerTestId="long-tooltip-trigger"
        tooltip="Plain tooltips wrap descriptive text at the Compose maximum width instead of growing indefinitely."
      />
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div
      className="storybook-center"
      style={{ alignItems: 'center', display: 'grid', gap: 40, gridTemplateColumns: 'repeat(2, auto)' }}
    >
      <TooltipDemo placement="top" tooltip="Top" triggerLabel="Top" />
      <TooltipDemo placement="bottom" tooltip="Bottom" triggerLabel="Bottom" />
      <TooltipDemo placement="start" tooltip="Start" triggerLabel="Start" />
      <TooltipDemo placement="end" tooltip="End" triggerLabel="End" />
    </div>
  ),
};

export const CaretPlacements: Story = {
  render: () => (
    <div
      className="storybook-center"
      style={{ alignItems: 'center', display: 'grid', gap: 56, gridTemplateColumns: 'repeat(2, auto)' }}
    >
      <TooltipDemo caret placement="top" testId="caret-top" triggerLabel="Caret top" triggerTestId="caret-top-trigger" tooltip="Top" />
      <TooltipDemo caret placement="bottom" testId="caret-bottom" triggerLabel="Caret bottom" triggerTestId="caret-bottom-trigger" tooltip="Bottom" />
      <TooltipDemo caret placement="start" testId="caret-start" triggerLabel="Caret start" triggerTestId="caret-start-trigger" tooltip="Start" />
      <TooltipDemo caret placement="end" testId="caret-end" triggerLabel="Caret end" triggerTestId="caret-end-trigger" tooltip="End" />
    </div>
  ),
};

export const CaretRTL: Story = {
  render: () => (
    <div
      dir="rtl"
      className="storybook-center"
      style={{ alignItems: 'center', display: 'flex', gap: 64 }}
    >
      <TooltipDemo caret dir="rtl" shouldFlip={false} placement="start" testId="caret-rtl-start" triggerLabel="RTL start" triggerTestId="caret-rtl-start-trigger" tooltip="Start" />
      <TooltipDemo caret dir="rtl" shouldFlip={false} placement="end" testId="caret-rtl-end" triggerLabel="RTL end" triggerTestId="caret-rtl-end-trigger" tooltip="End" />
    </div>
  ),
};

export const CaretFlips: Story = {
  render: () => (
    <div style={{ position: 'fixed', inset: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)' }}>
        <TooltipDemo caret placement="top" testId="flip-top" triggerLabel="Flip top" triggerTestId="flip-top-trigger" tooltip="Top flips" />
      </div>
      <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)' }}>
        <TooltipDemo caret placement="bottom" testId="flip-bottom" triggerLabel="Flip bottom" triggerTestId="flip-bottom-trigger" tooltip="Bottom flips" />
      </div>
      <div style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)' }}>
        <TooltipDemo caret placement="start" testId="flip-start" triggerLabel="Flip start" triggerTestId="flip-start-trigger" tooltip="Start flips" />
      </div>
      <div style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }}>
        <TooltipDemo caret placement="end" testId="flip-end" triggerLabel="Flip end" triggerTestId="flip-end-trigger" tooltip="End flips" />
      </div>
    </div>
  ),
};

export const Rich: Story = {
  render: () => (
    <div className="storybook-center">
      <RichTooltipDemo />
    </div>
  ),
};

export const RichCaret: Story = {
  render: () => (
    <div className="storybook-center">
      <RichTooltipDemo caret testId="rich-caret" triggerLabel="Rich caret" triggerTestId="rich-caret-trigger" />
    </div>
  ),
};

export const RichTextOnly: Story = {
  render: () => (
    <div className="storybook-center">
      <RichTooltipTrigger isPersistent={false}>
        <Button data-testid="rich-text-only-trigger">Text only</Button>
        <RichTooltip data-testid="rich-text-only-tooltip">
          Supporting text only
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  ),
};

function ThemeTooltip({ label }: { label: string }) {
  const slug = label.toLowerCase().replaceAll(' ', '-');
  return (
    <TooltipDemo
      caret
      testId={`plain-tooltip-${slug}`}
      tooltip={`${label} tooltip`}
      triggerLabel={label}
      triggerTestId={`plain-trigger-${slug}`}
    />
  );
}

function ThemeRichTooltip({ label }: { label: string }) {
  return (
    <RichTooltipDemo
      caret
      testId={`rich-tooltip-${label.toLowerCase().replaceAll(' ', '-')}`}
      triggerLabel={label}
      triggerTestId={`rich-trigger-${label.toLowerCase().replaceAll(' ', '-')}`}
    />
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeTooltip label="Light" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeTooltip label="Dark" />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeTooltip label="Dynamic" />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeTooltip label="Dynamic dark" />
      </ThemeProvider>
    </div>
  ),
};

export const RichThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeRichTooltip label="Light" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeRichTooltip label="Dark" />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeRichTooltip label="Dynamic" />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeRichTooltip label="Dynamic dark" />
      </ThemeProvider>
    </div>
  ),
};
