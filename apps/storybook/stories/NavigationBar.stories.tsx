import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationBar, NavigationBarItem, ThemeProvider } from '@m3-ui/ui';

const meta = {
  title: 'Components/NavigationBar',
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
const personIcon = <Icon><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" /></Icon>;

const destinations = [
  { id: 'home', label: 'Home', icon: homeIcon },
  { id: 'explore', label: 'Explore', icon: exploreIcon },
  { id: 'favorites', label: 'Favorites', icon: favoriteIcon },
  { id: 'profile', label: 'Profile', icon: personIcon },
] as const;

function BarDemo({ alwaysShowLabel = true }: { alwaysShowLabel?: boolean }) {
  const [selected, setSelected] = useState<(typeof destinations)[number]['id']>('home');
  return (
    <div
      data-testid="navigation-bar-stage"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 360,
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      <main style={{ flex: 1, padding: 32 }}>
        <h1 style={{ marginTop: 0 }}>Navigation bar</h1>
        <p data-testid="navigation-bar-selection">Selected: {selected}</p>
      </main>
      <NavigationBar data-testid="navigation-bar" aria-label="Primary destinations">
        {destinations.map((destination) => (
          <NavigationBarItem
            key={destination.id}
            data-testid={`navigation-bar-item-${destination.id}`}
            selected={selected === destination.id}
            icon={destination.icon}
            label={destination.label}
            alwaysShowLabel={alwaysShowLabel}
            onPress={() => setSelected(destination.id)}
          />
        ))}
      </NavigationBar>
    </div>
  );
}

export const Default: Story = { render: () => <BarDemo /> };
export const SelectedLabelOnly: Story = { render: () => <BarDemo alwaysShowLabel={false} /> };

export const Disabled: Story = {
  render: () => (
    <div style={{ paddingTop: 180, background: 'var(--surface)' }}>
      <NavigationBar aria-label="Disabled example">
        <NavigationBarItem selected icon={homeIcon} label="Home" />
        <NavigationBarItem selected={false} icon={exploreIcon} label="Explore" isDisabled />
        <NavigationBarItem selected={false} icon={favoriteIcon} label="Favorites" />
      </NavigationBar>
    </div>
  ),
};

function ThemeBar({ mode, sourceColor, label }: { mode: 'light' | 'dark'; sourceColor?: string; label: string }) {
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div style={{ background: 'var(--surface)', paddingTop: 80 }}>
        <div style={{ padding: '0 16px 12px', color: 'var(--on-surface)' }}>{label}</div>
        <NavigationBar aria-label={`${label} destinations`}>
          <NavigationBarItem selected icon={homeIcon} label="Home" />
          <NavigationBarItem selected={false} icon={exploreIcon} label="Explore" />
          <NavigationBarItem selected={false} icon={favoriteIcon} label="Favorites" />
        </NavigationBar>
      </div>
    </ThemeProvider>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 12 }}>
      <ThemeBar label="Baseline light" mode="light" />
      <ThemeBar label="Baseline dark" mode="dark" />
      <ThemeBar label="Dynamic light" mode="light" sourceColor="#006a60" />
      <ThemeBar label="Dynamic dark" mode="dark" sourceColor="#b3261e" />
    </div>
  ),
};
