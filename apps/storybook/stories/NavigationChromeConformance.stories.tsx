import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AppBarColumn,
  AppBarRow,
  BottomAppBar,
  DrawerValue,
  HorizontalFloatingToolbar,
  IconButton,
  ModalDrawerSheet,
  ModalNavigationDrawer,
  ModalWideNavigationRail,
  NavigationBar,
  NavigationBarItem,
  NavigationDrawerItem,
  NavigationRail,
  NavigationRailItem,
  ShortNavigationBar,
  ShortNavigationBarItem,
  Tabs,
  ThemeProvider,
  TopAppBar,
  WideNavigationRail,
  WideNavigationRailItem,
  WideNavigationRailValue,
  type AppBarAction,
  useDrawerState,
  useWideNavigationRailState,
} from '@m3-ui/ui';

const meta = {
  title: 'Conformance/NavigationChrome',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: 'grid', inlineSize: 24, blockSize: 24, placeItems: 'center' }}
    >
      {children}
    </span>
  );
}

const homeIcon = <Icon>⌂</Icon>;
const searchIcon = <Icon>⌕</Icon>;
const moreIcon = <Icon>⋮</Icon>;
const editIcon = <Icon>✎</Icon>;

const tabItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
] as const;

function StaticChrome() {
  const wideState = useWideNavigationRailState(WideNavigationRailValue.Expanded);
  return (
    <div
      style={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)',
      }}
    >
      <div style={{ display: 'grid', gap: 16 }}>
        <NavigationBar data-testid="theme-navigation-bar" aria-label="Theme navigation bar">
          <NavigationBarItem selected icon={homeIcon} label="Home" />
          <NavigationBarItem selected={false} icon={searchIcon} label="Search" />
        </NavigationBar>

        <ShortNavigationBar
          data-testid="theme-short-navigation-bar"
          aria-label="Theme short navigation bar"
        >
          <ShortNavigationBarItem isSelected icon={homeIcon} label="Home" />
          <ShortNavigationBarItem isSelected={false} icon={searchIcon} label="Search" />
        </ShortNavigationBar>

        <Tabs
          data-testid="theme-tabs"
          aria-label="Theme tabs"
          items={tabItems}
          defaultSelectedKey="overview"
        />

        <TopAppBar
          data-testid="theme-top-app-bar"
          title="Dynamic navigation"
          navigationIcon={<IconButton aria-label="Open navigation">{homeIcon}</IconButton>}
          actions={<IconButton aria-label="Search">{searchIcon}</IconButton>}
        />

        <BottomAppBar
          data-testid="theme-bottom-app-bar"
          actions={
            <>
              <IconButton aria-label="Search">{searchIcon}</IconButton>
              <IconButton aria-label="Edit">{editIcon}</IconButton>
            </>
          }
        />

        <HorizontalFloatingToolbar
          aria-label="Theme toolbar"
          data-testid="theme-floating-toolbar"
          expanded
          leadingContent={<IconButton aria-label="Home">{homeIcon}</IconButton>}
          trailingContent={<IconButton aria-label="More">{moreIcon}</IconButton>}
        >
          <IconButton aria-label="Search">{searchIcon}</IconButton>
        </HorizontalFloatingToolbar>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 16, minHeight: 380 }}>
        <NavigationRail data-testid="theme-navigation-rail" aria-label="Theme navigation rail">
          <NavigationRailItem selected icon={homeIcon} label="Home" />
          <NavigationRailItem selected={false} icon={searchIcon} label="Search" />
        </NavigationRail>
        <WideNavigationRail
          data-testid="theme-wide-navigation-rail"
          aria-label="Theme wide navigation rail"
          state={wideState}
        >
          <WideNavigationRailItem selected icon={homeIcon} label="Home" />
          <WideNavigationRailItem selected={false} icon={searchIcon} label="Search" />
        </WideNavigationRail>
      </div>
    </div>
  );
}

function PortalChrome() {
  const drawerState = useDrawerState({ initialValue: DrawerValue.Closed });
  const modalRailState = useWideNavigationRailState(WideNavigationRailValue.Collapsed);
  const actions: AppBarAction[] = [
    { type: 'action', id: 'share', label: 'Share', icon: <Icon>↗</Icon>, onPress: () => {} },
    { type: 'action', id: 'edit', label: 'Edit', icon: editIcon, onPress: () => {} },
    { type: 'action', id: 'archive', label: 'Archive', icon: <Icon>□</Icon>, onPress: () => {} },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <button data-testid="theme-modal-drawer-open" type="button" onClick={() => drawerState.open()}>
        Open drawer
      </button>
      <ModalNavigationDrawer
        data-testid="theme-modal-drawer"
        state={drawerState}
        drawerContent={
          <ModalDrawerSheet data-testid="theme-modal-drawer-sheet">
            <NavigationDrawerItem selected icon={homeIcon}>Home</NavigationDrawerItem>
            <NavigationDrawerItem selected={false} icon={searchIcon}>Search</NavigationDrawerItem>
          </ModalDrawerSheet>
        }
      >
        <div data-testid="theme-modal-drawer-content">Drawer host content</div>
      </ModalNavigationDrawer>

      <div style={{ minHeight: 220 }}>
        <ModalWideNavigationRail
          data-testid="theme-modal-wide-rail-host"
          aria-label="Theme modal wide rail"
          hideOnCollapse
          state={modalRailState}
          header={
            <button
              aria-label="Close modal rail"
              type="button"
              onClick={() => modalRailState.collapse()}
            >
              ×
            </button>
          }
        >
          <WideNavigationRailItem selected icon={homeIcon} label="Home" />
          <WideNavigationRailItem selected={false} icon={searchIcon} label="Search" />
        </ModalWideNavigationRail>
        <button
          data-testid="theme-modal-wide-rail-open"
          type="button"
          onClick={() => modalRailState.expand()}
        >
          Open modal rail
        </button>
      </div>

      <div style={{ inlineSize: 144 }}>
        <AppBarRow
          aria-label="Theme row actions"
          data-testid="theme-app-bar-row"
          items={actions}
          maxItemCount={2}
          overflowLabel="Row more actions"
        />
      </div>
      <div style={{ blockSize: 96, inlineSize: 160 }}>
        <AppBarColumn
          aria-label="Theme column actions"
          data-testid="theme-app-bar-column"
          items={actions}
          maxItemCount={2}
          overflowLabel="Column more actions"
        />
      </div>
    </div>
  );
}

function DynamicThemeDemo() {
  return (
    <ThemeProvider
      className="navigation-chrome-dynamic-theme"
      mode="light"
      sourceColor="#006a60"
    >
      <div
        style={{
          boxSizing: 'border-box',
          background: 'var(--surface)',
          color: 'var(--on-surface)',
          display: 'grid',
          gap: 32,
          minHeight: '100vh',
          padding: 32,
        }}
      >
        <StaticChrome />
        <PortalChrome />
      </div>
    </ThemeProvider>
  );
}

export const DynamicTheme: Story = {
  render: () => <DynamicThemeDemo />,
};
