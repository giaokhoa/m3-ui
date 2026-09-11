import { describe, expect, it } from 'vitest';
import { resolveRippleStateInteraction } from './Ripple';

describe('Ripple current-state resolution', () => {
  it('uses hover state-layer precedence while focus remains independently available to the focus indication', () => {
    expect(resolveRippleStateInteraction({
      isHovered: true,
      isFocusVisible: true,
    })).toBe('hover');
  });

  it('falls back to focus when hover is absent', () => {
    expect(resolveRippleStateInteraction({
      isHovered: false,
      isFocusVisible: true,
    })).toBe('focus');
  });

  it('returns no state layer when neither interaction is active', () => {
    expect(resolveRippleStateInteraction({})).toBeNull();
  });
});
