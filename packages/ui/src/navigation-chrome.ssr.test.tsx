import type { ReactElement, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  AppBarColumn,
  AppBarRow,
  BottomAppBar,
  DrawerState,
  DrawerValue,
  FlexibleBottomAppBar,
  HorizontalFloatingToolbar,
  ModalDrawerSheet,
  ModalNavigationDrawer,
  NavigationBar,
  NavigationBarItem,
  NavigationDrawerItem,
  NavigationRail,
  NavigationRailItem,
  PermanentDrawerSheet,
  PermanentNavigationDrawer,
  ShortNavigationBar,
  ShortNavigationBarItem,
  Tabs,
  ThemeProvider,
  TopAppBar,
  WideNavigationRail,
  WideNavigationRailItem,
  WideNavigationRailState,
  WideNavigationRailValue,
  type AppBarAction,
} from './index';

function renderLane8(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

function Icon({ children }: { children: ReactNode }) {
  return <span aria-hidden="true">{children}</span>;
}

const homeIcon = <Icon>H</Icon>;
const searchIcon = <Icon>S</Icon>;

const appBarActions: AppBarAction[] = [
  { type: 'action', id: 'one', label: 'One', icon: <Icon>1</Icon>, onPress: () => {} },
  { type: 'action', id: 'two', label: 'Two', icon: <Icon>2</Icon>, onPress: () => {} },
  { type: 'action', id: 'three', label: 'Three', icon: <Icon>3</Icon>, onPress: () => {} },
];

describe('Lane 8 navigation and application chrome SSR contracts', () => {
  it('renders navigation bars and rails deterministically from explicit selection/state', () => {
    const wideState = new WideNavigationRailState({
      initialValue: WideNavigationRailValue.Expanded,
    });
    const tree = (
      <>
        <NavigationBar aria-label="Server navigation bar">
          <NavigationBarItem selected icon={homeIcon} label="Home" />
          <NavigationBarItem selected={false} icon={searchIcon} label="Search" />
        </NavigationBar>
        <ShortNavigationBar aria-label="Server short navigation bar">
          <ShortNavigationBarItem isSelected icon={homeIcon} label="Home" />
          <ShortNavigationBarItem isSelected={false} icon={searchIcon} label="Search" />
        </ShortNavigationBar>
        <NavigationRail aria-label="Server navigation rail">
          <NavigationRailItem selected icon={homeIcon} label="Home" />
          <NavigationRailItem selected={false} icon={searchIcon} label="Search" />
        </NavigationRail>
        <WideNavigationRail aria-label="Server wide navigation rail" state={wideState}>
          <WideNavigationRailItem selected icon={homeIcon} label="Home" />
          <WideNavigationRailItem selected={false} icon={searchIcon} label="Search" />
        </WideNavigationRail>
      </>
    );

    const first = renderLane8(tree);
    const second = renderLane8(tree);
    expect(second).toBe(first);
    expect(first).toContain('navigation-bar');
    expect(first).toContain('short-navigation-bar');
    expect(first).toContain('navigation-rail');
    expect(first).toContain('wide-navigation-rail');
    expect(first).toContain('data-state="expanded"');
    expect(first).not.toContain('NaN');
  });

  it('keeps permanent drawer server-safe and closed modal drawer out of the portal tree', () => {
    const closed = new DrawerState({ initialValue: DrawerValue.Closed });
    const items = (
      <>
        <NavigationDrawerItem selected icon={homeIcon}>Home</NavigationDrawerItem>
        <NavigationDrawerItem selected={false} icon={searchIcon}>Search</NavigationDrawerItem>
      </>
    );
    const tree = (
      <>
        <PermanentNavigationDrawer drawerContent={<PermanentDrawerSheet>{items}</PermanentDrawerSheet>}>
          <main>Permanent content</main>
        </PermanentNavigationDrawer>
        <ModalNavigationDrawer
          state={closed}
          drawerContent={<ModalDrawerSheet>{items}</ModalDrawerSheet>}
        >
          <main>Closed modal content</main>
        </ModalNavigationDrawer>
      </>
    );

    const first = renderLane8(tree);
    const second = renderLane8(tree);
    expect(second).toBe(first);
    expect(first).toContain('Permanent content');
    expect(first).toContain('Closed modal content');
    expect(first).not.toContain('modal-navigation-drawer-overlay');
    expect(first).not.toContain('NaN');
  });

  it('renders tabs and app bars deterministically before browser-local measurement', () => {
    const tree = (
      <>
        <Tabs
          aria-label="Server tabs"
          items={[
            { id: 'overview', label: 'Overview' },
            { id: 'activity', label: 'Activity' },
          ]}
          defaultSelectedKey="overview"
        />
        <TopAppBar
          data-testid="server-centered-top-app-bar"
          variant="center-aligned"
          title="Centered server title"
          navigationIcon={<span>Back</span>}
          actions={<span>Actions</span>}
        />
        <BottomAppBar actions={<span>Bottom actions</span>} />
        <FlexibleBottomAppBar><span>Flexible actions</span></FlexibleBottomAppBar>
        <HorizontalFloatingToolbar aria-label="Server toolbar" expanded>
          <span>Toolbar action</span>
        </HorizontalFloatingToolbar>
      </>
    );

    const first = renderLane8(tree);
    const second = renderLane8(tree);
    expect(second).toBe(first);
    expect(first).toContain('role="tablist"');
    expect(first).toContain('data-variant="center-aligned"');
    expect(first).not.toContain('data-center-layout="true"');
    expect(first).toContain('data-variant="regular"');
    expect(first).toContain('data-variant="flexible"');
    expect(first).toContain('role="toolbar"');
    expect(first).not.toContain('NaN');
  });

  it('uses deterministic AppBarRow/Column initial layout without pretending SSR knows container size', () => {
    const tree = (
      <>
        <AppBarRow
          aria-label="Server row actions"
          items={appBarActions}
          maxItemCount={2}
          overflowLabel="Server row more"
        />
        <AppBarColumn
          aria-label="Server column actions"
          items={appBarActions}
          maxItemCount={2}
          overflowLabel="Server column more"
        />
      </>
    );

    const first = renderLane8(tree);
    const second = renderLane8(tree);
    expect(second).toBe(first);
    expect(first.match(/data-inline-count="1"/g)?.length).toBe(2);
    expect(first.match(/data-overflow-count="2"/g)?.length).toBe(2);
    expect(first).toContain('Server row more');
    expect(first).toContain('Server column more');
    expect(first).not.toContain('role="menu"');
    expect(first).not.toContain('NaN');
  });
});
