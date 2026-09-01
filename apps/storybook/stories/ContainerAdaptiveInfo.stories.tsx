import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useContainerAdaptiveInfo } from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/ContainerAdaptiveInfo',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function AdaptiveRegion({ label, width }: { label: string; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const info = useContainerAdaptiveInfo(ref);
  const isExpanded =
    info.containerSizeClass.width === 'expanded' ||
    info.containerSizeClass.width === 'large' ||
    info.containerSizeClass.width === 'extra-large';

  return (
    <div
      ref={ref}
      className="container-adaptive-region"
      style={{
        width,
        minHeight: 240,
        flex: '0 0 auto',
        boxSizing: 'border-box',
        padding: 24,
        border: '1px solid var(--outline-variant)',
        borderRadius: 24,
        background: 'var(--surface-container)',
        color: 'var(--on-surface)',
      }}
    >
      <strong>{label}</strong>
      <p style={{ marginBlock: '8px 20px' }}>
        {Math.round(info.containerSize.width)}px →{' '}
        <code>{info.containerSizeClass.width}</code>
      </p>
      <div className="container-adaptive-content">
        <div className="container-adaptive-pane">Primary</div>
        {isExpanded ? (
          <div className="container-adaptive-pane">Supporting (JS state)</div>
        ) : null}
        <div className="container-adaptive-css-pane">CSS @container pane</div>
      </div>
    </div>
  );
}

export const IndependentOfViewport: Story = {
  render: () => (
    <>
      <style>{`
        .container-adaptive-region {
          container-type: inline-size;
        }

        .container-adaptive-content {
          display: grid;
          gap: 12px;
        }

        .container-adaptive-pane,
        .container-adaptive-css-pane {
          min-height: 72px;
          padding: 16px;
          box-sizing: border-box;
          border-radius: 16px;
          background: var(--surface-container-high);
        }

        .container-adaptive-css-pane {
          display: none;
        }

        @container (min-width: 840px) {
          .container-adaptive-content {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .container-adaptive-css-pane {
            display: block;
          }
        }
      `}</style>
      <div style={{ padding: 24, overflowX: 'auto' }}>
        <p style={{ maxWidth: 760, marginTop: 0 }}>
          The browser viewport is shared. Each copy measures only its own container,
          while the CSS-only pane uses the same 840px Material threshold natively.
        </p>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <AdaptiveRegion label="Embedded compact region" width={520} />
          <AdaptiveRegion label="Embedded expanded region" width={920} />
        </div>
      </div>
    </>
  ),
};
