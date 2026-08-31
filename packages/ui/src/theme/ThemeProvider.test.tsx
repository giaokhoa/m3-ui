import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider ownership boundary', () => {
  it('uses generated CSS for the static baseline instead of inline role serialization', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider mode="light">
        <span>content</span>
      </ThemeProvider>,
    );

    expect(markup).toContain('data-m3-theme=""');
    expect(markup).toContain('data-theme="light"');
    expect(markup).not.toContain('--primary:');
    expect(markup).not.toContain('--font-family-plain:');
  });

  it('serializes runtime role overrides when sourceColor is provided', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider sourceColor="#6750a4">
        <span>content</span>
      </ThemeProvider>,
    );

    expect(markup).toContain('--primary:');
    expect(markup).toContain('--surface:');
  });

  it('keeps explicit instance custom-property overrides inline', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider style={{ '--primary': 'hotpink' }}>
        <span>content</span>
      </ThemeProvider>,
    );

    expect(markup).toContain('--primary:hotpink');
  });
});
