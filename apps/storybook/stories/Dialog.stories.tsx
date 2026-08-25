import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  Dialog,
  DialogAction,
  DialogActions,
  DialogCloseAction,
  DialogDescription,
  DialogIcon,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  ThemeProvider,
} from '@m3/ui';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function DialogContents({ icon }: { icon?: ReactNode }) {
  return (
    <>
      {icon ? <DialogIcon>{icon}</DialogIcon> : null}
      <DialogTitle>Discard draft?</DialogTitle>
      <DialogDescription>
        Your unsaved changes will be lost. This action cannot be undone.
      </DialogDescription>
      <DialogActions>
        <DialogCloseAction>Cancel</DialogCloseAction>
        <DialogAction onPress={() => undefined}>Discard</DialogAction>
      </DialogActions>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open dialog</Button>
      <DialogOverlay>
        <Dialog data-testid="dialog-default">
          <DialogContents />
        </Dialog>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Open icon dialog</Button>
      <DialogOverlay>
        <Dialog data-testid="dialog-icon">
          <DialogContents
            icon={
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2 1 21h22L12 2Zm1 15h-2v2h2v-2Zm0-6h-2v4h2v-4Z"
                />
              </svg>
            }
          />
        </Dialog>
      </DialogOverlay>
    </DialogTrigger>
  ),
};

export const Geometry: Story = {
  render: () => (
    <DialogOverlay defaultOpen isDismissable={false}>
      <Dialog data-testid="dialog-geometry">
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Body</DialogDescription>
      </Dialog>
    </DialogOverlay>
  ),
};

export const MaximumWidth: Story = {
  render: () => (
    <DialogOverlay defaultOpen isDismissable={false}>
      <Dialog data-testid="dialog-maximum-width">
        <DialogTitle>Review the generated configuration before continuing</DialogTitle>
        <DialogDescription>
          This intentionally long supporting paragraph gives the intrinsic dialog
          content enough width to exercise the AndroidX maximum-width constraint
          while remaining normal wrappable text inside the Material surface.
        </DialogDescription>
      </Dialog>
    </DialogOverlay>
  ),
};

function InlineThemeDialog() {
  return (
    <Dialog aria-label="Theme preview" style={{ maxWidth: 360 }}>
      <DialogTitle>Theme preview</DialogTitle>
      <DialogDescription>
        Surface, headline, supporting text and actions inherit runtime theme roles.
      </DialogDescription>
      <DialogActions>
        <DialogAction>Action</DialogAction>
      </DialogActions>
    </Dialog>
  );
}

export const ThemeMatrix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <InlineThemeDialog />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <InlineThemeDialog />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <InlineThemeDialog />
      </ThemeProvider>
      <ThemeProvider
        className="storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <InlineThemeDialog />
      </ThemeProvider>
    </div>
  ),
};
