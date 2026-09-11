import { describe, expect, it } from 'vitest';
import { getScrollFieldStyle } from './ScrollField.defaults';
import { clampScrollFieldDrag, normalizeScrollFieldIndex, settleScrollFieldSteps } from './ScrollField.logic';

describe('ScrollField state math', () => {
  it('keeps public indices inside the unique item range', () => {
    expect(normalizeScrollFieldIndex(0, 5)).toBe(0);
    expect(normalizeScrollFieldIndex(5, 5)).toBe(0);
    expect(normalizeScrollFieldIndex(-1, 5)).toBe(4);
    expect(normalizeScrollFieldIndex(13, 5)).toBe(3);
  });

  it('settles pointer/wheel offsets to the nearest item', () => {
    expect(settleScrollFieldSteps(20, 60)).toBe(0);
    expect(settleScrollFieldSteps(31, 60)).toBe(1);
    expect(settleScrollFieldSteps(-31, 60)).toBe(-1);
  });

  it('caps visual drag without changing settle math', () => {
    expect(clampScrollFieldDrag(999, 50)).toBe(100);
    expect(clampScrollFieldDrag(-999, 50)).toBe(-100);
  });

  it('keeps immutable visual defaults out of the runtime style bag', () => {
    expect(getScrollFieldStyle()).toEqual({});
  });

  it('serializes only explicit instance color overrides', () => {
    expect(
      getScrollFieldStyle({
        containerColor: 'red',
        disabledContentColor: 'blue',
      }),
    ).toEqual({
      '--scroll-field-container': 'red',
      '--scroll-field-disabled-content': 'blue',
    });
  });
});
