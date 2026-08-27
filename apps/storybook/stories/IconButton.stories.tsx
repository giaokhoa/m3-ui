import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  FilledIconButton,
  FilledIconToggleButton,
  FilledTonalIconButton,
  FilledTonalIconToggleButton,
  IconButton,
  IconToggleButton,
  OutlinedIconButton,
  OutlinedIconToggleButton,
  ThemeProvider,
  iconButtonShapesForSize,
  iconToggleButtonShapesForSize,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    'aria-label': 'Favorite',
    children: <FavoriteIcon />,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function FavoriteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.01 6.01 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ActionVariants({ disabled = false }: { disabled?: boolean }) {
  return (
    <div className="storybook-stack">
      <IconButton aria-label="Standard favorite" isDisabled={disabled}><FavoriteIcon /></IconButton>
      <FilledIconButton aria-label="Filled favorite" isDisabled={disabled}><FavoriteIcon /></FilledIconButton>
      <FilledTonalIconButton aria-label="Tonal favorite" isDisabled={disabled}><FavoriteIcon /></FilledTonalIconButton>
      <OutlinedIconButton aria-label="Outlined favorite" isDisabled={disabled}><FavoriteIcon /></OutlinedIconButton>
    </div>
  );
}

function ToggleVariants({ selected, disabled = false }: { selected: boolean; disabled?: boolean }) {
  const noop = () => {};
  return (
    <div className="storybook-stack">
      <IconToggleButton aria-label="Standard toggle favorite" isDisabled={disabled} isSelected={selected} onChange={noop}><FavoriteIcon /></IconToggleButton>
      <FilledIconToggleButton aria-label="Filled toggle favorite" isDisabled={disabled} isSelected={selected} onChange={noop}><FavoriteIcon /></FilledIconToggleButton>
      <FilledTonalIconToggleButton aria-label="Tonal toggle favorite" isDisabled={disabled} isSelected={selected} onChange={noop}><FavoriteIcon /></FilledTonalIconToggleButton>
      <OutlinedIconToggleButton aria-label="Outlined toggle favorite" isDisabled={disabled} isSelected={selected} onChange={noop}><FavoriteIcon /></OutlinedIconToggleButton>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <IconButton aria-label="Favorite"><FavoriteIcon /></IconButton>
    </div>
  ),
};

export const ActionVariantsStory: Story = {
  name: 'Action variants',
  render: () => (
    <div className="storybook-center">
      <ActionVariants />
    </div>
  ),
};

export const ToggleStates: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 24 }}>
        <ToggleVariants selected={false} />
        <ToggleVariants selected />
      </div>
    </div>
  ),
};

export const DisabledStates: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 24 }}>
        <ActionVariants disabled />
        <ToggleVariants disabled selected={false} />
        <ToggleVariants disabled selected />
      </div>
    </div>
  ),
};

export const ExpressiveSizes: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        {(['extraSmall', 'small', 'medium', 'large', 'extraLarge'] as const).map((size) => (
          <FilledTonalIconButton key={size} aria-label={`${size} favorite`} size={size}>
            <FavoriteIcon />
          </FilledTonalIconButton>
        ))}
      </div>
    </div>
  ),
};

export const WidthsAndShapes: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 24 }}>
        <div className="storybook-stack">
          <OutlinedIconButton aria-label="Narrow round" width="narrow"><FavoriteIcon /></OutlinedIconButton>
          <OutlinedIconButton aria-label="Default round" width="default"><FavoriteIcon /></OutlinedIconButton>
          <OutlinedIconButton aria-label="Wide round" width="wide"><FavoriteIcon /></OutlinedIconButton>
        </div>
        <div className="storybook-stack">
          <FilledTonalIconButton aria-label="Round" shape="round"><FavoriteIcon /></FilledTonalIconButton>
          <FilledTonalIconButton aria-label="Square" shape="square"><FavoriteIcon /></FilledTonalIconButton>
        </div>
      </div>
    </div>
  ),
};

export const ExpressiveShapeMorph: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        <FilledTonalIconButton
          aria-label="Press round favorite"
          size="medium"
          shapes={iconButtonShapesForSize('medium', 'round')}
        >
          <FavoriteIcon />
        </FilledTonalIconButton>
        <OutlinedIconButton
          aria-label="Press square favorite"
          size="medium"
          shape="square"
          shapes={iconButtonShapesForSize('medium', 'square')}
        >
          <FavoriteIcon />
        </OutlinedIconButton>
        <FilledTonalIconToggleButton
          aria-label="Selected shape favorite"
          isSelected
          onChange={() => {}}
          size="medium"
          shapes={iconToggleButtonShapesForSize('medium', 'round')}
        >
          <FavoriteIcon />
        </FilledTonalIconToggleButton>
      </div>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ActionVariants />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ActionVariants />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60">
        <h3>Dynamic · #006A60</h3>
        <ToggleVariants selected />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e">
        <h3>Dynamic dark · #B3261E</h3>
        <ToggleVariants selected />
      </ThemeProvider>
    </div>
  ),
};
