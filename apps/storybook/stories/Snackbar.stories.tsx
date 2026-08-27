import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Snackbar,
  SnackbarAction,
  SnackbarDismissAction,
  ThemeProvider,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/Snackbar',
  component: Snackbar,
  args: {
    children: 'Snackbar message',
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.4 18.65 5.35 17.6 10.95 12 5.35 6.4 6.4 5.35 12 10.95 17.6 5.35 18.65 6.4 13.05 12 18.65 17.6 17.6 18.65 12 13.05Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Frame({ children, width = 420 }: { children: ReactNode; width?: number }) {
  return (
    <div className="storybook-center">
      <div style={{ width: `min(${width}px, calc(100vw - 32px))` }}>{children}</div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Frame>
      <Snackbar data-testid="snackbar-default">Message sent</Snackbar>
    </Frame>
  ),
};

export const TwoLine: Story = {
  render: () => (
    <Frame>
      <Snackbar data-testid="snackbar-two-line">
        First line of supporting text
        <br />
        Second line of supporting text
      </Snackbar>
    </Frame>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Frame>
      <Snackbar
        data-testid="snackbar-action-surface"
        action={
          <SnackbarAction data-testid="snackbar-action" onPress={() => {}}>
            Undo
          </SnackbarAction>
        }
      >
        Item archived
      </Snackbar>
    </Frame>
  ),
};

export const ActionOnNewLine: Story = {
  render: () => (
    <Frame width={360}>
      <Snackbar
        data-testid="snackbar-new-line"
        actionOnNewLine
        action={
          <SnackbarAction data-testid="snackbar-new-line-action" onPress={() => {}}>
            Retry connection
          </SnackbarAction>
        }
      >
        Connection could not be completed. Check your network and try again.
      </Snackbar>
    </Frame>
  ),
};

export const WithDismiss: Story = {
  render: () => (
    <Frame>
      <Snackbar
        data-testid="snackbar-dismiss-surface"
        action={
          <SnackbarAction data-testid="snackbar-dismiss-action" onPress={() => {}}>
            Undo
          </SnackbarAction>
        }
        dismissAction={
          <SnackbarDismissAction
            aria-label="Dismiss"
            data-testid="snackbar-dismiss"
            onPress={() => {}}
          >
            <CloseIcon />
          </SnackbarDismissAction>
        }
      >
        Item removed
      </Snackbar>
    </Frame>
  ),
};

export const MaximumWidth: Story = {
  render: () => (
    <Frame width={760}>
      <Snackbar data-testid="snackbar-max-width">
        Snackbar surfaces fill available width up to the Compose maximum.
      </Snackbar>
    </Frame>
  ),
};

function ThemeSnackbar({ label }: { label: string }) {
  return (
    <Snackbar
      action={<SnackbarAction onPress={() => {}}>Undo</SnackbarAction>}
    >
      {label} snackbar
    </Snackbar>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeSnackbar label="Light" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeSnackbar label="Dark" />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <ThemeSnackbar label="Dynamic" />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeSnackbar label="Dynamic dark" />
      </ThemeProvider>
    </div>
  ),
};
