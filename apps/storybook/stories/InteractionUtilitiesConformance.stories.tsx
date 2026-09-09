import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  HorizontalMultiBrowseCarousel,
  NonInteractiveScrollbar,
  PullToRefresh,
  ScrollField,
  ThemeProvider,
  VerticalDragHandle,
} from '@m3-ui/ui';

const meta = {
  title: 'Conformance/InteractionUtilities',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const carouselLabels = ['Alpha', 'Beta', 'Gamma', 'Delta'];
const scrollFieldItems = ['One', 'Two', 'Three', 'Four'];

function DynamicThemeDemo() {
  const scrollbarRef = useRef<HTMLDivElement>(null);

  return (
    <ThemeProvider
      className="interaction-utilities-dynamic-theme"
      mode="light"
      sourceColor="#006a60"
    >
      <div
        style={{
          boxSizing: 'border-box',
          background: 'var(--surface)',
          color: 'var(--on-surface)',
          display: 'grid',
          gap: 32,
          minHeight: '100vh',
          padding: 32,
        }}
      >
        <section style={{ inlineSize: 420 }}>
          <HorizontalMultiBrowseCarousel
            aria-label="Theme carousel"
            data-testid="theme-carousel"
            itemCount={carouselLabels.length}
            preferredItemWidth={186}
          >
            {({ index }) => (
              <div
                style={{
                  alignItems: 'center',
                  background: 'var(--surface-container)',
                  blockSize: '100%',
                  boxSizing: 'border-box',
                  color: 'var(--on-surface)',
                  display: 'flex',
                  justifyContent: 'center',
                  minBlockSize: 120,
                }}
              >
                {carouselLabels[index]}
              </div>
            )}
          </HorizontalMultiBrowseCarousel>
        </section>

        <section style={{ blockSize: 160, inlineSize: 320 }}>
          <PullToRefresh
            data-testid="theme-pull-to-refresh"
            isRefreshing
            onRefresh={() => {}}
            style={{ blockSize: '100%' }}
          >
            <div style={{ minBlockSize: 220, padding: 16 }}>Refresh content</div>
          </PullToRefresh>
        </section>

        <ScrollField
          aria-label="Theme scroll field"
          data-testid="theme-scroll-field"
          defaultSelectedIndex={1}
          items={scrollFieldItems}
        />

        <VerticalDragHandle
          aria-label="Theme resize handle"
          data-testid="theme-drag-handle"
          role="separator"
          tabIndex={0}
        />

        <section
          data-testid="theme-scrollbar-host"
          style={{
            blockSize: 140,
            inlineSize: 260,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            data-testid="theme-scrollbar-scroller"
            ref={scrollbarRef}
            style={{
              inset: 0,
              overflowY: 'auto',
              position: 'absolute',
              scrollbarWidth: 'none',
            }}
          >
            <div style={{ blockSize: 520, padding: 12 }}>Scrollable content</div>
          </div>
          <NonInteractiveScrollbar
            data-testid="theme-scrollbar"
            isFadeEnabled={false}
            scrollRef={scrollbarRef}
          />
        </section>
      </div>
    </ThemeProvider>
  );
}

export const DynamicTheme: Story = {
  render: () => <DynamicThemeDemo />,
};
