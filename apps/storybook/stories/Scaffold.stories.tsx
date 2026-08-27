import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomAppBar,
  FloatingActionButton,
  Scaffold,
  Snackbar,
  TopAppBar,
  type ScaffoldFabPosition,
} from '@m3/ui';

const meta = {
  title: 'Components/Scaffold',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const addIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
  </svg>
);

function Frame({ children, dir }: { children: ReactNode; dir?: 'ltr' | 'rtl' }) {
  return (
    <div
      dir={dir}
      style={{ width: '100%', height: 420, padding: 16, boxSizing: 'border-box' }}
    >
      {children}
    </div>
  );
}

const body = (
  <div data-testid="scaffold-body-content" style={{ padding: 24 }}>
    Main content
  </div>
);

const topBar = <TopAppBar data-testid="scaffold-top-bar" title="Inbox" />;
const bottomBar = (
  <BottomAppBar data-testid="scaffold-bottom-bar">
    <span style={{ paddingInline: 16 }}>Bottom actions</span>
  </BottomAppBar>
);
const fab = (
  <FloatingActionButton data-testid="scaffold-fab" aria-label="Create">
    {addIcon}
  </FloatingActionButton>
);
const snackbar = <Snackbar data-testid="scaffold-snackbar">Saved</Snackbar>;

function Example({
  top = false,
  bottom = false,
  snack = false,
  showFab = false,
  position = 'end',
  dir,
  style,
}: {
  top?: boolean;
  bottom?: boolean;
  snack?: boolean;
  showFab?: boolean;
  position?: ScaffoldFabPosition;
  dir?: 'ltr' | 'rtl';
  style?: CSSProperties;
}) {
  return (
    <Frame dir={dir}>
      <Scaffold
        data-testid="scaffold"
        topBar={top ? topBar : undefined}
        bottomBar={bottom ? bottomBar : undefined}
        snackbarHost={snack ? snackbar : undefined}
        floatingActionButton={showFab ? fab : undefined}
        floatingActionButtonPosition={position}
        style={{ height: '100%', ...style }}
      >
        {body}
      </Scaffold>
    </Frame>
  );
}

export const BodyOnly: Story = { render: () => <Example /> };
export const TopBarOnly: Story = { render: () => <Example top /> };
export const BottomBarOnly: Story = { render: () => <Example bottom /> };
export const FullComposition: Story = {
  render: () => <Example top bottom snack showFab />,
};
export const FabStart: Story = {
  render: () => <Example bottom showFab position="start" />,
};
export const FabCenter: Story = {
  render: () => <Example bottom showFab position="center" />,
};
export const FabEnd: Story = {
  render: () => <Example bottom showFab position="end" />,
};
export const FabEndOverlay: Story = {
  render: () => <Example bottom showFab position="end-overlay" />,
};
export const SnackbarFabBottomBar: Story = {
  render: () => <Example bottom snack showFab />,
};
export const Rtl: Story = {
  render: () => <Example bottom showFab position="start" dir="rtl" />,
};
export const SafeArea: Story = {
  render: () => (
    <Example
      snack
      showFab
      style={{
        '--scaffold-safe-top': '20px',
        '--scaffold-safe-right': '14px',
        '--scaffold-safe-bottom': '18px',
        '--scaffold-safe-left': '12px',
      } as CSSProperties}
    />
  ),
};
export const Resize: Story = {
  render: () => <Example top bottom snack showFab />,
};
