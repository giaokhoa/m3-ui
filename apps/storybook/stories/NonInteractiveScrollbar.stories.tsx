import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NonInteractiveScrollbar } from '@m3-ui/ui';

const meta = {
  title: 'Components/NonInteractiveScrollbar',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type DemoProps = {
  orientation?: 'vertical' | 'horizontal';
  dir?: 'ltr' | 'rtl';
  isFadeEnabled?: boolean;
  contentLength?: number;
  viewportLength?: number;
  thumbMinLength?: number;
  thumbMaxLengthFraction?: number;
  fadeDuration?: number;
  fadeDelay?: number;
};

function ScrollbarDemo({
  orientation = 'vertical',
  dir = 'ltr',
  isFadeEnabled = false,
  contentLength = 480,
  viewportLength = 160,
  thumbMinLength,
  thumbMaxLengthFraction,
  fadeDuration,
  fadeDelay,
}: DemoProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const vertical = orientation === 'vertical';

  return (
    <div
      data-testid="scrollbar-host"
      dir={dir}
      style={{
        position: 'relative',
        inlineSize: vertical ? 240 : viewportLength,
        blockSize: vertical ? viewportLength : 140,
        border: '1px solid var(--outline-variant)',
        overflow: 'hidden',
      }}
    >
      <div
        data-testid="scrollbar-scroller"
        ref={scrollRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflowX: vertical ? 'hidden' : 'auto',
          overflowY: vertical ? 'auto' : 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        <div
          data-testid="scrollbar-content"
          style={{
            inlineSize: vertical ? '100%' : contentLength,
            blockSize: vertical ? contentLength : '100%',
            background: 'linear-gradient(135deg, var(--surface-container-low), var(--surface-container-high))',
            display: 'grid',
            placeItems: 'start',
          }}
        >
          <button data-testid="underlay-button" style={{ margin: 8 }}>Under overlay</button>
        </div>
      </div>
      <NonInteractiveScrollbar
        data-testid="scrollbar"
        fadeDelay={fadeDelay}
        fadeDuration={fadeDuration}
        isFadeEnabled={isFadeEnabled}
        orientation={orientation}
        scrollRef={scrollRef}
        thumbMaxLengthFraction={thumbMaxLengthFraction}
        thumbMinLength={thumbMinLength}
        trackStyle={{ background: 'color-mix(in srgb, var(--outline) 16%, transparent)' }}
      />
    </div>
  );
}

export const VerticalLTR: Story = { render: () => <ScrollbarDemo /> };
export const VerticalRTL: Story = { render: () => <ScrollbarDemo dir="rtl" /> };
export const HorizontalLTR: Story = { render: () => <ScrollbarDemo orientation="horizontal" viewportLength={260} contentLength={780} /> };
export const HorizontalRTL: Story = { render: () => <ScrollbarDemo dir="rtl" orientation="horizontal" viewportLength={260} contentLength={780} /> };
export const NoOverflow: Story = { render: () => <ScrollbarDemo contentLength={160} /> };
export const MinThumb: Story = { render: () => <ScrollbarDemo contentLength={1600} thumbMinLength={36} /> };
export const MaxThumb: Story = { render: () => <ScrollbarDemo contentLength={176} thumbMaxLengthFraction={0.5} /> };
export const FadeDisabled: Story = { render: () => <ScrollbarDemo isFadeEnabled={false} /> };
export const FadeEnabled: Story = { render: () => <ScrollbarDemo fadeDelay={120} fadeDuration={100} isFadeEnabled /> };
export const ReducedMotion: Story = { render: () => <ScrollbarDemo fadeDelay={120} fadeDuration={100} isFadeEnabled /> };

function MutationDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(2);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <button data-testid="add-content" onClick={() => setItems((value) => value + 3)}>Add content</button>
      <div style={{ position: 'relative', inlineSize: 240, blockSize: 160, overflow: 'hidden' }}>
        <div
          data-testid="scrollbar-scroller"
          ref={scrollRef}
          style={{ position: 'absolute', inset: 0, overflowY: 'auto', scrollbarWidth: 'none' }}
        >
          <div data-testid="scrollbar-content">
            {Array.from({ length: items }, (_, index) => (
              <div key={index} style={{ blockSize: 64 }}>Row {index + 1}</div>
            ))}
          </div>
        </div>
        <NonInteractiveScrollbar data-testid="scrollbar" isFadeEnabled={false} scrollRef={scrollRef} />
      </div>
    </div>
  );
}

export const ResizeAndMutation: Story = { render: () => <MutationDemo /> };
