import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShortNavigationBar, ShortNavigationBarItem } from '@m3-ui/ui';

const meta = {
  title: 'Components/ShortNavigationBar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const icons = [
  <Icon key="home"><path d="M12 3 3 10v11h6v-7h6v7h6V10l-9-7Z" /></Icon>,
  <Icon key="search"><path d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0-2a8 8 0 1 1 4.9 14.3L20.6 22 22 20.6l-5.7-5.7A8 8 0 0 1 10 2Z" /></Icon>,
  <Icon key="favorite"><path d="M12 21 10.6 19.7C5.4 15 2 11.9 2 8.1 2 5 4.4 3 7.3 3c1.7 0 3.4.8 4.7 2.1C13.3 3.8 15 3 16.7 3 19.6 3 22 5 22 8.1c0 3.8-3.4 6.9-8.6 11.6L12 21Z" /></Icon>,
  <Icon key="mail"><path d="M3 5h18v14H3V5Zm9 7 7-5H5l7 5Z" /></Icon>,
  <Icon key="person"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z" /></Icon>,
  <Icon key="settings"><path d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 3h-4l-.4 3a8 8 0 0 0-1.7 1L6.5 6l-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.4 3h4l.4-3a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5ZM13 15h-2a3 3 0 1 1 2 0Z" /></Icon>,
] as const;
const labels = ['Home', 'Search', 'Favorites', 'Inbox', 'Profile', 'Settings'] as const;

function Demo({ count = 4, arrangement = 'equal-weight', iconPosition = 'top', dir = 'ltr' }: {
  count?: number;
  arrangement?: 'equal-weight' | 'centered';
  iconPosition?: 'top' | 'start';
  dir?: 'ltr' | 'rtl';
}) {
  const [selected, setSelected] = useState(0);
  return (
    <div dir={dir} style={{ minHeight: 280, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <main style={{ flex: 1, padding: 24 }}>Selected: {labels[selected]}</main>
      <ShortNavigationBar data-testid="short-navigation-bar" arrangement={arrangement} aria-label="Primary destinations">
        {labels.slice(0, count).map((label, index) => (
          <ShortNavigationBarItem
            key={label}
            data-testid={`short-navigation-item-${index}`}
            isSelected={selected === index}
            onPress={() => setSelected(index)}
            icon={icons[index]}
            label={label}
            iconPosition={iconPosition}
          />
        ))}
      </ShortNavigationBar>
    </div>
  );
}

export const EqualWeight3: Story = { render: () => <Demo count={3} /> };
export const EqualWeight4: Story = { render: () => <Demo count={4} /> };
export const EqualWeight5: Story = { render: () => <Demo count={5} /> };
export const Centered3: Story = { render: () => <Demo count={3} arrangement="centered" iconPosition="start" /> };
export const Centered6: Story = { render: () => <Demo count={6} arrangement="centered" iconPosition="start" /> };
export const RTL: Story = { render: () => <Demo count={4} dir="rtl" /> };
export const DisabledAndLink: Story = {
  render: () => (
    <ShortNavigationBar aria-label="Mixed destinations">
      <ShortNavigationBarItem isSelected icon={icons[0]} label="Home" />
      <ShortNavigationBarItem isSelected={false} icon={icons[1]} label="Search" isDisabled />
      <ShortNavigationBarItem isSelected={false} icon={icons[2]} label="Docs" href="#docs" />
    </ShortNavigationBar>
  ),
};
