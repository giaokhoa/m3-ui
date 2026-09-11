import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, ThemeProvider, type MaterialTab } from '@m3-ui/ui';

const meta = {
  title: 'Components/Tabs',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const homeIcon = <Icon><path d="M12 3 3 10v11h6v-7h6v7h6V10l-9-7Z" /></Icon>;
const starIcon = <Icon><path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.2L5.8 21 7 14.1l-5-4.8 6.9-1L12 2Z" /></Icon>;
const personIcon = <Icon><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" /></Icon>;

const fixedItems: MaterialTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'settings', label: 'Settings' },
];

const scrollItems: MaterialTab[] = [
  { id: 'for-you', label: 'For you' },
  { id: 'following', label: 'Following' },
  { id: 'news', label: 'News' },
  { id: 'music', label: 'Music' },
  { id: 'movies', label: 'Movies' },
  { id: 'books', label: 'Books' },
];

function Demo({
  items = fixedItems,
  variant = 'primary',
  mode = 'fixed',
  dir,
}: {
  items?: readonly MaterialTab[];
  variant?: 'primary' | 'secondary';
  mode?: 'fixed' | 'scrollable';
  dir?: 'ltr' | 'rtl';
}) {
  const [selected, setSelected] = useState<string | number>(items[0]?.id ?? '');
  return (
    <div
      dir={dir}
      data-testid="tabs-stage"
      style={{ maxWidth: mode === 'scrollable' ? 360 : 600, padding: 24 }}
    >
      <Tabs
        aria-label={`${variant} ${mode} tabs`}
        data-testid="tabs"
        items={items}
        mode={mode}
        selectedKey={selected}
        variant={variant}
        onSelectionChange={setSelected}
      />
      <p data-testid="tabs-selection">Selected: {selected}</p>
    </div>
  );
}

export const PrimaryFixed: Story = { render: () => <Demo /> };
export const SecondaryFixed: Story = {
  render: () => <Demo variant="secondary" />,
};
export const PrimaryScrollable: Story = {
  render: () => <Demo items={scrollItems} mode="scrollable" />,
};
export const SecondaryScrollable: Story = {
  render: () => <Demo items={scrollItems} mode="scrollable" variant="secondary" />,
};

export const IconsAndLeadingIcon: Story = {
  render: () => (
    <Demo
      items={[
        { id: 'home', label: 'Home', icon: homeIcon },
        { id: 'favorites', label: 'Favorites', icon: starIcon },
        {
          id: 'profile',
          label: 'Profile',
          icon: personIcon,
          iconPlacement: 'start',
        },
      ]}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Demo
      items={[
        { id: 'overview', label: 'Overview' },
        { id: 'disabled', label: 'Disabled', disabled: true },
        { id: 'settings', label: 'Settings' },
      ]}
    />
  ),
};

export const RtlScrollable: Story = {
  render: () => <Demo dir="rtl" items={scrollItems} mode="scrollable" />,
};

function ThemeTabs({
  mode,
  sourceColor,
  label,
}: {
  mode: 'light' | 'dark';
  sourceColor?: string;
  label: string;
}) {
  return (
    <ThemeProvider mode={mode} sourceColor={sourceColor}>
      <div style={{ background: 'var(--surface)', color: 'var(--on-surface)', padding: 16 }}>
        <div style={{ marginBottom: 8 }}>{label}</div>
        <Tabs aria-label={`${label} tabs`} defaultSelectedKey="overview" items={fixedItems} />
      </div>
    </ThemeProvider>
  );
}

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, padding: 12 }}>
      <ThemeTabs label="Baseline light" mode="light" />
      <ThemeTabs label="Baseline dark" mode="dark" />
      <ThemeTabs label="Dynamic light" mode="light" sourceColor="#006a60" />
      <ThemeTabs label="Dynamic dark" mode="dark" sourceColor="#b3261e" />
    </div>
  ),
};
