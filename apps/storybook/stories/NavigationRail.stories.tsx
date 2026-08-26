import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationRail, NavigationRailItem, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/NavigationRail',
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

function RailDemo({
  alwaysShowLabel = true,
  iconOnly = false,
  withHeader = false,
}: {
  alwaysShowLabel?: boolean;
  iconOnly?: boolean;
  withHeader?: boolean;
}) {
  const [selected, setSelected] = useState<(typeof destinations)[number]['id']>('home');
  return (
    <div
      data-testid="navigation-rail-stage"
      style={{
        display: 'flex',
        minHeight: 420,
        height: '100vh',
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      <NavigationRail
        data-testid="navigation-rail"
        aria-label="Primary destinations"
        header={withHeader ? <div data-testid="navigation-rail-header" style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--primary-container)' }} /> : undefined}
      >
        {destinations.map((destination) => (
          <NavigationRailItem
            key={destination.id}
            data-testid={`navigation-rail-item-${destination.id}`}
            selected={selected === destination.id}
            icon={destination.icon}
            label={iconOnly ? undefined : destination.label}
            alwaysShowLabel={alwaysShowLabel}
            aria-label={iconOnly ? destination.label : undefined}
            onPress={() => setSelected(destination.id)}
          />
        ))}
      </NavigationRail>
      <main style={{ flex: 1, padding: 32 }}>
        <h1 style={{ marginTop: 0 }}>Navigation rail</h1>
        <p data-testid="navigation-rail-selection">Selected: {selected}</p>
      </main>
    </div>
  );
}

export const Default: Story = { render: () => <RailDemo /> };
export const SelectedLabelOnly: Story = { render: () => <RailDemo alwaysShowLabel={false} /> };
export const IconOnly: Story = { render: () => <RailDemo iconOnly /> };
export const WithHeader: Story = { render: () => <RailDemo withHeader /> };

export const Disabled: Story = {
  render: () => (
    <div style={{ height: 420, background: 'var(--surface)' }}>
      <NavigationRail aria-label="Disabled example">
        <NavigationRailItem selected icon={homeIcon} label="Home" />
        <NavigationRailItem selected={false} icon={exploreIcon} label="Explore" isDisabled />
        <NavigationRailItem selected={false} icon={favoriteIcon} label="Favorites" />
      </NavigationRail>
    </div>
  ),
};

function ThemeRail({ mode, sourceColor, label }: { mode: 'light' | 'dark'; sourceColor?: string; label: string }) {
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div style={{ display: 'flex', height: 360, background: 'var(--surface)' }}>
        <NavigationRail aria-label={`${label} destinations`}>
          <NavigationRailItem selected icon={homeIcon} label="Home" />
          <NavigationRailItem selected={false} icon={exploreIcon} label="Explore" />
          <NavigationRailItem selected={false} icon={favoriteIcon} label="Favorites" />
        </NavigationRail>
        <div style={{ padding: 16, color: 'var(--on-surface)' }}>{label}</div>
      </div>
    </ThemeProvider>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 12 }}>
      <ThemeRail label="Baseline light" mode="light" />
      <ThemeRail label="Baseline dark" mode="dark" />
      <ThemeRail label="Dynamic light" mode="light" sourceColor="#006a60" />
      <ThemeRail label="Dynamic dark" mode="dark" sourceColor="#b3261e" />
    </div>
  ),
};
