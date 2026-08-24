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
} from '@m3/ui';

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

export const Rich: Story = {
  render: () => (
    <div className="storybook-center">
      <RichTooltipDemo />
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
  return <TooltipDemo tooltip={`${label} tooltip`} triggerLabel={label} />;
}

function ThemeRichTooltip({ label }: { label: string }) {
  return (
    <RichTooltipDemo
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
