import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  HorizontalCenteredHeroCarousel,
  HorizontalMultiBrowseCarousel,
  HorizontalUncontainedCarousel,
  ThemeProvider,
  useCarouselState,
} from '@m3/ui';

const meta = {
  title: 'Components/Carousel',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Tile({ index }: { index: number }) {
  return (
    <div
      data-testid={`carousel-content-${index}`}
      style={{
        alignItems: 'center',
        background: 'var(--primary-container)',
        borderRadius: 24,
        boxSizing: 'border-box',
        color: 'var(--on-primary-container)',
        display: 'flex',
        fontSize: 32,
        height: 180,
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {index + 1}
    </div>
  );
}

function Stage({ children, width = 412, dir }: { children: ReactNode; width?: number; dir?: 'ltr' | 'rtl' }) {
  return <div data-testid="carousel-stage" dir={dir} style={{ padding: 24, width }}>{children}</div>;
}

export const MultiBrowse: Story = {
  render: () => (
    <Stage>
      <HorizontalMultiBrowseCarousel
        aria-label="Featured albums"
        data-testid="carousel"
        itemCount={8}
        itemSpacing={8}
        preferredItemWidth={186}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  ),
};

export const ExactMultiBrowseGeometry: Story = {
  render: () => (
    <Stage width={380}>
      <HorizontalMultiBrowseCarousel
        aria-label="Pinned geometry carousel"
        data-testid="carousel"
        itemCount={10}
        itemSpacing={8}
        preferredItemWidth={186}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  ),
};

export const ContentPadding: Story = {
  render: () => (
    <Stage width={412}>
      <HorizontalMultiBrowseCarousel
        aria-label="Padded carousel"
        contentPadding={16}
        data-testid="carousel"
        itemCount={10}
        itemSpacing={8}
        preferredItemWidth={186}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  ),
};

export const Uncontained: Story = {
  render: () => (
    <Stage width={360}>
      <HorizontalUncontainedCarousel
        aria-label="Recent photos"
        data-testid="carousel"
        itemCount={8}
        itemSpacing={8}
        itemWidth={120}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalUncontainedCarousel>
    </Stage>
  ),
};

export const ExactUncontainedGeometry: Story = {
  render: () => (
    <Stage width={400}>
      <HorizontalUncontainedCarousel
        aria-label="Pinned uncontained carousel"
        data-testid="carousel"
        itemCount={8}
        itemWidth={125}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalUncontainedCarousel>
    </Stage>
  ),
};

export const CenteredHero: Story = {
  render: () => (
    <Stage width={400}>
      <HorizontalCenteredHeroCarousel
        aria-label="Featured stories"
        data-testid="carousel"
        defaultCurrentItem={1}
        itemCount={7}
        itemSpacing={8}
        maxItemWidth={280}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalCenteredHeroCarousel>
    </Stage>
  ),
};

function StateDemo() {
  const [count, setCount] = useState(7);
  const state = useCarouselState({ itemCount: count, defaultCurrentItem: 1 });
  return (
    <Stage>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button data-testid="jump-4" onClick={() => state.scrollToItem(4)}>Jump 5</button>
        <button data-testid="animate-2" onClick={() => state.animateScrollToItem(2)}>Animate 3</button>
        <button data-testid="shrink" onClick={() => setCount(2)}>Shrink</button>
      </div>
      <output data-testid="current-item">{state.currentItem}</output>
      <HorizontalMultiBrowseCarousel
        aria-label="Stateful carousel"
        data-testid="carousel"
        itemSpacing={8}
        preferredItemWidth={186}
        state={state}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  );
}

export const StateAndProgrammaticNavigation: Story = { render: () => <StateDemo /> };

function ControlledDemo() {
  const [current, setCurrent] = useState(1);
  return (
    <Stage>
      <output data-testid="controlled-current">{current}</output>
      <HorizontalMultiBrowseCarousel
        aria-label="Controlled carousel"
        currentItem={current}
        data-testid="carousel"
        itemCount={6}
        itemSpacing={8}
        onCurrentItemChange={setCurrent}
        preferredItemWidth={186}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  );
}

export const ControlledCurrentItem: Story = { render: () => <ControlledDemo /> };

export const UserScrollDisabled: Story = {
  render: () => (
    <Stage>
      <HorizontalMultiBrowseCarousel
        aria-label="Static carousel"
        data-testid="carousel"
        itemCount={6}
        itemSpacing={8}
        preferredItemWidth={186}
        userScrollEnabled={false}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  ),
};

export const RTL: Story = {
  render: () => (
    <Stage dir="rtl">
      <HorizontalMultiBrowseCarousel
        aria-label="RTL carousel"
        data-testid="carousel"
        dir="rtl"
        itemCount={8}
        itemSpacing={8}
        preferredItemWidth={186}
      >
        {({ index }) => <Tile index={index} />}
      </HorizontalMultiBrowseCarousel>
    </Stage>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, padding: 24 }}>
      <ThemeProvider>
        <HorizontalMultiBrowseCarousel aria-label="Light carousel" itemCount={5} itemSpacing={8} preferredItemWidth={186}>
          {({ index }) => <Tile index={index} />}
        </HorizontalMultiBrowseCarousel>
      </ThemeProvider>
      <ThemeProvider mode="dark">
        <HorizontalCenteredHeroCarousel aria-label="Dark carousel" defaultCurrentItem={1} itemCount={5} itemSpacing={8} maxItemWidth={280}>
          {({ index }) => <Tile index={index} />}
        </HorizontalCenteredHeroCarousel>
      </ThemeProvider>
    </div>
  ),
};
