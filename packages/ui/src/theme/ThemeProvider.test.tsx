import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider ownership boundary', () => {
  it('supports an externally rendered portal container without creating a body portal', () => {
    const content = (
      <ThemeProvider mode="light" portalContainer={null}>
        <span>content</span>
      </ThemeProvider>
    );

    vi.stubGlobal('document', { body: { nodeType: 1 } });
    try {
      const markup = renderToStaticMarkup(content);
      expect(markup).toContain('<span>content</span>');
      expect(markup).not.toContain('data-m3-theme-portal');
    } finally {
      vi.unstubAllGlobals();
    }
  });

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
