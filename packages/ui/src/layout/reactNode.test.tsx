import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import { hasReactNodeContent } from './reactNode';

describe('hasReactNodeContent', () => {
  it('treats React conditional empty nodes as absent', () => {
    expect(hasReactNodeContent(null)).toBe(false);
    expect(hasReactNodeContent(undefined)).toBe(false);
    expect(hasReactNodeContent(false)).toBe(false);
    expect(hasReactNodeContent(true)).toBe(false);
    expect(hasReactNodeContent('')).toBe(false);
    expect(hasReactNodeContent([false, null, ''])).toBe(false);
    expect(hasReactNodeContent(<Fragment>{false}</Fragment>)).toBe(false);
    expect(hasReactNodeContent(new Set([false, null]))).toBe(false);
  });

  it('keeps visible primitive and nested content', () => {
    expect(hasReactNodeContent(0)).toBe(true);
    expect(hasReactNodeContent(' ')).toBe(true);
    expect(hasReactNodeContent(<Fragment>{0}</Fragment>)).toBe(true);
    expect(hasReactNodeContent([false, <span key="visible">visible</span>])).toBe(true);
  });
});
