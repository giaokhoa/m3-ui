import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ModalWideNavigationRail,
  ThemeProvider,
  WideNavigationRail,
  WideNavigationRailItem,
  WideNavigationRailValue,
  useWideNavigationRailState,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/WideNavigationRail',
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

function WideRailDemo({
  initialValue = WideNavigationRailValue.Collapsed,
  iconOnly = false,
  longLabel = false,
  withHeader = false,
}: {
  initialValue?: WideNavigationRailValue;
  iconOnly?: boolean;
  longLabel?: boolean;
  withHeader?: boolean;
}) {
  const railState = useWideNavigationRailState(initialValue);
  const [selected, setSelected] = useState<(typeof destinations)[number]['id']>('home');

  return (
    <div
      data-testid="wide-navigation-rail-stage"
      style={{
        display: 'flex',
        minHeight: 520,
        height: '100vh',
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      <WideNavigationRail
        data-testid="wide-navigation-rail"
        aria-label="Primary destinations"
        state={railState}
        header={withHeader ? <div data-testid="wide-navigation-rail-header" style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--primary-container)' }} /> : undefined}
      >
        {destinations.map((destination, index) => (
          <WideNavigationRailItem
            key={destination.id}
            data-testid={`wide-navigation-rail-item-${destination.id}`}
            selected={selected === destination.id}
            icon={destination.icon}
            label={
              iconOnly
                ? undefined
                : longLabel && index === 1
                  ? 'A destination label deliberately long enough to widen the rail'
                  : destination.label
            }
            aria-label={iconOnly ? destination.label : undefined}
            onPress={() => setSelected(destination.id)}
          />
        ))}
      </WideNavigationRail>
      <main style={{ flex: 1, padding: 32 }}>
        <h1 style={{ marginTop: 0 }}>Wide navigation rail</h1>
        <button data-testid="wide-navigation-rail-toggle" onClick={() => railState.toggle()}>
          Toggle rail
        </button>
        <p data-testid="wide-navigation-rail-selection">Selected: {selected}</p>
      </main>
    </div>
  );
}

export const Default: Story = { render: () => <WideRailDemo /> };
export const Expanded: Story = {
  render: () => <WideRailDemo initialValue={WideNavigationRailValue.Expanded} />,
};
export const IconOnly: Story = {
  render: () => (
    <WideRailDemo initialValue={WideNavigationRailValue.Expanded} iconOnly />
  ),
};
export const LongLabel: Story = {
  render: () => (
    <WideRailDemo initialValue={WideNavigationRailValue.Expanded} longLabel />
  ),
};
export const WithHeader: Story = {
  render: () => <WideRailDemo withHeader />,
};

function ModalRailDemo({
  hideOnCollapse = false,
  initialValue = WideNavigationRailValue.Collapsed,
}: {
  hideOnCollapse?: boolean;
  initialValue?: WideNavigationRailValue;
}) {
  const railState = useWideNavigationRailState(initialValue);
  const [selected, setSelected] = useState<(typeof destinations)[number]['id']>('home');
  const header = (
    <button
      aria-label="Toggle navigation rail"
      onClick={() => railState.toggle()}
      style={{ width: 48, height: 48, borderRadius: 24 }}
    >
      ☰
    </button>
  );

  return (
    <div
      data-testid="modal-wide-navigation-rail-stage"
      style={{
        display: 'flex',
        minHeight: 520,
        height: '100vh',
        background: 'var(--surface)',
        color: 'var(--on-surface)',
      }}
    >
      <ModalWideNavigationRail
        data-testid="modal-wide-navigation-rail-host"
        aria-label="Modal primary destinations"
        state={railState}
        hideOnCollapse={hideOnCollapse}
        header={header}
      >
        {destinations.map((destination) => (
          <WideNavigationRailItem
            key={destination.id}
            data-testid={`modal-wide-navigation-rail-item-${destination.id}`}
            selected={selected === destination.id}
            icon={destination.icon}
            label={destination.label}
            onPress={() => setSelected(destination.id)}
          />
        ))}
      </ModalWideNavigationRail>
      <main data-testid="modal-wide-navigation-rail-main" style={{ flex: 1, padding: 32 }}>
        <h1 style={{ marginTop: 0 }}>Modal wide navigation rail</h1>
        <button
          data-testid="modal-wide-navigation-rail-toggle"
          onClick={() => railState.toggle()}
        >
          Toggle modal rail
        </button>
        <p data-testid="modal-wide-navigation-rail-selection">Selected: {selected}</p>
      </main>
    </div>
  );
}

export const Modal: Story = { render: () => <ModalRailDemo /> };
export const ModalExpanded: Story = {
  render: () => (
    <ModalRailDemo initialValue={WideNavigationRailValue.Expanded} />
  ),
};
export const ModalDismissible: Story = {
  render: () => <ModalRailDemo hideOnCollapse />,
};
export const ModalDismissibleExpanded: Story = {
  render: () => (
    <ModalRailDemo
      hideOnCollapse
      initialValue={WideNavigationRailValue.Expanded}
    />
  ),
};

function ThemeRail({
  mode,
  sourceColor,
  label,
}: {
  mode: 'light' | 'dark';
  sourceColor?: string;
  label: string;
}) {
  const state = useWideNavigationRailState(WideNavigationRailValue.Expanded);
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div style={{ display: 'flex', height: 340, background: 'var(--surface)' }}>
        <WideNavigationRail state={state} aria-label={`${label} destinations`}>
          <WideNavigationRailItem selected icon={homeIcon} label="Home" />
          <WideNavigationRailItem selected={false} icon={exploreIcon} label="Explore" />
          <WideNavigationRailItem selected={false} icon={favoriteIcon} label="Favorites" />
        </WideNavigationRail>
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
