import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FloatingActionButton,
  NavigationSuiteScaffold,
  NavigationSuiteType,
  calculateWindowAdaptiveInfo,
  defaultWindowPosture,
} from '@m3-ui/ui';

const items = [
  { selected: true, icon: <span aria-hidden="true">⌂</span>, label: 'Home' },
  { selected: false, icon: <span aria-hidden="true">⌕</span>, label: 'Search' },
  { selected: false, icon: <span aria-hidden="true">☆</span>, label: 'Saved' },
  { selected: false, icon: <span aria-hidden="true">●</span>, label: 'Profile' },
];

function adaptiveInfo(width: number, height: number, isTabletop = false) {
  return calculateWindowAdaptiveInfo(
    { width, height },
    isTabletop
      ? { isTabletop: true, foldingFeatures: [] }
      : defaultWindowPosture,
  );
}

function PrimaryAction() {
  return (
    <FloatingActionButton aria-label="Create">
      <span aria-hidden="true">＋</span>
    </FloatingActionButton>
  );
}

function Demo({
  width,
  height,
  type,
  tabletop = false,
  dir,
}: {
  width: number;
  height: number;
  type?: NavigationSuiteType;
  tabletop?: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div style={{ height: '100vh', minHeight: 520 }}>
      <NavigationSuiteScaffold
        dir={dir}
        items={items}
        adaptiveInfo={adaptiveInfo(width, height, tabletop)}
        navigationSuiteType={type}
        primaryAction={<PrimaryAction />}
      >
        <div
          style={{
            boxSizing: 'border-box',
            minHeight: '100%',
            padding: 32,
            background: 'var(--surface)',
            color: 'var(--on-surface)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Adaptive destination</h2>
          <p style={{ maxWidth: 560 }}>
            Navigation changes form while this content remains independent from pane
            allocation and router/history behavior.
          </p>
        </div>
      </NavigationSuiteScaffold>
    </div>
  );
}

const meta = {
  title: 'Layout/NavigationSuiteScaffold',
  component: NavigationSuiteScaffold,
  args: { items },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NavigationSuiteScaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompactRecommended: Story = {
  render: () => <Demo width={599} height={900} />,
};

export const CompactHeightRecommended: Story = {
  render: () => <Demo width={700} height={479} />,
};

export const TabletopRecommended: Story = {
  render: () => <Demo width={900} height={900} tabletop />,
};

export const WideRecommended: Story = {
  render: () => <Demo width={1200} height={900} />,
};

export const WideExpandedOverride: Story = {
  render: () => (
    <Demo
      width={1200}
      height={900}
      type={NavigationSuiteType.WideNavigationRailExpanded}
    />
  ),
};

export const LegacyNavigationBarOverride: Story = {
  render: () => (
    <Demo width={1200} height={900} type={NavigationSuiteType.NavigationBar} />
  ),
};

export const LegacyNavigationRailOverride: Story = {
  render: () => (
    <Demo width={400} height={900} type={NavigationSuiteType.NavigationRail} />
  ),
};

export const DrawerOverride: Story = {
  render: () => (
    <Demo width={400} height={900} type={NavigationSuiteType.NavigationDrawer} />
  ),
};

export const RtlWideRecommended: Story = {
  render: () => <Demo width={1200} height={900} dir="rtl" />,
};
