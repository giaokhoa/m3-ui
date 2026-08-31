import { describe, expect, it, vi } from 'vitest';
import { requestPaneDestinationFocus } from './ThreePaneScaffold.focus';

interface RectInput {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CandidateOptions {
  tabIndex?: number;
  programmaticallyFocusable?: boolean;
  disabled?: boolean;
}

function rect({ left, top, width, height }: RectInput): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function candidate(
  bounds: RectInput,
  {
    tabIndex = 0,
    programmaticallyFocusable = true,
    disabled = false,
  }: CandidateOptions = {},
) {
  const focus = vi.fn();
  return {
    tabIndex,
    matches: (selector: string) =>
      selector === ':disabled' ? disabled : programmaticallyFocusable,
    closest: () => null,
    getBoundingClientRect: () => rect(bounds),
    focus,
  } as unknown as HTMLElement & { focus: ReturnType<typeof vi.fn> };
}

function pane(candidates: HTMLElement[]) {
  return {
    getBoundingClientRect: () => rect({ left: 0, top: 0, width: 600, height: 400 }),
    querySelectorAll: () => candidates,
  } as unknown as HTMLElement;
}

describe('ThreePaneScaffold destination focus', () => {
  it('focuses the weighted spatial focus-enter child instead of the pane wrapper', () => {
    const farther = candidate({ left: 180, top: 0, width: 80, height: 40 });
    const nearer = candidate({ left: 20, top: 80, width: 80, height: 40 });

    expect(requestPaneDestinationFocus(pane([farther, nearer]))).toBe(true);
    expect(nearer.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(farther.focus).not.toHaveBeenCalled();
  });

  it('gives an exclusive horizontal source-beam candidate priority', () => {
    const numericallyNearer = candidate({ left: 10, top: 20, width: 80, height: 40 });
    const inBeam = candidate({ left: 200, top: -10, width: 80, height: 20 });

    expect(requestPaneDestinationFocus(pane([numericallyNearer, inBeam]))).toBe(true);
    expect(inBeam.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(numericallyNearer.focus).not.toHaveBeenCalled();
  });

  it('excludes children that overlap left of the focus-enter origin', () => {
    const overlapping = candidate({ left: -10, top: 0, width: 100, height: 40 });
    const valid = candidate({ left: 30, top: 30, width: 80, height: 40 });

    expect(requestPaneDestinationFocus(pane([overlapping, valid]))).toBe(true);
    expect(valid.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(overlapping.focus).not.toHaveBeenCalled();
  });

  it('focuses a sole accessible child without spatial filtering', () => {
    const only = candidate({ left: -100, top: 0, width: 0, height: 0 });

    expect(requestPaneDestinationFocus(pane([only]))).toBe(true);
    expect(only.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('includes explicit tabindex=-1 descendants in programmatic focus enter', () => {
    const programmaticOnly = candidate(
      { left: 20, top: 20, width: 80, height: 40 },
      { tabIndex: -1 },
    );

    expect(requestPaneDestinationFocus(pane([programmaticOnly]))).toBe(true);
    expect(programmaticOnly.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('ignores generic descendants that merely report the default tabIndex=-1', () => {
    const generic = candidate(
      { left: 20, top: 20, width: 80, height: 40 },
      { tabIndex: -1, programmaticallyFocusable: false },
    );

    expect(requestPaneDestinationFocus(pane([generic]))).toBe(false);
    expect(generic.focus).not.toHaveBeenCalled();
  });

  it('ignores disabled focus targets', () => {
    const disabled = candidate(
      { left: 20, top: 20, width: 80, height: 40 },
      { disabled: true },
    );

    expect(requestPaneDestinationFocus(pane([disabled]))).toBe(false);
    expect(disabled.focus).not.toHaveBeenCalled();
  });
});
