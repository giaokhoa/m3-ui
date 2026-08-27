import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DismissibleDrawerSheet,
  DismissibleNavigationDrawer,
  DrawerValue,
  ModalDrawerSheet,
  ModalNavigationDrawer,
  NavigationDrawerItem,
  PermanentDrawerSheet,
  PermanentNavigationDrawer,
  ThemeProvider,
  useDrawerState,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/NavigationDrawer',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const homeIcon = <Icon><path d="M12 3 3 10v11h6v-7h6v7h6V10l-9-7Z" /></Icon>;
const exploreIcon = <Icon><path d="m14.2 14.2-4.8 2.4 2.4-4.8 4.8-2.4-2.4 4.8ZM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" /></Icon>;
const favoriteIcon = <Icon><path d="M12 21 10.6 19.7C5.4 15 2 11.9 2 8.1 2 5 4.4 3 7.3 3c1.7 0 3.4.8 4.7 2.1C13.3 3.8 15 3 16.7 3 19.6 3 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6L12 21Z" /></Icon>;

function DrawerItems({ selected, onSelect }: { selected: string; onSelect: (value: string) => void }) {
  return (
    <>
      <div style={{ padding: '28px 28px 16px', color: 'var(--on-surface-variant)' }}><strong>Mail</strong></div>
      <div role="tablist" aria-label="Main navigation">
        <NavigationDrawerItem data-testid="drawer-item-home" selected={selected === 'home'} icon={homeIcon} onPress={() => onSelect('home')}>Home</NavigationDrawerItem>
        <NavigationDrawerItem data-testid="drawer-item-explore" selected={selected === 'explore'} icon={exploreIcon} badge="12" onPress={() => onSelect('explore')}>Explore</NavigationDrawerItem>
        <NavigationDrawerItem data-testid="drawer-item-favorites" selected={selected === 'favorites'} icon={favoriteIcon} onPress={() => onSelect('favorites')}>Favorites</NavigationDrawerItem>
      </div>
    </>
  );
}

function DrawerDemo() {
  const [selected, setSelected] = useState('home');
  return (
    <div data-testid="navigation-drawer-stage" style={{ height: '100vh', minHeight: 600, background: 'var(--surface)' }}>
      <PermanentNavigationDrawer data-testid="permanent-navigation-drawer" drawerContent={<PermanentDrawerSheet data-testid="permanent-drawer-sheet"><DrawerItems selected={selected} onSelect={setSelected} /></PermanentDrawerSheet>}>
        <main style={{ padding: 32, color: 'var(--on-surface)' }}><h1 style={{ marginTop: 0 }}>Inbox</h1><p>Permanent navigation keeps content and drawer in the same hierarchy.</p></main>
      </PermanentNavigationDrawer>
    </div>
  );
}

export const Permanent: Story = { render: () => <DrawerDemo /> };

function ModalDemo() {
  const drawerState = useDrawerState();
  const [selected, setSelected] = useState('home');
  return (
    <div data-testid="modal-drawer-stage" style={{ height: '100vh', minHeight: 600, background: 'var(--surface)' }}>
      <ModalNavigationDrawer
        data-testid="modal-navigation-drawer"
        state={drawerState}
        drawerContent={<ModalDrawerSheet data-testid="modal-drawer-sheet"><DrawerItems selected={selected} onSelect={setSelected} /></ModalDrawerSheet>}
      >
        <main data-testid="modal-drawer-content" style={{ height: '100%', padding: 32, color: 'var(--on-surface)' }}>
          <button data-testid="modal-drawer-open" onClick={() => drawerState.open()}>Open navigation</button>
          <h1>Inbox</h1>
          <p>Swipe horizontally or use the button to open the modal drawer.</p>
        </main>
      </ModalNavigationDrawer>
    </div>
  );
}

export const Modal: Story = { render: () => <ModalDemo /> };

function DismissibleDemo({ rtl = false }: { rtl?: boolean }) {
  const drawerState = useDrawerState({ initialValue: DrawerValue.Closed });
  const [selected, setSelected] = useState('home');
  return (
    <div dir={rtl ? 'rtl' : undefined} data-testid="dismissible-drawer-stage" style={{ height: '100vh', minHeight: 600, background: 'var(--surface)' }}>
      <DismissibleNavigationDrawer
        data-testid="dismissible-navigation-drawer"
        state={drawerState}
        drawerContent={<DismissibleDrawerSheet data-testid="dismissible-drawer-sheet"><DrawerItems selected={selected} onSelect={setSelected} /></DismissibleDrawerSheet>}
      >
        <main data-testid="dismissible-drawer-content" style={{ height: '100%', padding: 32, color: 'var(--on-surface)' }}>
          <button data-testid="dismissible-drawer-open" onClick={() => drawerState.open()}>Open navigation</button>
          <h1>Gallery</h1>
          <p>Dismissible navigation changes the content layout grid.</p>
        </main>
      </DismissibleNavigationDrawer>
    </div>
  );
}

export const Dismissible: Story = { render: () => <DismissibleDemo /> };
export const DismissibleRtl: Story = { render: () => <DismissibleDemo rtl /> };

function ThemeDrawer({ mode, sourceColor, label }: { mode: 'light' | 'dark'; sourceColor?: string; label: string }) {
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div style={{ height: 260, background: 'var(--surface)' }}>
        <PermanentNavigationDrawer drawerContent={<PermanentDrawerSheet><div style={{ padding: 16 }}>{label}</div><div role="tablist" aria-label={`${label} navigation`}><NavigationDrawerItem selected icon={homeIcon}>Home</NavigationDrawerItem><NavigationDrawerItem selected={false} icon={exploreIcon}>Explore</NavigationDrawerItem></div></PermanentDrawerSheet>}><div /></PermanentNavigationDrawer>
      </div>
    </ThemeProvider>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 12 }}>
      <ThemeDrawer label="Baseline light" mode="light" />
      <ThemeDrawer label="Baseline dark" mode="dark" />
      <ThemeDrawer label="Dynamic light" mode="light" sourceColor="#006a60" />
      <ThemeDrawer label="Dynamic dark" mode="dark" sourceColor="#b3261e" />
    </div>
  ),
};
