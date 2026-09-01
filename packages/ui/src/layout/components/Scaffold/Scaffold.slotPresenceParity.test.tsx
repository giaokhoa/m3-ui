import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Scaffold } from './Scaffold';

describe('Scaffold slot presence parity', () => {
  it('does not reserve layout for boolean React conditionals that render nothing', () => {
    const markup = renderToStaticMarkup(
      <Scaffold
        topBar={false}
        bottomBar={false}
        snackbarHost={false}
        floatingActionButton={false}
      >
        Body
      </Scaffold>,
    );

    expect(markup).not.toContain('data-has-top-bar');
    expect(markup).not.toContain('data-has-bottom-bar');
    expect(markup).not.toContain('data-has-fab');
    expect(markup).not.toContain('data-has-snackbar');
    expect(markup).not.toContain('scaffold__top-bar');
    expect(markup).not.toContain('scaffold__bottom-bar');
    expect(markup).not.toContain('scaffold__floating-layer');
  });

  it('keeps zero-valued slot content because React renders it visibly', () => {
    const markup = renderToStaticMarkup(<Scaffold topBar={0}>Body</Scaffold>);

    expect(markup).toContain('data-has-top-bar="true"');
    expect(markup).toContain('<div class="scaffold__top-bar">0</div>');
  });
});
