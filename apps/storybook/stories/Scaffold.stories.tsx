import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomAppBar,
  FloatingActionButton,
  Scaffold,
  Snackbar,
  TopAppBar,
  type ScaffoldFabPosition,
  type ScaffoldWindowInsets,
} from '@m3-ui/ui';

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
  contentWindowInsets,
}: {
  top?: boolean;
  bottom?: boolean;
  snack?: boolean;
  showFab?: boolean;
  position?: ScaffoldFabPosition;
  dir?: 'ltr' | 'rtl';
  style?: CSSProperties;
  contentWindowInsets?: ScaffoldWindowInsets;
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
        contentWindowInsets={contentWindowInsets}
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
      contentWindowInsets={{ top: 20, right: 14, bottom: 18, left: 12 }}
    />
  ),
};
export const Resize: Story = {
  render: () => <Example top bottom snack showFab />,
};

export const ConventionalPaddedContent: Story = {
  render: () => (
    <Frame>
      <Scaffold
        data-testid="scaffold"
        topBar={topBar}
        bottomBar={bottomBar}
        style={{ height: '100%' }}
      >
        {(innerPadding) => (
          <div
            data-testid="padded-content"
            style={{ ...innerPadding.style, height: '100%', overflow: 'auto', paddingInline: 24 }}
          >
            <div style={{ paddingBlock: 24 }}>Conventional content consumes inner padding.</div>
          </div>
        )}
      </Scaffold>
    </Frame>
  ),
};

export const ScrollBehindTopAppBar: Story = {
  render: () => (
    <Frame>
      <Scaffold data-testid="scaffold" topBar={topBar} style={{ height: '100%' }}>
        {(innerPadding) => (
          <div data-testid="edge-scroll" style={{ height: '100%', overflow: 'auto' }}>
            <div style={{ height: 180, background: 'var(--primary-container)' }} />
            <div style={{ ...innerPadding.style, paddingInline: 24 }}>
              Scroll content starts behind the top app bar, while interactive content consumes
              the calculated top padding.
            </div>
          </div>
        )}
      </Scaffold>
    </Frame>
  ),
};

export const ContentBehindBottomBar: Story = {
  render: () => (
    <Frame>
      <Scaffold data-testid="scaffold" bottomBar={bottomBar} style={{ height: '100%' }}>
        {(innerPadding) => (
          <div data-testid="bottom-edge-scroll" style={{ height: '100%', overflow: 'auto' }}>
            <div style={{ minHeight: 560, padding: 24, paddingBlockEnd: innerPadding.bottom }}>
              The scroll surface extends behind the bottom bar; only its interactive tail consumes
              the bottom inner padding.
            </div>
          </div>
        )}
      </Scaffold>
    </Frame>
  ),
};

export const FullBleedEdgeToEdge: Story = {
  render: () => (
    <Frame>
      <Scaffold
        data-testid="scaffold"
        topBar={topBar}
        bottomBar={bottomBar}
        contentWindowInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}
        style={{ height: '100%' }}
      >
        <div
          data-testid="full-bleed-content"
          style={{ width: '100%', height: '100%', background: 'var(--tertiary-container)' }}
        />
      </Scaffold>
    </Frame>
  ),
};

export const NestedConsumedInsets: Story = {
  render: () => (
    <Frame>
      <Scaffold
        data-testid="outer-scaffold"
        contentWindowInsets={{ top: 20, right: 14, bottom: 18, left: 12 }}
        style={{ height: '100%' }}
      >
        {(outerPadding) => (
          <div style={{ ...outerPadding.style, height: '100%' }}>
            <Scaffold
              data-testid="nested-scaffold"
              contentWindowInsets={{ top: 20, right: 14, bottom: 18, left: 12 }}
              consumedWindowInsets={{ top: 20, right: 14, bottom: 18, left: 12 }}
              style={{ height: '100%' }}
            >
              {(innerPadding) => (
                <div data-testid="nested-content" style={innerPadding.style}>
                  Nested scaffold does not consume the same safe-area inset twice.
                </div>
              )}
            </Scaffold>
          </div>
        )}
      </Scaffold>
    </Frame>
  ),
};
