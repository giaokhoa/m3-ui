import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Scaffold } from './Scaffold';

describe('Scaffold inset parity', () => {
  it('passes calculated CSS padding handles to render-prop content without applying them itself', () => {
    const markup = renderToStaticMarkup(
      <Scaffold topBar={<div>Top</div>} bottomBar={<div>Bottom</div>}>
        {(padding) => <main style={padding.style}>Body</main>}
      </Scaffold>,
    );

    expect(markup).toContain('class="scaffold__content"');
    expect(markup).toContain('padding-block-start:var(--scaffold-inner-padding-top)');
    expect(markup).toContain('padding-block-end:var(--scaffold-inner-padding-bottom)');
    expect(markup).not.toContain('scaffold__content" style="padding');
  });

  it('serializes configurable physical contentWindowInsets for SSR', () => {
    const markup = renderToStaticMarkup(
      <Scaffold contentWindowInsets={{ top: 10, right: '2rem', bottom: 0, left: 4 }}>
        Body
      </Scaffold>,
    );

    expect(markup).toContain('--scaffold-inset-top:10px');
    expect(markup).toContain('--scaffold-inset-right:2rem');
    expect(markup).toContain('--scaffold-inset-bottom:0px');
    expect(markup).toContain('--scaffold-inset-left:4px');
  });

  it('serializes ancestor-consumed insets independently from requested insets', () => {
    const markup = renderToStaticMarkup(
      <Scaffold
        contentWindowInsets={{ top: 20, right: 14, bottom: 18, left: 12 }}
        consumedWindowInsets={{ top: 20, right: 4, bottom: 8, left: 2 }}
      >
        Body
      </Scaffold>,
    );

    expect(markup).toContain('--scaffold-consumed-top:20px');
    expect(markup).toContain('--scaffold-consumed-right:4px');
    expect(markup).toContain('--scaffold-consumed-bottom:8px');
    expect(markup).toContain('--scaffold-consumed-left:2px');
  });

  it('supports explicit edge-to-edge opt out', () => {
    const markup = renderToStaticMarkup(
      <Scaffold contentWindowInsets={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        Body
      </Scaffold>,
    );

    expect(markup.match(/--scaffold-inset-(top|right|bottom|left):0px/g)).toHaveLength(4);
  });
});
