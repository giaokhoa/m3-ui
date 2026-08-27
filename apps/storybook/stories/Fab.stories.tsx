import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BrandedFloatingActionButton,
  ExtendedFloatingActionButton,
  FloatingActionButton,
  LargeExtendedFloatingActionButton,
  LargeFloatingActionButton,
  MediumExtendedFloatingActionButton,
  MediumFloatingActionButton,
  SmallExtendedFloatingActionButton,
  SmallFloatingActionButton,
  ThemeProvider,
  type FabVariant,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/Fab',
  component: FloatingActionButton,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    'aria-label': 'Create',
    children: <PlusIcon />,
  },
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor" />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36">
      <path d="M5 6h12v24H5z" fill="#4285f4" />
      <path d="M19 6h12v11H19z" fill="#34a853" />
      <path d="M19 19h12v11H19z" fill="#fbbc04" />
    </svg>
  );
}

const variants: readonly FabVariant[] = [
  'primaryContainer',
  'secondaryContainer',
  'tertiaryContainer',
  'surface',
  'primary',
  'secondary',
  'tertiary',
];

function VariantSet() {
  return (
    <div className="storybook-stack" style={{ flexWrap: 'wrap' }}>
      {variants.map((variant) => (
        <FloatingActionButton
          key={variant}
          aria-label={`${variant} create`}
          variant={variant}
        >
          <PlusIcon />
        </FloatingActionButton>
      ))}
    </div>
  );
}

function ThemeSample() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="storybook-stack">
        <FloatingActionButton aria-label="Primary container create">
          <PlusIcon />
        </FloatingActionButton>
        <FloatingActionButton aria-label="Surface create" variant="surface">
          <PlusIcon />
        </FloatingActionButton>
        <FloatingActionButton aria-label="Tertiary create" variant="tertiary">
          <PlusIcon />
        </FloatingActionButton>
        <BrandedFloatingActionButton aria-label="Branded create">
          <BrandIcon />
        </BrandedFloatingActionButton>
      </div>
      <ExtendedFloatingActionButton icon={<PlusIcon />} variant="secondaryContainer">
        Create
      </ExtendedFloatingActionButton>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="storybook-center">
      <FloatingActionButton aria-label="Create">
        <PlusIcon />
      </FloatingActionButton>
    </div>
  ),
};

export const SizeFamily: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        <SmallFloatingActionButton aria-label="Small create"><PlusIcon /></SmallFloatingActionButton>
        <FloatingActionButton aria-label="Baseline create"><PlusIcon /></FloatingActionButton>
        <MediumFloatingActionButton aria-label="Medium create"><PlusIcon /></MediumFloatingActionButton>
        <LargeFloatingActionButton aria-label="Large create"><PlusIcon /></LargeFloatingActionButton>
      </div>
    </div>
  ),
};

export const ColorFamilies: Story = {
  render: () => (
    <div className="storybook-center">
      <VariantSet />
    </div>
  ),
};

export const Branded: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        <BrandedFloatingActionButton aria-label="Branded normal">
          <BrandIcon />
        </BrandedFloatingActionButton>
        <BrandedFloatingActionButton aria-label="Branded lowered" elevation="lowered">
          <BrandIcon />
        </BrandedFloatingActionButton>
        <BrandedFloatingActionButton aria-label="Branded extended" label="Compose">
          <BrandIcon />
        </BrandedFloatingActionButton>
      </div>
    </div>
  ),
};

export const LoweredElevation: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        <FloatingActionButton aria-label="Surface normal" variant="surface"><PlusIcon /></FloatingActionButton>
        <FloatingActionButton aria-label="Surface lowered" elevation="lowered" variant="surface"><PlusIcon /></FloatingActionButton>
        <FloatingActionButton aria-label="Primary container lowered" elevation="lowered"><PlusIcon /></FloatingActionButton>
      </div>
    </div>
  ),
};

export const ExtendedSizes: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
        <ExtendedFloatingActionButton icon={<PlusIcon />}>Baseline extended</ExtendedFloatingActionButton>
        <SmallExtendedFloatingActionButton icon={<PlusIcon />}>Small extended</SmallExtendedFloatingActionButton>
        <MediumExtendedFloatingActionButton icon={<PlusIcon />}>Medium extended</MediumExtendedFloatingActionButton>
        <LargeExtendedFloatingActionButton icon={<PlusIcon />}>Large extended</LargeExtendedFloatingActionButton>
      </div>
    </div>
  ),
};

export const TextOnlyExtended: Story = {
  render: () => (
    <div className="storybook-center">
      <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
        <ExtendedFloatingActionButton>Baseline text</ExtendedFloatingActionButton>
        <SmallExtendedFloatingActionButton>Small text</SmallExtendedFloatingActionButton>
        <MediumExtendedFloatingActionButton>Medium text</MediumExtendedFloatingActionButton>
        <LargeExtendedFloatingActionButton>Large text</LargeExtendedFloatingActionButton>
      </div>
    </div>
  ),
};

export const CollapsedExtended: Story = {
  render: () => (
    <div className="storybook-center">
      <div className="storybook-stack">
        <ExtendedFloatingActionButton aria-label="Baseline collapsed" expanded={false} icon={<PlusIcon />}>Create</ExtendedFloatingActionButton>
        <SmallExtendedFloatingActionButton aria-label="Small collapsed" expanded={false} icon={<PlusIcon />}>Create</SmallExtendedFloatingActionButton>
        <MediumExtendedFloatingActionButton aria-label="Medium collapsed" expanded={false} icon={<PlusIcon />}>Create</MediumExtendedFloatingActionButton>
        <LargeExtendedFloatingActionButton aria-label="Large collapsed" expanded={false} icon={<PlusIcon />}>Create</LargeExtendedFloatingActionButton>
      </div>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <ThemeSample />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <ThemeSample />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60">
        <h3>Dynamic · #006A60</h3>
        <ThemeSample />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e">
        <h3>Dynamic dark · #B3261E</h3>
        <ThemeSample />
      </ThemeProvider>
    </div>
  ),
};
